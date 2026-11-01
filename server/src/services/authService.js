import pool from '../database/pool.js';
import { verifyPassword } from '../utils/password.js';

async function login(username, password) {
  const result = await pool.query(
    'SELECT id_user AS id, username, password_hash FROM users WHERE username = $1',
    [username],
  );

  const user = result.rows[0];

  const correct = await verifyPassword(password, user?.password_hash ?? null);

  return correct ? { id: user.id, username: user.username } : null;
}

export default { login };
