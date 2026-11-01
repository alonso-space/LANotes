import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

// Hash de relleno: si el usuario no existe igual se hace una comparación bcrypt,
// para que el tiempo de respuesta no delate qué usuarios existen.
const dummyHash = bcrypt.hash('lanotes-relleno', BCRYPT_ROUNDS);

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS);

export async function verifyPassword(password, hash) {
  const matches = await bcrypt.compare(password, hash ?? (await dummyHash));
  return hash != null && matches;
}
