# Changelog

Toutes les evolutions notables de FitCoach. Format inspire de
[Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versionnement semantique.

## [0.1.0] - 2026-11-17

Premiere version livrable (Rendu 2). Le schema de base de donnees va de `V1` a
`V14` (Flyway).

### Identite et profil (`identity`)
- Inscription et connexion par JWT sans etat, roles `ATHLETE`, `COACH`, `ADMIN`.
- Profil, avatar, preferences (unites,
  langue, objectif, niveau) et suivi du poids corporel. Stockage toujours metrique.

### Catalogue (`catalog`)
- 18 exercices de depart, groupes musculaires, tags, difficultes, alternatives ;
  recherche filtree et paginee.
- Creation, modification et suppression reservees au createur de l'exercice ou a
  un administrateur.

### Programmes (`program`)
- Programmes en jours et prescriptions, reordonnancement atomique, duplication,
  partage par lien public, notation de 1 a 5.
- Visibilites `PUBLIC`, `PRIVATE` et **`CLIENTS`** (« Mes athletes », reservee aux
  coachs) : visible des seuls athletes en relation active ; onglet « Programmes de
  mon coach », duplication et notation par ces athletes.

### Carnet d'entrainement (`training`)
- Seances realisees, series (charge, repetitions, RPE), volume total.
- Records personnels (charge max, 1RM estime par la formule d'Epley) detectes a la
  saisie et recalcules a la suppression d'une serie.

### Planning (`planning`)
- Calendrier, seance du jour, reprogrammation, abandon, completion.
- **Validation hierarchique** : une seance terminee par un athlete suivi passe en
  attente de validation par son coach ; sans coach, elle est validee directement.
  Machine a etats protegee cote serveur.

### Statistiques (`stats`)
- Vue d'ensemble, progression par exercice, volume hebdomadaire (agregation SQL),
  streak, assiduite, repartition musculaire, score de progression ; calculs dans le
  fuseau metier (`APP_TIME_ZONE`).

### Coaching (`coaching`)
- Cycle d'invitation complet : invitation, acceptation, refus, annulation, fin de
  suivi (statuts `PENDING`, `ACTIVE`, `DECLINED`, `ENDED`). Tant que la relation
  n'est pas active, le coach n'a acces a rien.
- Notes privees du coach sur un athlete (jamais visibles par l'athlete).
- Suivi d'un athlete : seances recentes, streak, validations en attente, seances a
  venir.
- Publications privees d'un coach, images servies par un point d'acces
  authentifie (le coach et ses clients actifs).

### Reservation (`booking`)
- Disponibilites de 15 min a 4 h sans chevauchement (contrainte d'exclusion
  PostgreSQL), reservation par un athlete client actif, annulation jusqu'a 24 h
  avant.

### Messagerie (`messaging`)
- Conversation unique par paire coach/athlete, historique pagine par curseur,
  accuses de lecture ; envoi conditionne a une relation active.

### Gamification (`gamification`)
- 8 badges (premiere seance, 10 et 50 seances, premier programme, series de 7 et
  30 jours, premier record, 10 records), points d'experience derives de l'activite,
  niveaux, classement (top 20 et rang de l'utilisateur).

### Notifications (`notification`)
- Cloche avec compteur de non-lus et panneau (lire, tout marquer comme lu).
- Rappels automatiques (job planifie) des seances planifiees et des rendez-vous du
  jour et du lendemain, sans doublon.
- Notifications d'evenements : seance a valider / validee, nouvelle reservation,
  annulation.

### Generation de programmes (`ai`)
- `POST /api/ai/program-generation` : brouillon de programme construit a partir du
  vrai catalogue (jours selon les seances par semaine, niveau, materiel, objectif),
  sans ecriture en base ; « Regenerer » donne une variante.
- Generateur **a base de regles** par defaut (aucune cle requise) ; appel a l'API
  Claude optionnel via `ANTHROPIC_API_KEY` (`FITCOACH_AI_STRATEGY` = `auto`,
  `rules`, `claude`), sortie validee contre le catalogue.

### Integration continue et qualite
- Workflows GitHub Actions `backend.yml` (PostgreSQL 16, `./gradlew build`, JaCoCo)
  et `frontend.yml` (lint, format, typecheck, tests avec couverture, build).
- Couverture mesuree : backend 81,0 % des lignes (146 tests, 31 classes), frontend
  53,8 % des lignes (70 tests, 11 fichiers).
- Test d'architecture ArchUnit : `common` sans dependance metier, modules relies par
  leur seul package `api`.

### Securite et architecture
- Erreurs au format ProblemDetail (RFC 9457) avec exceptions de base communes ;
  controle des roles par `@PreAuthorize` avec un vrai **403** (et non 401) en HTTP.
- Secret JWT sans valeur par defaut hors profils `dev` et `test`.
- Images de publications non publiques ; `imageUrl` restreint ; verification du
  contenu reel des fichiers envoyes.
- Corrections : collisions de position, perte des records personnels, transitions
  du planning, requetes N+1, pagination des listes, migrations consolidees.

### Outillage
- Client API type genere depuis l'OpenAPI du backend (`npm run gen:api`), API
  simulee MSW pour developper sans backend, comptes de demonstration en profil
  `dev`.

### Connu / non inclus
- **Nutrition** (phase 13, Mathieu) : en cours de developpement, absente de cette version et prevue dans la suivante.
- **Back-office d'administration** et deploiement (phase 14) : non realises.
- **Defis** de la gamification : non implementes (badges, XP et classement le sont).
- Badges **dynamiques** de couverture et de qualite de code : demandent un compte
  Codecov / SonarCloud et un jeton du proprietaire du depot ; les chiffres sont
  donnes en clair dans le README.
- Fichier **`LICENSE`** absent : le choix de la licence revient au proprietaire du
  depot, aucun badge de licence n'est affiche.
- Le chemin **Claude** de la generation n'a pas ete execute contre la vraie API
  (aucun appel reel dans les tests) ; seul le generateur a regles est verifie de
  bout en bout.
- Les workflows GitHub Actions n'ont pas encore ete executes sur GitHub au moment de
  cette version (ils tournent a l'ouverture d'une Pull Request).
