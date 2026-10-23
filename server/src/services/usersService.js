import pool from '../database/pool.js';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

async function getAllUsers() {
  const result = await pool.query(`SELECT
    id_user,
    username,
    role_id,
    bio,
    registered_at
    FROM users`);
  const users = result.rows;

  return users;
}

async function getUserById(userId) {
  const result = await pool.query(`SELECT
    id_user,
    username,
    role_id,
    bio,
    registered_at
    FROM users
    WHERE id_user = $1`, [userId]);
  const user = result.rows[0];

  return user;
}

async function newUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const result = await pool.query(
    `
        INSERT INTO users (username, password_hash, role_id)
        VALUES (
            $1,
            $2,
            (SELECT id_role FROM roles WHERE role_name = 'member')
        )
        RETURNING id_user
        `,
    [username, hashedPassword],
  );

  return result.rows[0].id_user;
}



export default {
  getAllUsers,
  getUserById,
  newUser,
};