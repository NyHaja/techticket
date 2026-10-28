# syntax=docker/dockerfile:1

############################
# Base commune
############################
FROM node:24-slim AS base
# OpenSSL est requis par le moteur de Prisma (prisma generate, prisma migrate deploy),
# et l'image "slim" ne l'inclut pas
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
# corepack lit le champ "packageManager" du package.json et installe
# EXACTEMENT ta version de pnpm (la même qu'en local et en CI)
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app

############################
# Étape 1 : build
############################
FROM base AS build

# 1) D'abord les fichiers qui changent RAREMENT → cache des dépendances
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/

# 2) Installation des dépendances de l'API uniquement ("api..." = l'API et ce dont elle dépend)
#    --frozen-lockfile : versions EXACTES du lockfile
#    --ignore-scripts  : n'exécute pas les scripts d'installation (ex. "prepare: lefthook install",
#                        qui échouerait : il n'y a pas de dépôt Git dans l'image)
RUN pnpm install --frozen-lockfile --ignore-scripts --filter "api..."

# 3) Ensuite le code, qui change SOUVENT
COPY apps/api apps/api

# 4) Générer le client Prisma, puis compiler TypeScript → JavaScript
WORKDIR /app/apps/api
RUN pnpm exec prisma generate && pnpm build

############################
# Étape 2 : image finale
############################
FROM base AS runtime
ENV NODE_ENV=production

# On ne récupère que ce qui est nécessaire pour faire tourner l'API
# --chown=node:node : les fichiers appartiennent à l'utilisateur "node", pas à root
COPY --from=build --chown=node:node /app/node_modules /app/node_modules
COPY --from=build --chown=node:node /app/apps/api/node_modules /app/apps/api/node_modules
COPY --from=build --chown=node:node /app/apps/api/package.json /app/apps/api/
COPY --from=build --chown=node:node /app/apps/api/dist /app/apps/api/dist
# Nécessaires pour "prisma migrate deploy" au moment du déploiement :
# le schéma, les migrations, et prisma.config.ts (qui fournit l'URL de la base à Prisma 7)
COPY --from=build --chown=node:node /app/apps/api/prisma /app/apps/api/prisma
COPY --from=build --chown=node:node /app/apps/api/prisma.config.ts /app/apps/api/

WORKDIR /app/apps/api

# Ne JAMAIS faire tourner l'application en root
USER node

EXPOSE 3000

# Docker vérifie régulièrement que l'API répond (node:slim n'a pas curl → on utilise fetch de Node)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/src/main.js"]