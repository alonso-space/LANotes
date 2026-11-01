
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;
export const PASSWORD_MIN = 8;
// bcrypt solo usa los primeros 72 bytes: más allá ignoraría el resto en silencio
export const PASSWORD_MAX_BYTES = 72;

export const NOTE_TITLE_MAX = 100; // coincide con VARCHAR(100) de la tabla notes
export const NOTE_CONTENT_MAX = 20000;

const USERNAME_RE = /^[a-z0-9_.-]+$/;

export function normalizeUsername(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function validateRegistration(username, password) {
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    return `El usuario debe tener entre ${USERNAME_MIN} y ${USERNAME_MAX} caracteres.`;
  }

  if (!USERNAME_RE.test(username)) {
    return 'El usuario solo puede tener letras sin tilde, números, punto, guion y guion bajo.';
  }

  if (typeof password !== 'string' || password.trim() === '') {
    return 'Escribe una contraseña.';
  }

  if (password.length < PASSWORD_MIN) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`;
  }

  if (Buffer.byteLength(password, 'utf8') > PASSWORD_MAX_BYTES) {
    return `La contraseña es demasiado larga (máximo ${PASSWORD_MAX_BYTES} bytes; las tildes y los emojis ocupan más de uno).`;
  }

  return null;
}

// En el login solo se comprueba la forma, no la política: así no se revela qué reglas hay
// y un error de formato responde igual que unas credenciales incorrectas.
export function isLoginInputValid(username, password) {
  return (
    username.length > 0 &&
    username.length <= USERNAME_MAX &&
    typeof password === 'string' &&
    password.length > 0 &&
    Buffer.byteLength(password, 'utf8') <= PASSWORD_MAX_BYTES
  );
}

export function parseNoteInput(body) {
  const { title, content = '' } = body ?? {};

  if (typeof title !== 'string' || typeof content !== 'string') {
    return { error: 'El título y el contenido deben ser texto.' };
  }

  const cleanTitle = title.trim();

  if (cleanTitle.length > NOTE_TITLE_MAX) {
    return { error: `El título no puede superar ${NOTE_TITLE_MAX} caracteres.` };
  }

  if (content.length > NOTE_CONTENT_MAX) {
    return { error: `La nota no puede superar ${NOTE_CONTENT_MAX} caracteres.` };
  }

  return { value: { title: cleanTitle || 'Sin título', content } };
}

// Id numérico positivo de hasta 9 dígitos (cabe en un INTEGER de Postgres)
export function isValidId(value) {
  return typeof value === 'string' && /^[1-9]\d{0,8}$/.test(value);
}
