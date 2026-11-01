import { request } from './api';

export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export interface NoteInput {
  title: string;
  content: string;
}

// Mismos límites que el servidor (el servidor es quien manda; aquí solo evitan errores tontos)
export const NOTE_TITLE_MAX = 100;
export const NOTE_CONTENT_MAX = 20000;

export const listNotes = () => request<Note[]>('/notes');

export const createNote = (input: NoteInput) =>
  request<Note>('/notes', { method: 'POST', body: input });

export const updateNote = (id: number, input: NoteInput) =>
  request<Note>(`/notes/${id}`, { method: 'PUT', body: input });

export const deleteNote = (id: number) => request<void>(`/notes/${id}`, { method: 'DELETE' });

export const setFavorite = (id: number, favorite: boolean) =>
  request<void>(`/notes/${id}/favorite`, { method: favorite ? 'PUT' : 'DELETE' });
