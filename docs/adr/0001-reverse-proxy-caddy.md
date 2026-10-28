# ADR 0001 — Caddy comme reverse proxy

- Statut : accepté
- Date : 28/10/2026

## Contexte
Le document d'architecture prévoit Nginx (TLS, fichiers statiques, gzip).
Le projet est développé seul, à temps partiel, dans un but d'apprentissage,
avec un domaine sslip.io.

## Décision
Utiliser Caddy à la place de Nginx.

## Raisons
- Certificats HTTPS obtenus et renouvelés automatiquement (pas de Certbot ni de tâche planifiée)
- Configuration courte et lisible
- Mêmes fonctions que Nginx pour notre besoin : reverse proxy /api, fichiers statiques, compression

## Conséquences
- (+) Mise en ligne plus rapide, moins de risques d'erreur de configuration
- (−) Nginx reste plus répandu en entreprise : migration possible plus tard, à titre d'exercice
- Le principe (reverse proxy devant l'API, même origine pour le cookie) reste identique