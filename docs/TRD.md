# TRD — Technical Requirements Document

> Source : `Architecture Technique TechTicket.pdf` et l'état du dépôt.
> Statut : ✅ en place · 🟡 en partie · ⬜ prévu, pas encore fait.

## 1. Architecture générale

**Monolithe modulaire** : un seul backend découpé en modules, plus un frontend SPA. C'est adapté à la taille du projet (3 rôles, 5 pages) et bien plus simple à développer et déployer que des microservices.

```
 Navigateur (Chrome / Firefox / Edge)
 SPA React + TypeScript
        │ HTTPS / REST (JSON)        │ SSE (notifications)
        ▼                            ▼
 Reverse proxy Nginx : TLS, fichiers statiques, gzip
        │
        ▼
 API NestJS : Auth │ Tickets │ Commentaires │ Notifications │ Utilisateurs │ Rapports │ Config
        │                 │                    │
        ▼                 ▼                    ▼
   PostgreSQL           Redis              MinIO (S3)
   (données)     (sessions, cache,      (pièces jointes)
                  file de tâches)
```

## 2. Organisation du dépôt (monorepo pnpm)

```
Projet TechTicket/
├─ apps/
│  ├─ api/                 Backend NestJS
│  │  ├─ prisma/           schema.prisma, migrations/, seed.ts
│  │  ├─ src/config/       validation des variables d'environnement (zod)
│  │  └─ src/generated/    client Prisma généré (ne pas modifier à la main)
│  └─ web/                 Frontend React + Vite
│     └─ src/{pages,components,layout,types}
├─ packages/shared/        Types et enums partagés (vide pour l'instant)
├─ docs/                   Cahier des charges, architecture, ces documents
├─ docker-compose.yml      PostgreSQL + Redis
└─ .github/workflows/      CI
```

## 3. Outils et versions

### Environnement

| Outil | Version | Rôle | Statut |
|---|---|---|---|
| Node.js | 24 | Exécution JS (CI et local) | ✅ |
| pnpm | 12.9.1 (fixé dans `package.json`) | Gestionnaire de paquets, workspaces | ✅ |
| Docker / Docker Compose | — | Lancer PostgreSQL et Redis en local | ✅ |
| Git + GitHub | — | Versionnement, PR, CI | ✅ |

### Frontend — `apps/web`

| Outil | Version | Rôle | Statut |
|---|---|---|---|
| React | 19 | Bibliothèque d'interface | ✅ |
| TypeScript | 6 | Typage | ✅ |
| Vite | 8 | Serveur de dev et build | ✅ |
| React Router | 8 | Routage des pages | ✅ |
| Tailwind CSS | 4 (plugin `@tailwindcss/vite`) | Styles utilitaires | ✅ |
| lucide-react | 1 | Icônes | ✅ |
| ESLint | 10 (+ react-hooks, react-refresh) | Lint | ✅ |
| shadcn/ui | — | Composants accessibles (boutons, modales, tableaux) | ⬜ |
| TanStack Query | — | Appels API, cache, rafraîchissement des statuts | ⬜ |
| Recharts | — | Graphiques de la page Rapports | ⬜ |
| i18next | — | Traductions (français par défaut) | ⬜ |

### Backend — `apps/api`

| Outil | Version | Rôle | Statut |
|---|---|---|---|
| NestJS | 12 | Framework API modulaire (modules, guards, pipes) | ✅ |
| @nestjs/config + zod | — | Chargement et validation du `.env` au démarrage | ✅ |
| Prisma | 7 (+ `@prisma/adapter-pg`) | ORM, migrations, client typé | ✅ |
| PostgreSQL | 17 | Base de données relationnelle | ✅ |
| Redis | 8 | Sessions, cache des stats, file de tâches | 🟡 conteneur prêt, pas encore utilisé par le code |
| argon2 | 0.45 | Hachage des mots de passe | 🟡 utilisé par le seed |
| Vitest + Supertest | 4 / 7 | Tests unitaires et tests d'API | 🟡 configurés |
| oxlint | 1 | Lint rapide, avec types | ✅ |
| Prettier | 3 | Formatage | ✅ |
| tsx | 4 | Exécuter `seed.ts` | ✅ |
| class-validator | — | Validation des DTO entrants | ⬜ |
| Helmet, rate-limit, CSRF | — | Sécurité HTTP | ⬜ |
| BullMQ | — | Tâches asynchrones (exports, rappels) | ⬜ |
| MinIO | — | Stockage des pièces jointes (compatible S3) | ⬜ |

### Qualité / déploiement

| Outil | Rôle | Statut |
|---|---|---|
| GitHub Actions | CI à chaque PR vers `main` : install, `prisma generate`, typecheck, build | ✅ |
| Playwright | Tests E2E des parcours clés | ⬜ |
| Nginx | Reverse proxy, TLS | ⬜ |
| Prometheus + Grafana | Supervision | ⬜ |

