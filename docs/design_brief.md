# Design Brief

> Le cahier des charges impose trois couleurs de statut (vert = résolu, orange = en cours, rouge = urgent)
> et une palette cohérente sur toutes les pages. Le reste de cette charte est **une proposition**, construite
> à partir de ce que le code utilise déjà (bleu et gris de Tailwind dans `Sidebar.tsx`) et des wireframes
> du cahier des charges (pages 6 à 8). À valider en équipe.

## 1. Principes

| Principe (cahier des charges) | Application concrète |
|---|---|
| Visibilité du statut | Chaque ticket porte un badge coloré ; les urgents ont un bandeau rouge |
| Cohérence | Mêmes couleurs, icônes (lucide) et libellés sur toutes les pages |
| Contrôle utilisateur | Bouton « Annuler » sur chaque formulaire, confirmation avant toute action irréversible |
| Prévention des erreurs | Champs obligatoires marqués `*`, validation avant envoi, messages d'erreur explicites |
| Feedback immédiat | Toast + son court après soumission, réponse, clôture |
| Minimalisme | Une page n'affiche que ce qui sert au rôle connecté |

Ton général : sobre, professionnel, dense mais aéré. Fond gris très clair, cartes blanches, une seule couleur d'accent (bleu).

## 2. Couleurs

Les valeurs correspondent aux couleurs par défaut de Tailwind ; on peut donc utiliser directement les classes indiquées.

### 2.1 Couleurs de marque et d'interface

| Rôle | Classe Tailwind | Hex | Usage |
|---|---|---|---|
| Primaire | `blue-600` | `#2563EB` | Boutons principaux, lien actif de la barre latérale, focus |
| Primaire foncé | `blue-700` | `#1D4ED8` | Survol des boutons, logo « TechTicket » |
| Primaire clair | `blue-50` | `#EFF6FF` | Fond de ligne sélectionnée |
| Fond de page | `gray-50` | `#F9FAFB` | Arrière-plan de l'application |
| Surface | `white` | `#FFFFFF` | Cartes, barre latérale, tableaux, modales |
| Bordure | `gray-200` | `#E5E7EB` | Séparateurs, contours de cartes et de champs |
| Texte principal | `gray-900` | `#111827` | Titres, contenu |
| Texte secondaire | `gray-700` | `#374151` | Liens de navigation, libellés |
| Texte discret | `gray-500` | `#6B7280` | Dates, aides, placeholders |
| Désactivé | `gray-400` | `#9CA3AF` | Boutons et champs désactivés |

### 2.2 Couleurs de statut de ticket

Badge = fond clair + texte foncé + bordure, pour rester lisible (contraste ≥ 4,5:1).

| Statut | Libellé affiché | Texte | Fond | Bordure |
|---|---|---|---|---|
| `OUVERT` | Ouvert | `#1D4ED8` (blue-700) | `#DBEAFE` (blue-100) | `#93C5FD` (blue-300) |
| `EN_COURS` | En cours | `#C2410C` (orange-700) | `#FFEDD5` (orange-100) | `#FDBA74` (orange-300) |
| `EN_ATTENTE_RETOUR` | En attente de retour | `#B45309` (amber-700) | `#FEF3C7` (amber-100) | `#FCD34D` (amber-300) |
| `RESOLU` | Résolu | `#15803D` (green-700) | `#DCFCE7` (green-100) | `#86EFAC` (green-300) |
| `FERME` | Fermé | `#4B5563` (gray-600) | `#F3F4F6` (gray-100) | `#D1D5DB` (gray-300) |

### 2.3 Couleurs de priorité

| Priorité | Texte | Indicateur | Particularité |
|---|---|---|---|
| Urgent | `#DC2626` (red-600) | point rouge `#DC2626` | Ligne avec bandeau gauche rouge 4 px + fond `#FEF2F2` (red-50) |
| Haute | `#EA580C` (orange-600) | point orange | — |
| Normale | `#374151` (gray-700) | aucun | — |
| Faible | `#6B7280` (gray-500) | aucun | — |

### 2.4 Couleurs de retour

| Type | Texte / icône | Fond |
|---|---|---|
| Succès | `#15803D` | `#F0FDF4` |
| Avertissement | `#B45309` | `#FFFBEB` |
| Erreur | `#B91C1C` | `#FEF2F2` |
| Information | `#1D4ED8` | `#EFF6FF` |
| Note interne | `#92400E` | `#FEF9C3` (fond jaune « post-it ») |

