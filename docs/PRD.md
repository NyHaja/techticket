# PRD — Product Requirements Document

> Source : `Cahier_de_Charge_IHM.pdf` (cahier des charges fonctionnel) et `Architecture Technique TechTicket.pdf`.
> Les écarts entre ces documents et le code actuel sont signalés par **⚠**.

## 1. Le produit en une phrase

**TechTicket** est une plateforme web de gestion de tickets d'assistance informatique, destinée aux entreprises de taille intermédiaire. Elle centralise les demandes (pannes, logiciels, réseau), les priorise et les suit jusqu'à leur résolution.

## 2. Problème à résoudre

Aujourd'hui, les demandes au service IT passent par e-mail ou messagerie instantanée. Résultat :
- des informations se perdent ;
- personne ne sait où en est une demande ;
- les délais de traitement ne sont ni mesurés ni maîtrisés.

TechTicket remplace ces échanges informels par un circuit structuré et mesurable, dans une démarche d'amélioration continue du service IT interne.

## 3. Utilisateurs

| Profil | Qui | Droits principaux |
|---|---|---|
| **Employé** (demandeur) — `EMPLOYE` | Tout salarié qui rencontre un problème technique | Créer, suivre et commenter **ses propres** tickets |
| **Technicien** (agent) — `TECH` | Membre du service IT | Gérer, répondre et résoudre les tickets |
| **Administrateur** — `ADMIN` | Responsable du service IT | Accès complet, rapports, gestion des utilisateurs et de la configuration |

## 4. Fonctionnalités

Légende de priorité : **P0** = indispensable au lancement, **P1** = important, **P2** = confort.

### 4.1 Authentification (tous)

