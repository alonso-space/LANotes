import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ApiError } from '../services/api';
import { NOTE_CONTENT_MAX, NOTE_TITLE_MAX, type Note, type NoteInput } from '../services/notesService';

interface Props {
  note: Note | null; // null = nota nueva
  onSave: (input: NoteInput) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

// Se monta al abrir y se desmonta al cerrar: no hace falta limpiar el estado entre notas.
function NoteEditor({ note, onSave, onDelete, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  async function run(action: () => Promise<void>) {
    setError(null);
    setBusy(true);

    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Algo salió mal. Inténtalo de nuevo.');
      setBusy(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(() => onSave({ title, content }));
  }

  return (
    <dialog
      ref={dialogRef}
      className="editor"
      aria-label={note ? 'Editar nota' : 'Nueva nota'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="note-title">
          Título
        </label>
        <input
          id="note-title"
          className="editor-title"
          placeholder="Título"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={NOTE_TITLE_MAX}
        />

        <label className="sr-only" htmlFor="note-content">
          Contenido
        </label>
        <textarea
          id="note-content"
          className="editor-content"
          placeholder="Escribe aquí…"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={NOTE_CONTENT_MAX}
        />

        <p className="form-error" role="alert">
          {error}
        </p>

        <div className="editor-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar nota'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => dialogRef.current?.close()}
          >
            Cancelar
          </button>

          {note && !confirmingDelete && (
            <button
              type="button"
              className="btn btn-danger"
              disabled={busy}
              onClick={() => setConfirmingDelete(true)}
            >
              Eliminar nota
            </button>
          )}

          {note && confirmingDelete && (
            <span className="confirm-delete">
              ¿Eliminar esta nota?
              <button
                type="button"
                className="btn btn-danger"
                disabled={busy}
                onClick={() => void run(onDelete)}
              >
                Sí, eliminar
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => setConfirmingDelete(false)}
              >
                No
              </button>
            </span>
          )}
        </div>
      </form>
    </dialog>
  );
}

export default NoteEditor;
