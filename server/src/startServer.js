import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

import settings from '../admin/getSettings.js';

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export const APP_PORT = settings.app_port || 3000;

function showStartupError(error) {
  console.error('\n====================================');
  console.error('ERROR AL CONFIGURAR HTTPS');
  console.error('====================================');

  if (error.code === 'ENOENT') {
    console.error(`No se encontraron los certificados en ${path.join(projectRoot, 'certs')}.

Genéralos (desde la carpeta server) con:

    npm run cert

Si ya existían pero la IP local cambió, borra la carpeta "certs" y repite el comando.`);
  } else if (error.code === 'EACCES') {
    console.error('No tienes permisos para leer los certificados.');
  } else {
    console.error(error.message);
  }
}

export function startServer(app) {
  let server;

  try {
    server = https.createServer(
      {
        key: fs.readFileSync(path.join(projectRoot, 'certs', 'server.key')),
        cert: fs.readFileSync(path.join(projectRoot, 'certs', 'server.crt')),
      },
      app,
    );
  } catch (error) {
    showStartupError(error);
    process.exit(1);
  }

  server.on('error', (error) => {
    console.error(
      error.code === 'EADDRINUSE'
        ? `El puerto ${APP_PORT} ya está siendo utilizado.`
        : `Error al iniciar el servidor: ${error.message}`,
    );
    process.exit(1);
  });

  server.listen(APP_PORT, () => {
    console.log(`LANotes escuchando en https://localhost:${APP_PORT}/`);
  });
}