| ID | Fonctionnalité | Priorité |
|---|---|---|
| AUTH-1 | Connexion par e-mail + mot de passe | P0 |
| AUTH-2 | Déconnexion | P0 |
| AUTH-3 | Session persistante (l'utilisateur reste connecté entre deux pages) | P0 |
| AUTH-4 | Un compte désactivé ne peut plus se connecter | P0 |
| AUTH-5 | L'interface n'affiche que ce que le rôle connecté a le droit de voir | P0 |

### 4.2 Employé (demandeur)

**Soumission d'un ticket**

| ID | Fonctionnalité | Priorité |
|---|---|---|
| EMP-1 | Formulaire avec champs **obligatoires** : titre, description détaillée, catégorie, priorité (Urgent, Haute, Normale, Faible) | P0 |
| EMP-2 | Joindre des captures d'écran ou fichiers | P1 |
| EMP-3 | Champ optionnel « niveau d'urgence ressenti » ⚠ *absent du schéma de données actuel* | P2 |
| EMP-4 | Confirmation automatique par notification in-app, avec un **numéro de ticket unique** (`TT-2026-00001`) | P0 |
| EMP-5 | Pouvoir annuler la saisie avant l'envoi | P1 |

**Suivi des tickets**

| ID | Fonctionnalité | Priorité |
|---|---|---|
| EMP-6 | Voir le statut de chacun de ses tickets en temps réel : Ouvert, En cours, En attente de retour, Résolu, Fermé | P0 |
| EMP-7 | Recevoir une notification à chaque mise à jour | P1 |
| EMP-8 | Voir le fil de discussion de chaque ticket (sans les notes internes) | P0 |
| EMP-9 | Ajouter un commentaire sur son ticket | P0 |

**Historique et feedback**

| ID | Fonctionnalité | Priorité |
|---|---|---|
| EMP-10 | Historique complet de ses tickets, filtrable par date, catégorie ou statut | P1 |
| EMP-11 | Évaluer le support après résolution : note de 1 à 5 + commentaire optionnel | P1 |
| EMP-12 | Rouvrir un ticket résolu si le problème persiste, **dans les 72 h** après la résolution | P1 |

### 4.3 Technicien (agent)

**Tableau de bord**

| ID | Fonctionnalité | Priorité |
|---|---|---|
| TECH-1 | Voir tous les tickets ouverts et assignés, triables par priorité, date de création ou statut | P0 |
| TECH-2 | Tickets urgents mis en évidence visuellement (bandeau coloré) | P0 |
| TECH-3 | Indicateur de charge personnelle (nombre de tickets actifs qui me sont assignés) | P1 |

**Traitement**

| ID | Fonctionnalité | Priorité |
|---|---|---|
| TECH-4 | Prendre en charge un ticket non assigné | P0 |
| TECH-5 | Réattribuer un ticket à un collègue | P1 |
| TECH-6 | Répondre, poser des questions et changer le statut | P0 |
| TECH-7 | Ajouter des **notes internes**, jamais visibles par l'employé | P0 |
| TECH-8 | Marquer un ticket comme résolu, avec la description de la solution appliquée (obligatoire) | P0 |

**Priorités et délais**

| ID | Fonctionnalité | Priorité |
|---|---|---|
| TECH-9 | Modifier la priorité après analyse | P1 |
| TECH-10 | Définir une date d'échéance estimée | P1 |

### 4.4 Administrateur

L'administrateur a aussi tous les droits du technicien.

| ID | Fonctionnalité | Priorité |
|---|---|---|
| ADM-1 | Gérer les comptes : créer, désactiver, attribuer un rôle | P0 |
| ADM-2 | Configurer les catégories de tickets (ajouter, renommer, désactiver) | P1 |
| ADM-3 | Configurer les niveaux de priorité et leur délai cible | P1 |
| ADM-4 | Tableau de bord statistique : tickets créés / résolus par semaine ou mois, taux de résolution, délais moyens, satisfaction | P1 |
| ADM-5 | Répartition des tickets par catégorie (camembert) | P1 |
| ADM-6 | Délais moyens de résolution par technicien | P1 |
| ADM-7 | Note de satisfaction moyenne et nombre d'évaluations | P1 |
| ADM-8 | Export des rapports en **CSV** et **PDF** | P2 |

### 4.5 Notifications (tous)

| ID | Événement qui déclenche une notification | Destinataire |
|---|---|---|
| NOTIF-1 | Ticket créé (confirmation avec numéro) | Employé demandeur |
| NOTIF-2 | Changement de statut | Employé demandeur |
| NOTIF-3 | Nouveau commentaire public | Employé demandeur / technicien assigné |
| NOTIF-4 | Ticket assigné | Technicien assigné |
| NOTIF-5 | Ticket résolu | Employé demandeur |

Les notifications sont **in-app** uniquement (pas d'e-mail pour l'instant).

## 5. Règles métier

- **Numéro de ticket** : format `TT-<année>-<5 chiffres>`, unique, attribué à la création.
- **Cycle de vie des statuts** : `OUVERT → EN_COURS ↔ EN_ATTENTE_RETOUR → RESOLU → FERME`.
- **Réouverture** : `RESOLU → OUVERT` possible uniquement dans les **72 h** qui suivent `resolvedAt`. Au-delà, l'API refuse.
- **Résolution** : passer en `RESOLU` exige une description de la solution.
- **Cloisonnement** : un employé ne voit **que** les tickets dont il est le demandeur. Ce filtrage est fait côté serveur.
- **Notes internes** : exclues des réponses API envoyées à un employé, pas seulement masquées à l'écran.
- **Feedback** : un seul par ticket, note entre 1 et 5 (contrainte `CHECK` en base).
- **Délais cibles par priorité** (valeurs du seed, modifiables par l'admin) :

  | Priorité | Niveau | Délai cible |
  |---|---|---|
  | Urgent | 1 | 4 h |
  | Haute | 2 | 24 h |
  | Normale | 3 | 72 h |
  | Faible | 4 | 168 h (7 jours) |

## 6. Exigences non fonctionnelles

| Domaine | Exigence |
|---|---|
| Accessibilité | Interface responsive, compatible Chrome, Firefox, Edge |
| Performance | Pages chargées en **moins de 2 s pour 95 %** des requêtes |
| Sécurité | Identifiant / mot de passe, gestion des sessions, cloisonnement des données par rôle |
| Internationalisation | Interface en français, conçue pour pouvoir ajouter d'autres langues |
| Disponibilité | **99,5 %** en heures ouvrées |

## 7. Hors périmètre (pour l'instant)

Ces éléments apparaissent dans les wireframes ou les « décisions à trancher », mais ne sont pas demandés par le cahier des charges :
- base de connaissances (« Knowledge Base »), page « Customers » ;
- notifications par e-mail ;
- connexion SSO (Azure AD, LDAP) ;
- application mobile native.

## 8. Mesures de succès

- Taux de résolution des tickets dans le délai cible de leur priorité.
- Délai moyen de résolution, global et par technicien.
- Note de satisfaction moyenne des employés.
- Part des demandes IT qui passent par TechTicket plutôt que par e-mail.

## 9. Écarts à trancher ⚠

| Sujet | Cahier des charges | Code actuel |
|---|---|---|
| Libellé de priorité | « Normale » | « Normal » dans `prisma/seed.ts` |
| Catégories par défaut | réseau, matériel, logiciel, accès | Développement, DevOps, Architecture, Réseaux (seed) |
| Niveaux d'urgence du formulaire | 4 priorités | Le wireframe montre 3 choix (Low / Medium / High) |
| « Niveau d'urgence ressenti » | Champ optionnel demandé | Pas de colonne dans `Ticket` |
