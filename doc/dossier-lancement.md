# FitCoach — Dossier de lancement

**Projet M1 S1 — Rendu 1** · Plateforme fitness pour athlètes et coachs
Romain (`Romdeux-ops`), Youcef (`kratos-web`) et Mathieu (`Mathieuleboss`)

| Version | Date | Objet |
| --- | --- | --- |
| 1.0 | novembre 2026 | Rendu 1, dossier de lancement |

Ce dossier est versionné avec le code dans [`/doc`](../doc) (markdown compilé
en PDF) et évoluera à chaque livraison de version.

## 1. Équipe et comptes développeurs

Nous sommes trois. Chacun porte une **feature majeure** dans son propre module
(backend `com.fitcoach.<module>`, frontend `frontend/src/features/<module>`),
ce qui limite les conflits de fusion. Seuls ces comptes servent aux commits et
aux Pull Requests.

| Membre | Compte GitHub | Feature majeure |
| --- | --- | --- |
| Romain | `Romdeux-ops` (propriétaire du dépôt) | Messagerie coach ↔ athlète (livrée) : conversation unique par paire, historique paginé par curseur, accusés de lecture, envoi conditionné à une relation active. Romain a aussi posé le socle commun (architecture, JWT, Flyway, outillage frontend). |
| Youcef | `kratos-web` | Portail coaching (en cours) : mise en relation coach → athlètes, publications des coachs à images protégées, validation hiérarchique des séances planifiées. Ce module porte la règle d'autorisation centrale réutilisée par le planning, la réservation et la messagerie. Reste : cycle d'invitation, notes de suivi. |
| Mathieu | `Mathieuleboss` | Nutrition (prévue) : plans alimentaires, journal des repas, besoins caloriques, recettes. Module volontairement isolé, dont aucun autre ne dépend. |

## 2. Dépôt

- Dépôt principal (backend, frontend, doc) :
  <https://github.com/Romdeux-ops/PROJET-M1-S1>
- Documentation versionnée : `/doc` · Intégration continue : onglet *Actions*.

Monorepo : backend Spring Boot à la racine, frontend React dans `frontend/`.
**Aucun commit direct sur `main`** : chaque fonctionnalité a sa branche
(`feature/...`) et passe par une Pull Request relue par un autre membre. Les
migrations de base de données ne sont jamais modifiées après fusion, et rien
ne se fusionne sans que les tests backend (`./gradlew test`) et la CI frontend
(lint, format, typecheck, tests, build) soient verts. Le `README.md` racine
documente le démarrage local, les règles d'équipe et l'avancement par phase ;
il porte les badges de version, de licence et de build, qui seront complétés
par des badges de couverture de tests et de qualité de code dès que la CI
backend les calculera (phase 14).

## 3. Le projet et son caractère innovant

**FitCoach** réunit au même endroit le carnet d'entraînement d'un sportif et
sa relation avec son coach. L'athlète construit ou suit des programmes,
enregistre ses séances série par série, planifie sa semaine et suit sa
progression. Le coach suit ses athlètes, valide leurs séances, publie du
contenu, ouvre des créneaux et leur écrit par messagerie. Les applications
grand public séparent ces usages ; chez FitCoach, **une seule règle les
relie** : *un coach n'accède qu'aux données des athlètes avec lesquels il a
une relation active*. Cette relation décide de qui voit les posts, valide une
séance, réserve un créneau ou ouvre une conversation.

Côté technique, quatre choix éloignent le projet d'un simple CRUD :

