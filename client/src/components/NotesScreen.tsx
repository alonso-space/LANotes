import { useEffect, useState } from 'react';
import { ApiError } from '../services/api';
import type { User } from '../services/authService';
import {
  createNote,
  deleteNote,
  listNotes,
  setFavorite,
  updateNote,
  type Note,
  type NoteInput,
} from '../services/notesService';
import NoteEditor from './NoteEditor';
import ThemeToggle from './ThemeToggle';

interface Props {
  user: User;
  onLogout: () => void;
  onSessionExpired: () => void;
}

type Status = 'loading' | 'ready' | 'error';

const dateFormat = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' });

// Mismo orden que devuelve el servidor: favoritas primero, luego las más recientes
function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) =>
      Number(b.isFavorite) - Number(a.isFavorite) ||
      Date.parse(b.updatedAt) - Date.parse(a.updatedAt) ||
      b.id - a.id,
  );
}

function NotesScreen({ user, onLogout, onSessionExpired }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [editing, setEditing] = useState<Note | 'new' | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await listNotes();
        if (!cancelled) {
          setNotes(sortNotes(data));
          setStatus('ready');
        }
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError && error.status === 401) {
          onSessionExpired();
        } else {
          setStatus('error');
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, onSessionExpired]);

  // Si la sesión caducó mientras se escribía, se vuelve al login; en cualquier caso el error
  // se relanza para que el editor lo muestre.
  async function guard<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onSessionExpired();
      }
      throw error;
    }
  }

  async function handleSave(input: NoteInput) {
    const saved = await guard(() =>
      editing !== null && editing !== 'new' ? updateNote(editing.id, input) : createNote(input),
    );

    setNotes((current) => sortNotes([saved, ...current.filter((note) => note.id !== saved.id)]));
    setEditing(null);
  }

  async function handleDelete() {
    if (editing === null || editing === 'new') return;

    const { id } = editing;
    await guard(() => deleteNote(id));

    setNotes((current) => current.filter((note) => note.id !== id));
    setEditing(null);
  }

  // Actualización optimista: el cambio se ve al instante y se revierte si el servidor falla
  async function handleToggleFavorite(note: Note) {
    const next = !note.isFavorite;
    const apply = (value: boolean) =>
      setNotes((current) =>
        sortNotes(current.map((n) => (n.id === note.id ? { ...n, isFavorite: value } : n))),
      );

    apply(next);

    try {
      await guard(() => setFavorite(note.id, next));
    } catch {
      apply(!next);
    }
  }

  return (
    <>
      <header className="app-bar">
        <span className="wordmark">LANotes</span>
        <div className="app-bar-user">
          <span>{user.username}</span>
          <ThemeToggle />
          <button type="button" className="btn btn-ghost" onClick={onLogout}>
            Cerrar sesión
          </button>
          <a
            href="https://alonso-space.github.io/alonso-space/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            Creador del Proyecto
          </a>
        </div>
      </header>

      <main className="notes-page">
        <div className="notes-toolbar">
          <h1>Mis notas</h1>
          <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nueva nota
          </button>
        </div>

        {status === 'loading' && <p className="status-message">Buscando tus notas…</p>}

        {status === 'error' && (
          <p className="status-message" role="alert">
            No se pudieron cargar tus notas.{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setStatus('loading');
                setReloadKey((key) => key + 1);
              }}
            >
              Reintentar
            </button>
          </p>
        )}

        {status === 'ready' && notes.length === 0 && (
          <p className="status-message">Todavía no tienes notas. Crea la primera.</p>
        )}

        {status === 'ready' && notes.length > 0 && (
          <ul className="notes-grid">
            {notes.map((note) => (
              <li key={note.id} className="note-item">
                <button type="button" className="note" onClick={() => setEditing(note)}>
                  <span className="note-title">{note.title}</span>
                  <span className="note-preview">{note.content}</span>
                  <time className="note-date" dateTime={note.updatedAt}>
                    {dateFormat.format(new Date(note.updatedAt))}
                  </time>
                </button>
                {/* Botón hermano (no hijo) de la nota: un botón dentro de otro no es HTML válido */}
                <button
                  type="button"
                  className={`fav-btn${note.isFavorite ? ' is-active' : ''}`}
                  aria-pressed={note.isFavorite}
                  aria-label={note.isFavorite ? 'Quitar de favoritas' : 'Marcar como favorita'}
                  onClick={() => void handleToggleFavorite(note)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.15 1 5.85L12 16.9l-5.25 2.8 1-5.85L3.5 9.7l5.9-.9L12 3.5z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {editing !== null && (
        <NoteEditor
          key={editing === 'new' ? 'new' : editing.id}
          note={editing === 'new' ? null : editing}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

export default NotesScreen;
