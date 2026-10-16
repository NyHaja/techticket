# App Flow — ce qui se passe quand on clique

> Décrit le comportement **cible** de l'application. Aujourd'hui, les pages existent mais sont vides,
> et le rôle se choisit dans une liste déroulante de la barre latérale (mode développement uniquement).

## 1. Carte des pages

| URL | Page | Employé | Technicien | Admin |
|---|---|:-:|:-:|:-:|
| `/login` | Connexion | ✔ | ✔ | ✔ |
| `/` | Tableau de bord | ✔ | ✔ | ✔ |
| `/tickets/new` | Nouveau ticket | ✔ | | |
| `/my-tickets` | Mes tickets | ✔ | | |
| `/tickets` | Gestion des tickets | | ✔ | ✔ |
| `/tickets/:id` | Détail d'un ticket | ✔ (ses tickets) | ✔ | ✔ |
| `/reports` | Rapports & statistiques | | | ✔ |
| `/admin` | Administration (utilisateurs, catégories, priorités) | | | ✔ |
| `*` | Page introuvable | ✔ | ✔ | ✔ |

La **barre latérale** est toujours visible une fois connecté. Elle n'affiche que les liens autorisés pour le rôle (`apps/web/src/components/navItems.ts`).

## 2. Démarrage et connexion

```
Ouverture de l'application
   │
   ├─ GET /auth/me
   │    ├─ 200 (session valide) ──────────► Tableau de bord « / »
   │    └─ 401 (pas de session) ──────────► /login
   │
/login : saisie e-mail + mot de passe, clic « Se connecter »
   │
   ├─ POST /auth/login
   │    ├─ 200 ─► cookie de session posé ─► redirection vers la page demandée au départ (sinon « / »)
   │    ├─ 401 ─► message « E-mail ou mot de passe incorrect » (sans préciser lequel)
   │    ├─ 403 ─► message « Compte désactivé, contactez l'administrateur »
   │    └─ 429 ─► message « Trop de tentatives, réessayez dans quelques minutes »
```

**Protection des routes :**
- Pas connecté et URL protégée → redirection vers `/login`.
- Connecté mais rôle non autorisé (ex. un employé tape `/reports`) → redirection vers `/`.
- Session expirée pendant l'utilisation (n'importe quelle API renvoie 401) → retour à `/login`.

**Déconnexion :** clic sur « Se déconnecter » en bas de la barre latérale → `POST /auth/logout` → `/login`.

## 3. Parcours Employé

### 3.1 Créer un ticket
```
Tableau de bord ─ clic « Nouveau ticket » (barre latérale ou raccourci)
   ▼
/tickets/new : formulaire
   Titre*, Catégorie*, Priorité*, Description*, Pièces jointes (optionnel)
   │
   ├─ clic « Annuler » ─► si le formulaire est rempli : « Abandonner la saisie ? » ─► retour « / »
   │
   └─ clic « Envoyer »
        ├─ champ obligatoire vide ─► message d'erreur sous le champ, focus dessus, rien n'est envoyé
        └─ POST /tickets
             ├─ succès ─► toast « Ticket TT-2026-00012 créé » + son
             │            notification « Ticket créé » ajoutée
             │            redirection vers /tickets/:id
             └─ erreur ─► message en haut du formulaire, la saisie est conservée
```

### 3.2 Suivre ses tickets
```
clic « Mes tickets » ─► /my-tickets
   Liste de MES tickets, badge de statut coloré
   Filtres : date, catégorie, statut
   │
   └─ clic sur une ligne ─► /tickets/:id
        Description, priorité, technicien assigné, date de dernière mise à jour
        Fil de discussion (commentaires publics + événements de statut)
        │
        ├─ écrire un commentaire + « Publier » ─► POST /tickets/:id/comments
        │      ─► le commentaire apparaît dans le fil, le technicien est notifié
        │
        ├─ ticket RESOLU depuis moins de 72 h :
        │     bouton « Le problème persiste » ─► confirmation ─► POST /tickets/:id/reopen
        │      ─► statut repasse à OUVERT, le technicien est notifié
        │
        └─ ticket RESOLU et pas encore évalué :
              bloc « Évaluer le support » (1 à 5 étoiles + commentaire) ─► POST /tickets/:id/feedback
               ─► « Merci pour votre avis », le bloc disparaît
```

### 3.3 Recevoir une notification
```
Événement côté serveur (statut changé, réponse, résolution)
   ─► notification enregistrée en base ─► poussée en direct (SSE)
   ─► la pastille de la cloche s'incrémente + toast discret
clic sur la notification ─► PATCH /notifications/:id/read ─► /tickets/:id
```

