import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import pool from '../src/database/pool.js';
import { hashPassword } from '../src/utils/password.js';
import { normalizeUsername, validateRegistration } from '../src/utils/validators.js';

const schemaPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/database/schema.sql',
);

async function createOwner() {
  const { rows } = await pool.query('SELECT COUNT(*) FROM users');

  if (Number(rows[0].count) > 0) {
    console.log('✓ Ya existen usuarios: no se crea propietario.');
    return;
  }

  const username = normalizeUsername(process.env.OWNER_USER);
  const password = process.env.OWNER_PASSWORD ?? '';

  if (!username || !password) {
    throw new Error('La base no tiene usuarios: define OWNER_USER y OWNER_PASSWORD en el .env.');
  }

  const invalid = validateRegistration(username, password);

  if (invalid) {
    throw new Error(`OWNER_USER / OWNER_PASSWORD no válidos: ${invalid}`);
  }

  await pool.query(
    `INSERT INTO users (username, password_hash, role_id)
     VALUES ($1, $2, (SELECT id_role FROM roles WHERE role_name = 'owner'))`,
    [username, await hashPassword(password)],
  );

  console.log(`✓ Propietario "${username}" creado.`);
}

try {
  await pool.query(fs.readFileSync(schemaPath, 'utf8'));
  console.log('✓ Estructura de la base de datos lista.');

  await createOwner();
} catch (error) {
  console.error('Error en bootstrap:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
