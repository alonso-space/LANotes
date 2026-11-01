import pool from '../database/pool.js';
import { hashPassword } from '../utils/password.js';

async function createUser(username, password) {
  const passwordHash = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (username, password_hash, role_id)
     VALUES ($1, $2, (SELECT id_role FROM roles WHERE role_name = 'member'))
     RETURNING id_user AS id, username`,
    [username, passwordHash],
  );

  return result.rows[0];
}

async function getUserById(userId) {
  const result = await pool.query('SELECT id_user AS id, username FROM users WHERE id_user = $1', [
    userId,
  ]);

  return result.rows[0] ?? null;
}

export default { createUser, getUserById };
