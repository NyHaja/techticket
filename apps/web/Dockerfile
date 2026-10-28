# syntax=docker/dockerfile:1

############################
# Étape 1 : build de l'application React
############################
FROM node:24-slim AS build
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app

# Dépendances d'abord (cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile --ignore-scripts --filter "web..."

# Puis le code
COPY apps/web apps/web
WORKDIR /app/apps/web
RUN pnpm build

############################
# Étape 2 : Caddy sert les fichiers et fait le reverse proxy
############################
FROM caddy:2-alpine
COPY infra/caddy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/web/dist /srv