## 4. Variables d'environnement (`apps/api/.env`)

Validées au démarrage par `src/config/env.ts`. Si l'une est invalide, l'API refuse de démarrer.

| Variable | Obligatoire | Exemple | Règle |
|---|---|---|---|
| `NODE_ENV` | non | `development` | `development`, `test` ou `production` |
| `PORT` | non | `3000` | entier positif, 3000 par défaut |
| `DATABASE_URL` | oui | `postgresql://techticket:techticket@localhost:5432/techticket?schema=public` | commence par `postgresql://` |
| `REDIS_URL` | oui | `redis://localhost:6379` | commence par `redis://` |
| `SESSION_SECRET` | oui | 64 caractères hexadécimaux | 32 caractères minimum |

## 5. API REST (contrat cible)

| Méthode | Route | Rôles | Rôle de la route |
|---|---|---|---|
| POST | `/auth/login` | public | Connexion, crée la session |
| POST | `/auth/logout` | connecté | Détruit la session |
| GET | `/auth/me` | connecté | Utilisateur courant et son rôle |
| GET | `/tickets?status=&priority=&assignee=&q=&page=` | tous (filtré selon le rôle) | Liste paginée |
| POST | `/tickets` | EMPLOYE | Créer un ticket |
| GET | `/tickets/:id` | tous (si autorisé) | Détail + fil de discussion |
| PATCH | `/tickets/:id` | TECH, ADMIN | Statut, priorité, échéance |
| POST | `/tickets/:id/assign` | TECH, ADMIN | Prise en charge / réattribution |
| POST | `/tickets/:id/resolve` | TECH, ADMIN | Résoudre, avec la solution |
| POST | `/tickets/:id/reopen` | EMPLOYE (demandeur) | Rouvrir, refusé après 72 h |
| POST | `/tickets/:id/comments` | tous | `{ content, internal }` (`internal` réservé à TECH/ADMIN) |
| POST | `/tickets/:id/attachments` | tous | Ajouter une pièce jointe |
| POST | `/tickets/:id/feedback` | EMPLOYE (demandeur) | Note 1-5 + commentaire |
| GET | `/notifications` | connecté | Ses notifications |
| PATCH | `/notifications/:id/read` | connecté | Marquer comme lue |
| GET | `/notifications/stream` | connecté | Flux SSE temps réel |
| GET | `/stats/summary`, `/stats/by-category`, `/stats/resolution-times` | ADMIN | Statistiques |
| GET | `/reports/export?format=csv\|pdf` | ADMIN | Export |
| CRUD | `/users`, `/categories`, `/priorities` | ADMIN | Administration |

Conventions : JSON partout, erreurs au format standard NestJS (`statusCode`, `message`), pagination côté serveur.

## 6. Exigences techniques

### Sécurité
- Mots de passe hachés avec **argon2**.
- Session dans un cookie `HttpOnly` + `Secure` + `SameSite`, contenu stocké dans **Redis**.
- **RBAC** : un guard NestJS vérifie le rôle sur chaque route.
- **Cloisonnement dans les requêtes SQL**, par exemple `requesterId = moi` pour un employé. Le frontend ne sert qu'à l'affichage.
- Notes internes exclues des requêtes pour les employés.
- Pièces jointes : liste blanche de types MIME, taille maximale, renommage, URL de téléchargement signée, antivirus ClamAV si possible.
- Validation de toutes les entrées (DTO), rate-limiting sur `/auth/login`, protection CSRF, en-têtes Helmet, HTTPS obligatoire.

### Performance (objectif : < 2 s pour 95 % des requêtes)
- Index `(status, priorityId, assigneeId, createdAt)` sur `Ticket` (déjà présent).
- Pagination côté serveur.
- Cache Redis des statistiques (TTL de 1 à 5 min).
- Découpage du JS par route côté frontend.

### Disponibilité (objectif : 99,5 % en heures ouvrées)
- Redémarrage automatique des conteneurs, health checks (déjà présents sur PostgreSQL et Redis).
- Sauvegardes PostgreSQL quotidiennes (`pg_dump` + WAL).
- Logs centralisés et supervision.

### Tests
- Unitaires : Vitest.
- Intégration API : Supertest avec une vraie base PostgreSQL en conteneur.
- E2E : Playwright sur 3 parcours : créer un ticket, le traiter, le rouvrir.

## 7. Décisions encore ouvertes

| Sujet | Options |
|---|---|
| Hébergement | Cloud, serveur interne ou on-premise. Ce choix fixe aussi le stockage des fichiers et des sauvegardes. |
| Authentification | Comptes locaux (choix actuel) ou SSO (Azure AD, LDAP) plus tard |
| Notifications | In-app seulement, ou aussi par e-mail |
| Temps réel | SSE (recommandé : un seul sens serveur → client suffit) ou WebSocket |
