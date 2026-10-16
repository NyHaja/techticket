# Plan d'implémentation

> Ordre de construction, état d'avancement et justification des choix techniques.
> État au 9 octobre 2026. ✅ fait · 🟡 en partie · ⬜ à faire.

## 1. Logique de l'ordre

On construit dans l'ordre des **dépendances**, et chaque étape doit livrer un parcours **utilisable de bout en bout** (API + écran), plutôt que tout le backend puis tout le frontend :

1. **Fondations** : sans base, configuration ni CI, rien ne tient.
2. **Authentification** : toutes les autres fonctionnalités dépendent de « qui est connecté et quel est son rôle ».
3. **Le cœur : le ticket.** Créer → lister → consulter. C'est le parcours qui justifie le produit.
4. **Le traitement** : commentaires, statuts, assignation. C'est le travail quotidien des techniciens.
5. **Ce qui enrichit** : pièces jointes, notifications, feedback.
6. **Ce qui pilote** : administration, statistiques, exports.
7. **Ce qui fiabilise** : sécurité renforcée, performance, tests E2E, déploiement.

Les phases 3 et 4 forment le **MVP** : à leur fin, un employé peut créer un ticket et un technicien peut le résoudre.

## 2. Phases

### Phase 0 — Fondations ✅
| Tâche | État |
|---|---|
| Monorepo pnpm (`apps/api`, `apps/web`, `packages/shared`) | ✅ |
| Docker Compose : PostgreSQL 17 + Redis 8 avec health checks | ✅ |
| Schéma Prisma complet (9 tables) + migrations | ✅ |
| Script de données de test (`seed.ts`) | ✅ |
| Validation du `.env` au démarrage (zod) | ✅ |
| Frontend : Tailwind, routage, pages vides, barre latérale filtrée par rôle | ✅ |
| CI GitHub Actions (typecheck + build) | ✅ |

**Vérification** : `docker compose up -d`, migrations, seed, `pnpm start:dev` et `pnpm dev` démarrent sans erreur.

