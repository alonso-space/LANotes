import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo Vite usa los mismos certificados que el servidor (npm run cert, en /server).
// Así el navegador siempre habla HTTPS y la cookie de sesión (Secure) funciona igual que en producción.
const certDir = fileURLToPath(new URL('../server/certs/', import.meta.url));
const keyPath = `${certDir}server.key`;
const certPath = `${certDir}server.crt`;
const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

export default defineConfig({
  plugins: [react()],
  server: {
    https: hasCerts ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) } : undefined,
    proxy: {
      // El puerto debe coincidir con APP_PORT del .env del servidor.
      // No se usa changeOrigin: el servidor compara Origin con Host (protección CSRF)
      // y ambos deben seguir siendo el de Vite.
      '/api': { target: 'https://localhost:3000', secure: false },
    },
  },
});
