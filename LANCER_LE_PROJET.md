# Lancer le projet TechTicket

## Prérequis

- **Node.js 24** (comme dans la CI)
- **pnpm** (la version est fixée dans `package.json` ; `corepack enable` suffit pour l'activer)
- **Docker Desktop** (pour la base PostgreSQL)

## 1. Installation (une seule fois)

```bash
# À la racine du projet
corepack enable
pnpm install
```

## 2. Démarrer la base de données

```bash
# À la racine du projet
docker compose up -d
```

PostgreSQL 17 tourne alors sur `localhost:5432` (utilisateur, mot de passe et base : `techticket`).

## 3. Préparer l'API (une seule fois, puis à chaque nouvelle migration)

```bash
cd apps/api

# Créer le fichier .env à partir de l'exemple (Windows PowerShell : Copy-Item .env.example .env)
cp .env.example .env

# Générer le client Prisma
pnpm prisma generate

# Appliquer les migrations à la base
pnpm prisma migrate dev

# Insérer les données de test
pnpm prisma db seed
```

Comptes de test créés par le seed (mot de passe : `DEVELOPPEMENT`) :

| Rôle       | Email                      |
|------------|----------------------------|
| Employé    | employe@techticket.local   |
| Technicien | tech@techticket.local      |
| Admin      | admin@techticket.local     |

## 4. Lancer l'API (terminal 1)

```bash
cd apps/api
pnpm start:dev
```

API disponible sur http://localhost:3000

## 5. Lancer le front (terminal 2)

```bash
cd apps/web
pnpm dev
```

Front disponible sur http://localhost:5173

## Au quotidien

```bash
docker compose up -d          # à la racine : démarrer la base
cd apps/api && pnpm start:dev # terminal 1
cd apps/web && pnpm dev       # terminal 2
```

Pour tout arrêter : `Ctrl+C` dans chaque terminal, puis `docker compose down` à la racine
(les données sont conservées dans le volume `pgdata`).

## Commandes utiles

```bash
# Dans apps/api
pnpm test                                     # tests unitaires
pnpm lint                                     # lint
pnpm exec tsc --noEmit                        # vérification des types (comme la CI)
pnpm prisma studio # interface pour explorer la base

# Dans apps/web
pnpm build                                    # build de production
pnpm lint                                     # lint
```
