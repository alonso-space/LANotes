import notesService from '../services/notesService.js';
import { isValidId, parseNoteInput } from '../utils/validators.js';

const notFound = (res) => res.status(404).json({ error: 'Nota no encontrada' });

async function list(req, res) {
  res.json(await notesService.listNotes(req.session.user.id));
}

async function create(req, res) {
  const { value, error } = parseNoteInput(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const note = await notesService.createNote(req.session.user.id, value);

  res.status(201).json(note);
}

async function update(req, res) {
  if (!isValidId(req.params.id)) {
    return notFound(res);
  }

  const { value, error } = parseNoteInput(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const note = await notesService.updateNote(req.session.user.id, req.params.id, value);

  // 404 también cuando la nota es de otra persona: no se revela que existe
  return note ? res.json(note) : notFound(res);
}

async function remove(req, res) {
  if (!isValidId(req.params.id)) {
    return notFound(res);
  }

  const deleted = await notesService.deleteNote(req.session.user.id, req.params.id);

  return deleted ? res.status(204).end() : notFound(res);
}

async function addFavorite(req, res) {
  if (!isValidId(req.params.id)) {
    return notFound(res);
  }

  const found = await notesService.addFavorite(req.session.user.id, req.params.id);

  return found ? res.status(204).end() : notFound(res);
}

async function removeFavorite(req, res) {
  if (!isValidId(req.params.id)) {
    return notFound(res);
  }

  await notesService.removeFavorite(req.session.user.id, req.params.id);

  return res.status(204).end();
}

export default { list, create, update, remove, addFavorite, removeFavorite };
