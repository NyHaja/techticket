# TechTicket

Service desk interne (ITSM) : les employés déclarent leurs incidents informatiques,
les techniciens les traitent, l'administrateur suit les indicateurs.

## Stack
- **Frontend** : React, TypeScript, Vite, Tailwind, TanStack Query
- **Backend** : NestJS, Prisma, PostgreSQL, Redis (sessions)
- **Infra** : Docker (multi-stage), Caddy (HTTPS automatique), VPS Ubuntu durci
- **Qualité** : GitHub Actions (lint, typecheck, build), hook pre-push, ADR

## Fonctionnalités
- [x] Authentification par session, rôles (employé, technicien, admin)
- [x] Déploiement en production sur VPS, HTTPS
- [ ] Création et suivi des tickets (en cours)

## Lancer en local
<les commandes : docker compose up -d, pnpm install, prisma migrate, seed, pnpm dev>

## Documentation
- [Runbook de déploiement](docs/deploy.md)
- [Décisions d'architecture](docs/adr/)