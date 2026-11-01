# LANotes
Self-hosted notes app for your local network. No cloud: your notes stay on your own machine.

## Con Docker

Requisitos: Docker con Docker Compose.

```bash
cp .env.example .env              # edita HOST_IP, DB_PASSWORD y OWNER_PASSWORD
docker compose up -d --build
```

La app queda en `https://<HOST_IP>:3000`. En el primer arranque crea las tablas y el usuario propietario (`OWNER_USER` / `OWNER_PASSWORD`); después puedes borrar `OWNER_PASSWORD` del `.env`. El certificado es autofirmado: el navegador avisará la primera vez.

- Logs: `docker compose logs -f lanotes`
- Actualizar: `git pull && docker compose up -d --build`
- Copia de seguridad de las notas: `docker compose exec db pg_dump -U <DB_USER> <DB_DATABASE> > backup.sql`
- Si cambia la IP del equipo: actualiza `HOST_IP`, ejecuta `docker compose down`, borra el volumen de certificados (`docker volume ls | grep lanotescerts`, luego `docker volume rm <nombre>`) y vuelve a levantar.

No uses `docker compose down -v`: borra también la base de datos con tus notas.

## Sin Docker (desarrollo)

Requisitos: Node.js 22+, PostgreSQL y OpenSSL.

```bash
# 1. Servidor: dependencias, base de datos (crea .env, tablas y el usuario owner) y certificado HTTPS
cd server
npm install
npm run install-app
npm run cert

# 2. Cliente: dependencias
cd ../client
npm install
```

### Desarrollo (dos terminales)

```bash
cd server && npm run dev      # API en https://localhost:3000
cd client && npm run dev      # app en https://localhost:5173 (usa el mismo certificado)
```

El certificado es autofirmado: el navegador avisará la primera vez en cada dirección; acéptalo.

### Uso normal en la red local

```bash
cd client && npm run build
cd ../server && npm start     # sirve API y frontend en https://<IP-del-equipo>:3000
```

Si cambia la IP del equipo, borra `server/certs` y vuelve a ejecutar `npm run cert`.

## Seguridad

- Contraseñas con bcrypt; sesiones en una cookie `__Host-` (`Secure`, `HttpOnly`, `SameSite=Strict`).
- Protección CSRF por comprobación de `Origin`, límite de intentos en login y registro, y cabeceras CSP.
- Cada consulta de notas filtra por dueño: nadie puede ver ni modificar notas ajenas.
- Las sesiones viven en memoria: al reiniciar el servidor hay que volver a iniciar sesión.
