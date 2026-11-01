import express from 'express';
import session from 'express-session';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import authRouter from './src/routes/authRouter.js';
import notesRouter from './src/routes/notesRouter.js';
import { csrfProtection } from './src/middlewares/csrf.js';
import { startServer } from './src/startServer.js';
import { SESSION_COOKIE } from './src/utils/session.js';
import { getSessionSecret } from './src/utils/sessionSecret.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, '..', 'client', 'dist');

const app = express();

app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.use(express.json({ limit: '100kb' }));
app.use(csrfProtection);

app.use(
  session({
    name: SESSION_COOKIE,
    secret: getSessionSecret(),
    resave: false,
    saveUninitialized: false,
    rolling: true, // la sesión se renueva con cada uso: caduca tras 12 h sin actividad
    cookie: {
      maxAge: 12 * 60 * 60 * 1000,
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      path: '/', // obligatorio para __Host-. No agregues "domain".
    },
  }),
);

app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);
app.use('/api', (req, res) => res.status(404).json({ error: 'No encontrado' }));

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // Cualquier otra página devuelve index.html (excepto archivos que no existen)
  app.use((req, res, next) => {
    if (req.method !== 'GET' || path.extname(req.path)) {
      return next();
    }

    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'La solicitud es demasiado grande' });
  }

  if (err.type === 'entity.parse.failed' || err.status === 400) {
    return res.status(400).json({ error: 'Solicitud no válida' });
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

startServer(app);
