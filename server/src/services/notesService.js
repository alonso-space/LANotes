import pool from '../database/pool.js';

// "isFavorite" se calcula con una subconsulta (sirve igual en SELECT y en RETURNING).
// Las notas son privadas, así que solo cuenta el favorito del propio autor.
const COLUMNS = `id_note AS id, note_name AS title, note_content AS content,
  created_at AS "createdAt", updated_at AS "updatedAt",
  EXISTS (
    SELECT 1 FROM favorites
    WHERE favorites.note_id = notes.id_note AND favorites.user_id = notes.author_id
  ) AS "isFavorite"`;

// Todas las consultas filtran por author_id: nadie ve ni toca notas ajenas.

async function listNotes(userId) {
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM notes
     WHERE author_id = $1
     ORDER BY "isFavorite" DESC, updated_at DESC, id_note DESC`,
    [userId],
  );

  return result.rows;
}

async function createNote(userId, { title, content }) {
  const result = await pool.query(
    `INSERT INTO notes (note_name, note_content, author_id)
     VALUES ($1, $2, $3)
     RETURNING ${COLUMNS}`,
    [title, content, userId],
  );

  return result.rows[0];
}

async function updateNote(userId, noteId, { title, content }) {
  const result = await pool.query(
    `UPDATE notes
     SET note_name = $1, note_content = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id_note = $3 AND author_id = $4
     RETURNING ${COLUMNS}`,
    [title, content, noteId, userId],
  );

  return result.rows[0] ?? null;
}

async function deleteNote(userId, noteId) {
  const result = await pool.query('DELETE FROM notes WHERE id_note = $1 AND author_id = $2', [
    noteId,
    userId,
  ]);

  return result.rowCount > 0;
}

async function addFavorite(userId, noteId) {
  const result = await pool.query(
    `WITH mine AS (
       SELECT id_note FROM notes WHERE id_note = $1 AND author_id = $2
     ), added AS (
       INSERT INTO favorites (user_id, note_id)
       SELECT $2::int, id_note FROM mine
       ON CONFLICT (user_id, note_id) DO NOTHING
     )
     SELECT id_note FROM mine`,
    [noteId, userId],
  );

  return result.rowCount > 0;
}

async function removeFavorite(userId, noteId) {
  await pool.query('DELETE FROM favorites WHERE note_id = $1 AND user_id = $2', [noteId, userId]);
}

export default { listNotes, createNote, updateNote, deleteNote, addFavorite, removeFavorite };
