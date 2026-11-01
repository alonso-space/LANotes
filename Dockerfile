FROM node:22-bookworm-slim AS client-build

WORKDIR /build/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build


FROM node:22-bookworm-slim

# OpenSSL: lo necesita admin/cert.js para generar el certificado HTTPS
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
WORKDIR /app/server

# Primero solo las dependencias: si cambias código pero no ellas, Docker reutiliza esta capa
COPY server/package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node server/ ./

# app.js sirve el frontend desde ../client/dist
COPY --from=client-build --chown=node:node /build/client/dist /app/client/dist

# Carpetas donde la app escribe, con dueño "node" para no correr como root
RUN mkdir -p data certs && chown node:node data certs
USER node

EXPOSE 3000

CMD ["sh", "docker-entrypoint.sh"]
