import settings from '../../admin/getSettings.js';
import authService from '../services/authService.js';
import usersService from '../services/usersService.js';
import { regenerateSession, saveSession, endSession } from '../utils/session.js';
import { isLoginInputValid, normalizeUsername, validateRegistration } from '../utils/validators.js';

// Cambia el id de sesión al autenticarse (evita fijación de sesión)
async function startSession(req, user) {
  await regenerateSession(req);
  req.session.user = { id: user.id, username: user.username };
  await saveSession(req);
}

function getConfig(req, res) {
  res.json({ guestRegister: settings.guest_register !== false });
}

async function register(req, res) {
  const { username, password } = req.body ?? {};
  const name = normalizeUsername(username);

  const error = validateRegistration(name, password);

  if (error) {
    return res.status(400).json({ error });
  }

  let user;

  try {
    user = await usersService.createUser(name, password);
  } catch (err) {
    // 23505: el nombre de usuario ya existe
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ese usuario ya existe. Elige otro.' });
    }

    throw err;
  }

  await startSession(req, user);

  res.status(201).json(user);
}

async function login(req, res) {
  const { username, password } = req.body ?? {};
  const name = normalizeUsername(username);

  const user = isLoginInputValid(name, password) ? await authService.login(name, password) : null;

  if (!user) {
    // Mismo mensaje si el usuario no existe o la contraseña es incorrecta
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  await startSession(req, user);

  res.json(user);
}

async function logout(req, res) {
  await endSession(req, res);

  res.status(204).end();
}

async function me(req, res) {
  const user = await usersService.getUserById(req.session.user.id);

  // La cuenta pudo borrarse mientras la sesión seguía viva
  if (!user) {
    await endSession(req, res);
    return res.status(401).json({ error: 'Debes iniciar sesión' });
  }

  res.json(user);
}

export default { getConfig, register, login, logout, me };