### Phase 1 — Authentification ⬜
| Tâche | Côté |
|---|---|
| Module `auth` : `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | API |
| Vérification argon2, refus si compte désactivé | API |
| Session dans Redis + cookie `HttpOnly` | API |
| Guard global « connecté » + décorateur `@Roles()` | API |
| Rate-limiting sur le login | API |
| Page `/login`, client API (TanStack Query), route protégée, redirections | Web |
| Remplacer le rôle factice d'`AppLayout` par `GET /auth/me` | Web |
| Déplacer l'enum `Role` dans `packages/shared` | Commun |

**Vérification** : les 3 comptes du seed se connectent, chacun voit sa barre latérale, et une route ADMIN appelée par un employé renvoie 403.

### Phase 2 — Tickets : créer, lister, consulter ⬜ *(MVP 1/2)*
| Tâche | Côté |
|---|---|
| `GET /categories`, `GET /priorities` (lecture) | API |
| `POST /tickets` : génération du numéro `TT-AAAA-NNNNN`, événement `CREATED`, notification | API |
| `GET /tickets` paginé et filtré selon le rôle | API |
| `GET /tickets/:id` avec cloisonnement | API |
| Pages Nouveau ticket, Mes tickets, Gestion des tickets, Détail | Web |
| Composants partagés : badge de statut, badge de priorité, tableau, pagination | Web |

**Vérification** : un employé crée un ticket et le retrouve dans « Mes tickets » ; il obtient 404 sur le ticket d'un autre employé ; le technicien voit tous les tickets.

### Phase 3 — Traitement ⬜ *(MVP 2/2)*
| Tâche | Côté |
|---|---|
| Commentaires publics et notes internes (exclues pour l'employé) | API + Web |
| `POST /tickets/:id/assign` (prise en charge, réattribution) | API + Web |
| `PATCH /tickets/:id` : statut, priorité, échéance, avec contrôle des transitions | API + Web |
| `POST /tickets/:id/resolve` (solution obligatoire) | API + Web |
| Un `TicketEvent` pour chaque changement, affiché dans le fil | API + Web |
| Tableau de bord : compteurs, urgents, charge du technicien | API + Web |

**Vérification** : parcours complet création → prise en charge → question → réponse → résolution. Test API : un employé ne reçoit jamais de note interne.

### Phase 4 — Enrichissements ⬜
| Tâche | Côté |
|---|---|
| Réouverture (≤ 72 h) et feedback (1-5) | API + Web |
| Notifications : liste, « lue », flux temps réel SSE, cloche avec pastille | API + Web |
| Pièces jointes : MinIO dans Docker Compose, upload, URL signée, contrôles MIME / taille | API + Web |
| Toasts et sons de confirmation | Web |

**Vérification** : réouverture refusée à 73 h (test unitaire avec une date simulée) ; une notification arrive sans recharger la page.

### Phase 5 — Administration et pilotage ⬜
| Tâche | Côté |
|---|---|
| CRUD utilisateurs (création, désactivation, rôle) | API + Web |
| CRUD catégories et priorités | API + Web |
| `/stats/*` (agrégats SQL, cache Redis 1 à 5 min) | API |
| Page Rapports avec Recharts | Web |
| Export CSV puis PDF via une file BullMQ | API + Web |

**Vérification** : les chiffres du tableau de bord correspondent à une requête SQL faite à la main sur le seed.

### Phase 6 — Production ⬜
| Tâche |
|---|
| Helmet, CSRF, en-têtes, revue de sécurité |
| i18next : sortir tous les textes en dur dans `fr.json` |
| Responsive mobile, audit d'accessibilité |
| Tests E2E Playwright (créer, traiter, rouvrir) et ajout du lint + des tests dans la CI |
| Nginx + TLS, Dockerfiles api/web, sauvegardes, supervision |
| Tâches RGPD : purge et anonymisation planifiées |

## 3. Pourquoi cette techno et pas une autre

| Besoin | Choix | Alternatives écartées | Pourquoi |
|---|---|---|---|
| Architecture | **Monolithe modulaire** | Microservices | 3 rôles, 5 pages, une petite équipe : les microservices ajouteraient réseau, déploiements multiples et cohérence de données distribuée, sans gain réel. Les modules NestJS gardent un découpage propre, et un module pourra être extrait plus tard si besoin. |
| Langage | **TypeScript** partout | JS seul, Python, Java | Un seul langage du navigateur à la base. Les types (rôles, statuts) peuvent être partagés via `packages/shared`, et beaucoup d'erreurs sont attrapées à la compilation. |
| Backend | **NestJS** | Express seul, Fastify, Django, Spring Boot | Express ne donne aucune structure. NestJS apporte modules, injection de dépendances, **guards** (exactement ce qu'il faut pour le RBAC) et validation intégrée. Django ou Spring seraient valables pour une équipe Python ou Java (le document d'architecture le prévoit), mais ici l'équipe est sur JS/TS. |
| Base de données | **PostgreSQL** | MySQL, MongoDB | Les données sont très relationnelles (ticket ↔ utilisateur ↔ commentaire), les statistiques demandent des agrégats SQL (`GROUP BY`, moyennes de délais), et il faut des contraintes (`CHECK` sur la note). MongoDB serait un mauvais choix ; MySQL serait possible mais PostgreSQL est plus riche (index, types, fonctions de date). |
| ORM | **Prisma** | TypeORM, Drizzle, SQL brut | Schéma lisible, migrations versionnées, client entièrement typé. TypeORM est moins fiable avec TypeScript strict ; Drizzle est bon mais plus jeune et moins documenté. |
| Sessions | **Cookie + Redis** | JWT | Une session côté serveur se **révoque immédiatement** (compte désactivé, déconnexion), ce qui est plus difficile avec un JWT. Le cookie `HttpOnly` n'est pas lisible par du JavaScript (protection XSS). |
| Cache / file | **Redis** | Mémoire du processus, RabbitMQ | Un seul outil couvre trois besoins (sessions, cache des stats, file BullMQ). RabbitMQ serait surdimensionné. |
| Mots de passe | **argon2** | bcrypt | Recommandé par l'OWASP, résistant aux attaques GPU. bcrypt reste acceptable. |
| Fichiers | **MinIO (S3)** | Fichiers dans PostgreSQL, disque local | Une base n'est pas faite pour stocker des fichiers lourds. Le disque local empêche de lancer plusieurs instances de l'API. MinIO est compatible S3 : on peut passer à un S3 cloud sans changer le code. |
| Temps réel | **SSE** | WebSocket, rafraîchissement périodique | Les notifications vont dans un seul sens (serveur → client) : SSE suffit, passe par HTTP classique et se reconnecte tout seul. Le WebSocket est utile seulement pour du bidirectionnel (chat). |
| Frontend | **React + Vite** | Angular, Vue, Next.js | Grand écosystème, équipe à l'aise. Vite démarre et recharge très vite. Next.js apporte du rendu serveur inutile ici : application interne derrière une connexion, pas de besoin SEO. |
| Styles | **Tailwind** (+ shadcn/ui) | CSS classique, MUI | Palette et espacements centralisés, donc cohérence garantie (exigence du cahier des charges). shadcn/ui fournit des composants accessibles qu'on possède dans le code. MUI impose son propre style, plus difficile à personnaliser. |
| Données côté client | **TanStack Query** | `useEffect` + `fetch`, Redux | Gère le cache, le chargement, les erreurs et le rafraîchissement des statuts. Redux serait beaucoup de code pour des données qui viennent toutes du serveur. |
| Graphiques | **Recharts** | Chart.js, D3 | Composants React directs, suffisants pour des barres et un camembert. D3 est trop bas niveau pour ce besoin. |
| Monorepo | **pnpm workspaces** | npm, Yarn, Nx, Turborepo | Rapide, économe en disque, workspaces natifs. Nx ou Turborepo sont inutiles pour 2 applications. |
| Tests | **Vitest + Supertest + Playwright** | Jest, Cypress | Vitest est compatible Jest mais plus rapide. Playwright teste Chrome, Firefox et Edge (les navigateurs exigés par le cahier des charges). |
| Déploiement | **Docker Compose** (puis Kubernetes si besoin) | Kubernetes d'emblée | Compose suffit pour une entreprise intermédiaire et reste simple à installer. Kubernetes seulement si la charge l'impose. |

## 4. Risques et points d'attention

| Risque | Mesure |
|---|---|
| Fuite de données entre employés | Filtrage dans les requêtes + tests d'API dédiés dès la phase 2 |
| Notes internes visibles par l'employé | Exclues côté serveur + test automatique |
| Écarts entre le cahier des charges et le seed (« Normal » / « Normale », catégories) | À corriger avant la phase 2 (voir `PRD.md` § 9) |
| `argon2` non compilé (`allowBuilds: argon2: false` dans `pnpm-workspace.yaml`) | À vérifier avant la phase 1 : le login en dépend |
| Hébergement non décidé | À trancher avant la phase 4 (impacte MinIO, sauvegardes, RGPD) |
| Lint et tests absents de la CI | À ajouter dès la phase 1 pour ne pas accumuler de dette |
