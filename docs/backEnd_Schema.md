# Backend Schema — données, accès, RGPD

> Source : `apps/api/prisma/schema.prisma`, `docker-compose.yml` et la section Sécurité de
> `Architecture Technique TechTicket.pdf`. Les mesures RGPD décrites ici sont **à mettre en œuvre**
> (aucune n'est codée pour l'instant) et à faire valider par le DPO / la direction de l'entreprise.

## 1. Où vivent les données

| Stockage | Contenu | Où (local) | Où (production, à décider) | Sauvegarde |
|---|---|---|---|---|
| **PostgreSQL 17** | Toutes les données métier : utilisateurs, tickets, commentaires, notifications, avis, historique | Conteneur `postgres`, volume Docker `pgdata` | Serveur de l'entreprise ou cloud hébergé **dans l'UE** | `pg_dump` quotidien + archivage WAL |
| **Redis 8** | Sessions de connexion, cache des statistiques, file de tâches (exports) | Conteneur `redis`, volume `redisdata` | Même hébergement que l'API | Aucune : données temporaires, perdables sans risque |
| **MinIO (S3)** *(à venir)* | Pièces jointes (captures d'écran, fichiers) | — | Bucket privé, hébergé dans l'UE | Réplication ou sauvegarde du bucket |
| **Logs applicatifs** | Requêtes, erreurs | Console | Outil de logs centralisé | Rotation automatique |
| **Navigateur** | Uniquement le cookie de session (identifiant opaque) | — | — | — |

Règle : **aucune donnée personnelle dans `localStorage`**, ni dans les URL, ni dans les logs (pas d'e-mail, pas de contenu de ticket, jamais de mot de passe).

## 2. Modèle de données

```
User ─┬─< Ticket (demandeur)        Category ─< Ticket
      ├─< Ticket (assigné)          Priority ─< Ticket
      ├─< Comment                   Ticket ─┬─< Comment ─< Attachment
      ├─< Attachment                        ├─< Attachment
      ├─< Notification                      ├─< Notification
      └─< TicketEvent                       ├─< TicketEvent
                                            └── Feedback (0 ou 1)
```

| Table | Champs principaux | Données personnelles ? |
|---|---|---|
| `User` | `name`, `email` (unique), `passwordHash`, `role`, `active`, `createdAt` | **Oui** : nom, e-mail, empreinte du mot de passe |
| `Category` | `name`, `active` | Non |
| `Priority` | `label`, `level`, `targetHours` | Non |
| `Ticket` | `number`, `title`, `description`, `status`, `priorityId`, `categoryId`, `requesterId`, `assigneeId`, `dueDate`, `resolvedAt`, `solution` | **Oui** : lien vers des personnes, et texte libre qui peut contenir des infos personnelles |
| `comments` | `content`, `internal`, `ticketId`, `authorId` | **Oui** : texte libre |
| `attachments` | `storageKey`, `fileName`, `mimeType`, `size`, `uploaderId` | **Oui** : les captures d'écran peuvent montrer des données |
| `Notification` | `type`, `read`, `userId`, `ticketId` | Oui (lien vers une personne) |
| `Feedback` | `rating` (1-5, contrainte `CHECK`), `comment` | Oui : opinion rattachée au demandeur du ticket |
| `ticket_events` | `type`, `oldValue`, `newValue`, `actorId` | Oui : trace de qui a fait quoi (audit) |

Suppressions en cascade : supprimer un ticket supprime ses commentaires, pièces jointes, notifications, avis et événements. Un `User` **ne peut pas** être supprimé tant qu'il est demandeur, auteur ou acteur : on le **désactive** (`active = false`) ou on l'**anonymise** (§ 5).

## 3. Qui peut voir quoi

Le contrôle se fait **côté serveur, dans la requête SQL** (guards NestJS + filtre Prisma). Masquer un bouton dans l'interface n'est jamais une protection.

| Donnée | Employé | Technicien | Admin |
|---|---|---|---|
| Ses propres tickets | ✔ lecture + commentaire | — | — |
| Tickets des autres employés | ✘ (le serveur renvoie 404) | ✔ tous | ✔ tous |
| Commentaires publics | ✔ sur ses tickets | ✔ | ✔ |
| **Notes internes** (`internal = true`) | ✘ exclues de la requête | ✔ | ✔ |
| Pièces jointes | ✔ de ses tickets | ✔ | ✔ |
| Historique (`ticket_events`) | ✔ de ses tickets, sans les détails internes | ✔ | ✔ |
| Avis (`Feedback`) | ✔ le sien | ✔ sur ses tickets traités | ✔ tous |
| Ses notifications | ✔ | ✔ | ✔ |
| Liste des utilisateurs | ✘ | Noms des techniciens (pour réattribuer) | ✔ complète |
| E-mail des autres | ✘ | ✘ | ✔ |
| `passwordHash` | ✘ | ✘ | ✘ — jamais renvoyé par l'API |
| Statistiques et exports | ✘ | ✘ | ✔ |
| Catégories, priorités | lecture | lecture | ✔ modification |

Exemple de filtre appliqué pour un employé :
```ts
prisma.ticket.findMany({ where: { requesterId: currentUser.id } })
prisma.comment.findMany({ where: { ticketId, internal: false } })
```

## 4. Sécurité des données

| Mesure | Détail |
|---|---|
| Mots de passe | Hachés avec **argon2**, jamais stockés ni journalisés en clair |
| Sessions | Cookie `HttpOnly`, `Secure`, `SameSite=Lax`, identifiant opaque ; contenu dans Redis ; expiration après inactivité (ex. 8 h) |
| Transport | HTTPS obligatoire (TLS terminé par Nginx) |
| Pièces jointes | Bucket privé, téléchargement uniquement par URL signée à durée courte, liste blanche de types MIME, taille max., fichier renommé (`storageKey` aléatoire), antivirus si possible |
| Entrées | Validation de chaque DTO, requêtes paramétrées (Prisma) contre l'injection SQL |
| Attaques | Rate-limiting sur `/auth/login`, protection CSRF, en-têtes Helmet |
| Secrets | `.env` hors de Git (`.gitignore`), `SESSION_SECRET` aléatoire et différent par environnement |
| Base de données | Accès réseau limité à l'API, compte applicatif sans droits d'administration |
| Données de test | Les comptes du seed (`*@techticket.local`, mot de passe `DEVELOPPEMENT`) ne doivent **jamais** exister en production |

## 5. RGPD

### 5.1 Cadre
- **Responsable de traitement** : l'entreprise qui déploie TechTicket.
- **Personnes concernées** : les salariés (employés, techniciens, administrateurs).
- **Finalité** : traiter les demandes d'assistance informatique interne et mesurer la qualité du service.
- **Base légale** : intérêt légitime de l'employeur (bon fonctionnement de l'outil de travail), art. 6.1.f.
- **Registre des traitements** : TechTicket doit y être inscrit.

### 5.2 Minimisation
- On ne collecte que le **nom**, l'**e-mail professionnel** et le **rôle**. Pas de téléphone, d'adresse, de date de naissance, etc.
- Avertissement sous le champ Description et sur l'ajout de pièce jointe : *« N'indiquez pas de mot de passe ni de données personnelles sensibles. »*
- Les statistiques sont agrégées. Le délai par technicien est un indicateur de service ; il ne doit pas servir à une évaluation individuelle sans en avoir informé les salariés (et le CSE le cas échéant).

### 5.3 Durées de conservation (proposition)

| Donnée | Durée | Ensuite |
|---|---|---|
| Ticket fermé + commentaires + historique | 3 ans après la clôture | Suppression, ou anonymisation pour garder les statistiques |
| Pièces jointes | 1 an après la clôture | Suppression du fichier |
| Notifications | 6 mois | Suppression |
| Sessions | Durée de la session | Expiration automatique dans Redis |
| Compte d'un salarié parti | Désactivation au départ, anonymisation à 3 ans | `name = "Utilisateur supprimé"`, `email = anonyme-<id>@invalid`, hash effacé |
| Sauvegardes | 30 jours glissants | Écrasement |
| Logs | 6 mois à 1 an | Rotation |

À automatiser par une tâche planifiée (BullMQ) quand le module sera en place.

### 5.4 Droits des personnes

| Droit | Comment l'exercer dans TechTicket |
|---|---|
| Information | Mention d'information dans l'application (lien en pied de page / page de connexion) |
| Accès | L'utilisateur voit déjà ses tickets ; export complet de ses données par l'admin sur demande |
| Rectification | L'admin modifie le nom et l'e-mail |
| Effacement | Anonymisation du compte (une suppression complète casserait l'historique des tickets) ; possible quand la durée de conservation est atteinte |
| Opposition / limitation | Traité au cas par cas par le DPO |

### 5.5 Sous-traitants et hébergement
- Si l'hébergement est externalisé (cloud, stockage S3), le prestataire est **sous-traitant** : contrat conforme à l'article 28 nécessaire.
- Hébergement **dans l'Union européenne** de préférence, pour éviter les transferts hors UE.

### 5.6 Violation de données
En cas de fuite : notification à la CNIL sous **72 h** si risque pour les personnes, et information des salariés concernés si le risque est élevé. Les logs et `ticket_events` aident à mesurer l'étendue de l'incident.