- **Validation hiérarchique des séances** : une séance terminée par un athlète
  suivi passe en attente de validation par son coach (machine à états
  PLANNED → PENDING_VALIDATION → DONE/SKIPPED protégée et testée côté
  serveur) ; un athlète autonome la valide lui-même. Les **records
  personnels** (charge max, 1RM estimé — formule d'Epley) sont détectés à la
  saisie et recalculés à la suppression.
- **Contrat d'API typé de bout en bout** : springdoc publie l'OpenAPI,
  `openapi-typescript` en tire les types du frontend ; si front et back
  divergent, la compilation échoue.
- **Frontières d'architecture vérifiées par des tests ArchUnit** : mêmes
  modules côté Spring et côté React, `common` sans dépendance métier.
- **Intégrité portée par PostgreSQL** : schéma géré uniquement par Flyway,
  contraintes d'exclusion `gist` contre les chevauchements de créneaux,
  `citext`, unicité de la paire coach/athlète même sous accès concurrent.

## 4. Scénarios d'usage prévus

Trois rôles : ATHLETE, COACH, ADMIN.

1. **L'athlète autonome (livré)** — Lina s'inscrit (JWT), règle profil et
   unités, parcourt le catalogue filtrable, duplique un programme public
   « Push/Pull/Legs », planifie sa semaine, saisit ses séries (charge,
   répétitions, RPE) et suit volume, streak, assiduité, 1RM et répartition
   musculaire.
2. **Le coach et ses clients (livré)** — Karim rattache ses athlètes, publie
   des posts privés à ses seuls clients actifs, valide leurs séances depuis
   « Séances à valider » et leur répond par la messagerie intégrée.
3. **La réservation (livré)** — Karim ouvre des disponibilités (15 min à
   4 h, sans chevauchement) ; Lina réserve et peut annuler jusqu'à 24 h
   avant.
4. **Le programme généré par IA (en développement)** — Sofia décrit son
   objectif (« perte de poids, 3 séances/semaine, haltères uniquement ») et
   reçoit un programme construit à partir du catalogue réel, qu'elle ajuste
   puis planifie.
5. **La progression gamifiée (en développement)** — badges, expérience et
   défis récompensent la régularité ; des rappels de séance (centre de
   notifications dans l'application) évitent les oublis.
6. **L'administrateur (prévu, phase 14)** — un rôle ADMIN disposera d'un
   back-office pour superviser les comptes, modérer les contenus publics
   (programmes partagés, publications) et suivre l'état de la plateforme.

## 5. Architecture et frameworks

```
Navigateur ──▶ React SPA (Vite, :5173) ──HTTP/JSON, JWT Bearer──▶ API Spring Boot (:8080)
               │ MSW : API simulée (dev)                           │ Spring Security (filtre JWT)
               │ npm run gen:api ◀── springdoc /v3/api-docs        │ Modules com.fitcoach.*
                                                                   │ JPA/Hibernate (validate) + Flyway
                                                                   ▼
                                                            PostgreSQL 16 (Docker)
```

| Couche | Technologies |
| --- | --- |
| Frontend | TypeScript strict, Vite, React 19 ; TanStack Router et Query ; react-hook-form + zod ; zustand ; Tailwind v4 + shadcn/ui (Radix) ; client typé `openapi-typescript`/`openapi-fetch` ; MSW ; Vitest + Testing Library ; oxlint, Prettier |
| API / Backend | Java 21, Spring Boot 4.1 (Web MVC, Validation, Data JPA, Actuator) ; Spring Security + JWT (jjwt) ; contrôle d'accès par rôle (`@PreAuthorize`) et par relation coach/athlète ; erreurs ProblemDetail (RFC 9457) à codes stables ; springdoc-openapi (Swagger UI) |
| Base de données | PostgreSQL 16 + pgAdmin via Docker Compose ; Flyway seule source de vérité du schéma (`ddl-auto=validate`), une migration par phase, jamais modifiée après fusion ; base `fitcoach_test` séparée pour les tests, même moteur qu'en production |
| Qualité / CI | 18 classes de tests d'intégration backend (auth, autorisations, machine à états, réservation, messagerie, stats, fuseaux) + ArchUnit ; 8 suites de tests de pages frontend ; CI GitHub Actions sur chaque PR frontend (lint, format, typecheck, tests, build) ; badges version/licence/CI dans le README, couverture et qualité branchées en phase 14 |

Le backend est organisé par fonctionnalité et non par couche technique :
`common` (configuration, sécurité, erreurs), puis `identity`, `catalog`,
`program`, `training`, `planning`, `stats`, `coaching`, `booking`,
`messaging`, et les modules réservés `gamification`, `ai`, `nutrition` et
`admin`. Chaque module se découpe en `web`, `service`, `repository` et
`domain`, avec ses `dto`, ses `exception` et, quand d'autres modules en ont
besoin, une façade `api`. Le frontend reprend le même découpage
(`frontend/src/features/<module>`), si bien que chaque membre travaille dans
ses dossiers et que les conflits de fusion restent rares. Les unités sont
métriques en base (kilogrammes, centimètres) et l'API renvoie des codes
stables (`WEIGHT_LOSS`, `BEGINNER`…) que le frontend traduit.

## 6. Protocole d'usage de l'IA

Les assistants d'IA générative (Claude Code en CLI, Cursor en IDE) servent à
avancer plus vite ; **décisions et validation restent humaines**.

- **Usages autorisés** : implémentation à partir d'une conception décidée par
  l'équipe ; revue croisée (un assistant différent de celui qui a généré le
  code le relit : bugs, sécurité, cas limites) ; documentation relue par un
  membre.
- **Ce qui reste humain** : l'architecture (modules, frontières ArchUnit,
  modèle de données), le choix des cas de test, les règles d'autorisation et
  le contrat d'API.