### 2.5 Graphiques (page Rapports)

Palette catégorielle, dans cet ordre : `#2563EB`, `#16A34A`, `#EA580C`, `#9333EA`, `#0891B2`, `#DB2777`.
Barres « créés » en `#2563EB`, « résolus » en `#16A34A`.

## 3. Typographie

| Élément | Police | Taille | Graisse | Classe Tailwind |
|---|---|---|---|---|
| Police principale | **Inter** (Google Fonts), repli `system-ui, sans-serif` | — | — | `font-sans` |
| Numéros de ticket, codes | **JetBrains Mono**, repli `ui-monospace` | — | — | `font-mono` |
| Titre de page (h1) | Inter | 24 px / 32 px | 600 | `text-2xl font-semibold` |
| Titre de section (h2) | Inter | 18 px / 28 px | 600 | `text-lg font-semibold` |
| Titre de carte (h3) | Inter | 16 px / 24 px | 600 | `text-base font-semibold` |
| Texte courant | Inter | 14 px / 20 px | 400 | `text-sm` |
| Libellé de champ | Inter | 14 px | 500 | `text-sm font-medium` |
| Petit texte, dates | Inter | 12 px / 16 px | 400 | `text-xs` |
| En-tête de colonne | Inter | 12 px, majuscules, espacé | 500 | `text-xs uppercase tracking-wide` |
| Chiffre clé (compteurs) | Inter | 36 px / 40 px | 700 | `text-4xl font-bold` |
| Logo « TechTicket » | Inter | 20 px | 700, `#1D4ED8` | `text-xl font-bold text-blue-700` |

Les wireframes utilisent une police à chasse fixe : c'est un style de maquette basse fidélité, pas un choix final. On ne garde le mono que pour les numéros de ticket.

## 4. Espacements, formes, ombres

| Élément | Valeur |
|---|---|
| Unité de base | 4 px (échelle Tailwind) |
| Marge intérieure des pages | 24 px (`p-6`) |
| Espace entre cartes | 24 px (`gap-6`) |
| Marge intérieure des cartes | 20 px (`p-5`) |
| Rayon des boutons, champs | 6 px (`rounded-md`) |
| Rayon des cartes, modales | 8 px (`rounded-lg`) |
| Rayon des badges | pilule (`rounded-full`) |
| Ombre des cartes | `shadow-sm` |
| Ombre des modales, menus | `shadow-lg` |
| Largeur de la barre latérale | 240 px (`w-60`) |
| Largeur max. des formulaires | 640 px (`max-w-2xl`) |
| Hauteur des boutons et champs | 40 px |

## 5. Composants

| Composant | Description |
|---|---|
| Bouton principal | Fond `#2563EB`, texte blanc, survol `#1D4ED8` |
| Bouton secondaire | Fond blanc, bordure `#E5E7EB`, texte `#374151`, survol fond `#F9FAFB` |
| Bouton danger | Fond `#DC2626`, texte blanc (désactiver un compte, etc.) |
| Champ de saisie | Fond blanc, bordure `#D1D5DB`, focus anneau 2 px `#2563EB`, erreur bordure `#DC2626` + message rouge 12 px dessous |
| Badge | Pilule, 12 px, graisse 500, couleurs du § 2.2 |
| Carte | Fond blanc, bordure `#E5E7EB`, `rounded-lg`, `shadow-sm` |
| Tableau | En-têtes gris majuscules, lignes séparées par `#E5E7EB`, survol `#F9FAFB`, ligne entière cliquable |
| Toast | En bas à droite, 4 s, couleurs du § 2.4 |
| Lien actif (barre latérale) | Fond `#2563EB`, texte blanc (déjà en place) |
| Icônes | lucide-react, 16 px dans la navigation et les boutons, 20 px dans les cartes |

## 6. À quoi ressemble chaque page

Structure commune : **barre latérale blanche à gauche** (logo, liens filtrés par rôle, bloc utilisateur en bas avec nom, rôle et « Se déconnecter »), **contenu à droite** sur fond gris clair, avec en haut le titre de page à gauche et l'action principale à droite.

### `/login` — Connexion
- Fond gris clair, carte blanche centrée (400 px de large).
- Logo « TechTicket » en haut, puis champs E-mail et Mot de passe, bouton principal « Se connecter » pleine largeur.
- Message d'erreur rouge au-dessus des champs en cas d'échec.
- Pas de barre latérale.