## 4. Parcours Technicien

### 4.1 Tableau de bord
```
« / » : compteurs (ouverts, en attente de retour, urgents), mes tickets actifs (charge),
        tickets urgents avec bandeau rouge, activité récente
clic sur un compteur ─► /tickets filtré sur ce statut
clic sur un ticket urgent ─► /tickets/:id
```

### 4.2 Gérer les tickets
```
clic « Gestion des tickets » ─► /tickets
   Tableau : N°, Titre, Statut, Priorité, Assigné à, Date de création
   Recherche par numéro ou titre, filtres statut / priorité / technicien, tri par colonne
   Pagination en bas
   │
   └─ clic sur une ligne ─► /tickets/:id
```

### 4.3 Traiter un ticket (`/tickets/:id`)

| Action (clic) | Appel API | Effet visible | Notification envoyée |
|---|---|---|---|
| « Prendre en charge » (ticket non assigné) | `POST /tickets/:id/assign` | Assigné à moi, statut `EN_COURS` | — |
| « Réattribuer » → choix d'un collègue | `POST /tickets/:id/assign` | Nouvel assigné | Au collègue |
| Changer le statut (liste déroulante) | `PATCH /tickets/:id` | Badge mis à jour, événement dans le fil | Au demandeur |
| Changer la priorité | `PATCH /tickets/:id` | Badge priorité mis à jour | — |
| Définir l'échéance (sélecteur de date) | `PATCH /tickets/:id` | Date affichée | — |
| Répondre (commentaire public) | `POST /tickets/:id/comments` | Message dans le fil | Au demandeur |
| Note interne (case « Note interne » cochée) | `POST /tickets/:id/comments` `internal: true` | Message sur fond jaune « Interne » | — (invisible pour l'employé) |
| « Marquer comme résolu » → modale « Solution appliquée »* | `POST /tickets/:id/resolve` | Statut `RESOLU`, solution affichée | Au demandeur |
| « Fermer » (ticket résolu) | `PATCH /tickets/:id` | Statut `FERME`, plus de modification possible | — |

Chaque action ajoute une ligne `TicketEvent` (historique et audit).

## 5. Parcours Administrateur

L'admin a tous les écrans du technicien, plus :

```
clic « Rapports » ─► /reports
   Choix de période (7 j / 30 j / 12 mois)
   Graphique en barres créés/résolus, camembert par catégorie,
   délais moyens par technicien, satisfaction moyenne
   clic « Exporter CSV » / « Exporter PDF » ─► GET /reports/export ─► téléchargement du fichier

clic « Administrateur » ─► /admin, 3 onglets :
   Utilisateurs : « Ajouter » (nom, e-mail, rôle, mot de passe provisoire)
                  « Désactiver » ─► confirmation ─► le compte ne peut plus se connecter
                  changer le rôle (liste déroulante)
   Catégories   : ajouter, renommer, activer / désactiver
   Priorités    : libellé, niveau, délai cible en heures
```

Une catégorie désactivée n'apparaît plus dans le formulaire de création, mais reste affichée sur les anciens tickets.

## 6. Cycle de vie d'un ticket

```
                 ┌──────────────── réouverture (≤ 72 h, par le demandeur) ───────────────┐
                 ▼                                                                       │
 [création] ─► OUVERT ──prise en charge──► EN_COURS ⇄ EN_ATTENTE_RETOUR ──résolution──► RESOLU ──clôture──► FERME
```

| Statut | Couleur du badge | Qui le déclenche |
|---|---|---|
| `OUVERT` | Bleu | Création, réouverture |
| `EN_COURS` | Orange | Technicien (prise en charge) |
| `EN_ATTENTE_RETOUR` | Ambre | Technicien (question posée à l'employé) |
| `RESOLU` | Vert | Technicien (avec la solution) |
| `FERME` | Gris | Technicien / admin, ou automatiquement après 72 h sans réouverture *(à décider)* |

## 7. États communs à toutes les pages

| Situation | Affichage |
|---|---|
| Chargement | Squelettes gris à la place du contenu |
| Liste vide | Message explicatif + action (ex. « Aucun ticket. Créer un ticket ») |
| Erreur réseau / serveur | Bandeau rouge « Impossible de charger les données » + bouton « Réessayer » |
| Accès refusé (403) | Redirection vers `/` |
| URL inconnue | Page « Page introuvable » avec un lien vers l'accueil |
| Action réussie | Toast vert + son court (exigence « feedback immédiat » du cahier des charges) |