- **Règles de livraison** : personne ne fusionne du code qu'il ne sait pas
  expliquer ; rien ne se livre sans tests verts (`./gradlew test` + CI
  frontend) ; tout passe par branche et PR, qui indique les parties générées
  par IA et l'outil utilisé (trailer `Co-Authored-By` tracé dans git) ; aucun
  secret transmis à un assistant.
- **IA dans le produit** (phase 12, en développement) : l'API Claude
  (Anthropic) génère des programmes côté serveur ; la sortie JSON est validée
  contre un schéma et les exercices proposés doivent exister dans le
  catalogue — aucune écriture directe en base.

## 7. Plan de développement en 14 phases et avancement

Le projet suit un plan incrémental en quatorze phases, chacune livrée par sa
branche et sa Pull Request, avec sa migration Flyway et ses tests. Ce
découpage donne une application utilisable dès les premières phases, puis
enrichie à chaque rendu.

| Phase | Contenu | État |
| --- | --- | --- |
| 1 | Socle technique : Gradle, Docker Compose, base de données, migration initiale, conventions d'équipe | Livrée |
| 2 | Authentification JWT, rôles, profil, préférences, suivi du poids corporel | Livrée |
| 3 | Catalogue d'exercices : muscles, tags, difficultés, alternatives, recherche filtrée | Livrée |
| 4 | Programmes : jours, prescriptions, réordonnancement, duplication, partage par lien, notation | Livrée |
| 5 | Carnet d'entraînement : séances, séries, volume, records personnels automatiques | Livrée |
| 6 | Planning : calendrier, séance du jour, reprogrammation, validation hiérarchique par le coach | Livrée |
| 7 | Statistiques : progression par exercice, volume hebdomadaire, streak, assiduité, répartition musculaire | Livrée |
| 8 | Portail de coaching : relation coach/athlète, publications privées, suivi (invitations et notes à venir) | En cours (Youcef) |
| 9 | Réservation de créneaux : disponibilités sans chevauchement, réservation, annulation | Livrée |
| 10 | Messagerie coach ↔ athlète : conversations, pagination par curseur, accusés de lecture | Livrée |
| 11 | Gamification : badges, points d'expérience, niveaux, classements, défis | En développement |
| 12 | Génération de programmes par IA (API Claude), sortie validée contre le catalogue | En développement |
| 13 | Nutrition (bonus) : plans alimentaires, journal des repas, besoins caloriques, recettes | Prévue (Mathieu) |
| 14 | Back-office d'administration, CI backend, couverture et qualité de code, déploiement | Prévue |

S'y ajoutent des fonctionnalités transverses déjà engagées : **rappels de
séance** (centre de notifications dans l'application, alimenté par les
séances planifiées du jour et du lendemain, et par les événements de
validation), et des pistes à l'étude pour les rendus suivants : export
PDF/CSV du carnet, mode hors-ligne (PWA), comparaison de progression entre
les athlètes d'un même coach.

Chaque rendu s'accompagne d'une mise à jour de ce dossier dans `/doc` : le
tableau de versions de la première page tracera les évolutions du périmètre,
les choix remis en cause et les enseignements tirés, afin que l'équipe
enseignante puisse suivre la trajectoire réelle du projet et non seulement
son état final.