### `/` — Tableau de bord *(wireframe « Support Dashboard »)*
- En-tête : « Tableau de bord » + bouton « + Nouveau ticket » (employé).
- Ligne de 3 à 4 **cartes compteurs** : Ouverts (bleu), En attente de retour (ambre), Urgents (fond `#FEF2F2`, chiffre rouge). Pour le technicien : + « Ma charge » (tickets actifs assignés).
- Dessous, deux colonnes :
  - gauche (2/3) : **tickets urgents / récents** (N°, titre, badge statut) ;
  - droite (1/3) : **activité / notifications récentes** (point coloré, texte, « il y a 2 min »).
- Contenu adapté au rôle : l'employé ne voit que ses tickets.

### `/tickets/new` — Nouveau ticket *(wireframe « Create New Ticket »)*
- Formulaire en une colonne, largeur max. 640 px, dans une carte blanche.
- Champs dans l'ordre : Titre*, Catégorie* (liste déroulante), Priorité* (4 boutons radio en ligne : Urgent, Haute, Normale, Faible), Description* (zone de texte 6 lignes), Pièces jointes (zone glisser-déposer pointillée).
- En bas : « Envoyer » (principal) et « Annuler » (secondaire).

### `/my-tickets` — Mes tickets (employé)
- Barre de filtres : recherche, statut, catégorie, période.
- Liste ou tableau : N° (mono), Titre, badge Statut coloré, Catégorie, Dernière mise à jour.
- État vide : illustration simple + « Vous n'avez pas encore de ticket » + bouton « Créer un ticket ».

### `/tickets` — Gestion des tickets (technicien, admin) *(wireframe « Ticket List »)*
- Sous-titre : « Gérer et résoudre les demandes ».
- Barre : recherche « N° ou titre… », filtres Statut, Priorité, Technicien.
- Tableau : N°, Titre, Statut (badge), Priorité (point coloré + libellé), Assigné à (avatar initiales + nom, ou « Non assigné » en gris), Créé le.
- Lignes urgentes avec bandeau rouge à gauche.
- Pied : « 1-20 sur 128 tickets » à gauche, pagination à droite.

### `/tickets/:id` — Détail d'un ticket *(wireframe « Suivi de Ticket »)*
- En-tête : N° en mono gris + badge statut, titre en `text-2xl`, actions à droite selon le rôle (« Prendre en charge », « Marquer comme résolu », « Rouvrir »…).
- Mise en page deux colonnes :
  - gauche (2/3) : carte **Description**, puis **fil chronologique** vertical (commentaires en cartes ; événements système en texte gris italique « Statut passé de Ouvert à En cours » ; notes internes sur fond jaune avec l'étiquette « Interne »), puis zone **Ajouter un commentaire** (case « Note interne » visible seulement pour technicien et admin) ;
  - droite (1/3) : carte **Détails** (demandeur, assigné, priorité, catégorie, échéance, créé le, mis à jour le), et pour un ticket résolu : solution + bloc d'évaluation.

### `/reports` — Rapports (admin) *(wireframe « Statistical Overview »)*
- En-tête : « Rapports & statistiques », sélecteur de période à droite, boutons « Exporter CSV » / « Exporter PDF ».
- Ligne de cartes KPI : tickets créés, taux de résolution, délai moyen de résolution, satisfaction moyenne (étoiles + nombre d'avis).
- Grille : graphique en barres créés/résolus (2/3) + camembert par catégorie (1/3), puis tableau « Délai moyen par technicien ».

### `/admin` — Administration
- Onglets : Utilisateurs, Catégories, Priorités.
- Chaque onglet : tableau + bouton « Ajouter » en haut à droite ; création / modification dans une modale.
- Utilisateurs : nom, e-mail, badge de rôle, statut Actif / Désactivé, actions.

### `*` — Page introuvable
- Centré : « 404 », « Cette page n'existe pas », bouton « Retour au tableau de bord ».

## 7. Responsive et accessibilité

- **≥ 1024 px** : barre latérale fixe.
- **< 1024 px** : barre latérale repliée derrière un bouton menu (☰) ; tableaux transformés en cartes empilées sur mobile.
- Contraste texte / fond ≥ 4,5:1 (WCAG AA).
- La couleur n'est **jamais** la seule information : un badge porte toujours son libellé.
- Tous les éléments utilisables au clavier, avec un anneau de focus visible.
- Libellés `aria` sur les icônes seules ; `aria-label="Navigation principale"` déjà présent sur la navigation.
- Sons de confirmation désactivables (préférence utilisateur).
