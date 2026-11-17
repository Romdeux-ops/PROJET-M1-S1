# FitCoach — Dossier de lancement

**Projet M1 S1 — Rendu 2 : v0.1.0 de l'application** · Plateforme fitness pour athlètes et coachs
Romain (`Romdeux-ops`), Youcef (`kratos-web`) et Mathieu (`Mathieuleboss`)

| Version | Date | Objet |
| --- | --- | --- |
| 1.0 | novembre 2026 | Rendu 1 : dossier de lancement |
| 1.1 | 2026-11-17 | Rendu 2 : v0.1.0 de l'application, intégration continue, évolution du dossier |

Ce dossier est versionné avec le code dans [`/doc`](.) : `dossier-lancement.md` est la source
lisible, `dossier-lancement.pdf` en est la version compilée (voir `doc/README.md` pour la
régénérer). Il évolue à chaque livraison.

## 1. Équipe et comptes développeurs

Nous sommes trois. Chacun porte une **feature majeure** dans son propre module (backend
`com.fitcoach.<module>`, frontend `frontend/src/features/<module>`), ce qui limite les
conflits de fusion.

| Membre | Compte GitHub | Feature majeure | État dans la v0.1.0 |
| --- | --- | --- | --- |
| Romain | `Romdeux-ops` (propriétaire du dépôt) | Messagerie coach ↔ athlète, et socle commun (architecture, JWT, Flyway, outillage frontend) | **Livrée** : conversation unique par paire, historique paginé par curseur, accusés de lecture, envoi conditionné à une relation active |
| Youcef | `kratos-web` | Portail de coaching | **Livré** : invitations coach → athlète (acceptation, refus, annulation, fin de suivi), notes privées, suivi d'un athlète, publications à images protégées, validation hiérarchique des séances, programmes visibles par les athlètes du coach avec notation |
| Mathieu | `Mathieuleboss` | Nutrition (plans alimentaires, journal des repas, besoins caloriques, recettes) | **Non livrée dans la v0.1.0** : aucun code de nutrition n'est présent dans le dépôt. Le module est volontairement isolé (aucun autre module n'en dépend) ; sa route et son entrée de menu existent côté frontend avec un écran d'attente |

Ce dossier présente l'état réel de la v0.1.0 : la nutrition est prévue et non commencée.
Une fonctionnalité supplémentaire (génération de programmes, gamification, notifications) a
été développée par l'équipe en plus des fonctionnalités majeures individuelles.

## 2. Dépôt et organisation du travail

- Dépôt principal (backend, frontend, documentation) :
  <https://github.com/Romdeux-ops/PROJET-M1-S1>
- Version à tester : branche **`release/v0.1.0`**, puis tag **`v0.1.0`** une fois créé
  (`git checkout v0.1.0` donne alors exactement la même version, figée par un commit).
- Monorepo : backend Spring Boot à la racine, frontend React dans `frontend/`.

**Règles d'équipe.** Aucun commit direct sur `main` : chaque fonctionnalité a sa branche
(`feature/...`, `fix/...`, `doc/...`) et passe par une Pull Request relue par un autre
membre. Une migration de base de données n'est jamais modifiée après sa fusion. Rien ne
se fusionne sans tests verts (`./gradlew test` et CI frontend).

**Pull Requests de la v0.1.0** (ouvertes, non fusionnées à la date du dossier) : #7 dossier,
#8 gamification (V11), #9 correction du statut 403, #10 rappels et notifications (V12),
#11 invitations et suivi (V13), #12 programmes pour les athlètes (V14), #13 génération de
programmes, #14 intégration continue et couverture. Elles sont fusionnées dans l'ordre des
migrations ; la branche `release/v0.1.0` les réunit toutes pour permettre de tester la
version complète sans attendre.

## 3. Le projet et son caractère innovant

**FitCoach** réunit au même endroit le carnet d'entraînement d'un sportif et sa relation
avec son coach. L'athlète construit ou suit des programmes, enregistre ses séances série par
série, planifie sa semaine et suit sa progression. Le coach suit ses athlètes, valide leurs
séances, publie du contenu, ouvre des créneaux de rendez-vous et leur écrit par messagerie.
Les applications grand public séparent ces usages ; chez FitCoach, **une seule règle les
relie** :

> **Un coach n'accède qu'aux données des athlètes avec lesquels il a une relation active.**
> Cette relation décide de qui voit les posts, valide une séance, réserve un créneau, ouvre
> une conversation ou reçoit un programme.

Ce qui éloigne FitCoach d'un simple CRUD :

- **Validation hiérarchique des séances** : une séance terminée par un athlète suivi passe en
  attente de validation par son coach (machine à états PLANNED → PENDING_VALIDATION →
  DONE/SKIPPED protégée côté serveur) ; un athlète autonome la valide lui-même.
- **Records personnels automatiques** : charge maximale et 1RM estimé (formule d'Epley)
  détectés à chaque série et recalculés à la suppression.
- **Relation coach/athlète à cycle de vie complet** : invitation, acceptation, refus, fin de
  suivi ; tant qu'elle n'est pas active, aucun accès n'est accordé.
- **Programmes partagés à la carte** : privés, publics, partagés par lien, ou visibles des
  seuls athlètes du coach (« Mes athlètes »), avec notation de 1 à 5.
- **Gamification dérivée des faits** : l'expérience et les badges sont calculés à partir de
  l'activité réelle, jamais stockés séparément, donc impossibles à désynchroniser.
- **Génération de programmes** à partir du vrai catalogue : un générateur à base de règles
  fonctionne sans aucune clé ; l'API Claude se branche en option, avec une sortie validée
  contre le catalogue.
- **Contrat d'API typé de bout en bout** : springdoc publie l'OpenAPI, `openapi-typescript`
  en tire les types du frontend ; si front et back divergent, la compilation échoue.
- **Frontières d'architecture vérifiées par des tests** (ArchUnit) et **intégrité portée par
  PostgreSQL** (contraintes d'exclusion `gist` contre le chevauchement des créneaux,
  `citext`, unicité de la paire coach/athlète sous accès concurrent).

## 4. Scénarios d'usage

Trois rôles : ATHLETE, COACH, ADMIN.

1. **L'athlète autonome (livré)** — Lina s'inscrit, règle son profil et ses unités, parcourt
   le catalogue (18 exercices filtrables), génère puis enregistre un programme, planifie sa
   semaine, saisit ses séries (charge, répétitions, RPE), voit ses records et gagne ses
   premiers badges. Elle suit volume, streak, assiduité, 1RM et répartition musculaire.
2. **Le coach et ses clients (livré)** — Karim invite ses athlètes par e-mail ; une fois
   l'invitation acceptée, il publie des posts privés, crée un programme visible par ses
   seuls athlètes, consulte leur suivi, écrit des notes que l'athlète ne voit jamais et
   valide leurs séances depuis « Séances à valider ».
3. **La réservation (livré)** — Karim ouvre des disponibilités (15 min à 4 h, sans
   chevauchement) ; Lina réserve et peut annuler jusqu'à 24 h avant. Karim est notifié de la
   réservation ou de l'annulation, et chacun reçoit un rappel la veille.
4. **La messagerie (livré)** — Lina et Karim échangent dans une conversation unique avec
   accusés de lecture, tant que leur relation est active.
5. **Les rappels et notifications (livré)** — une cloche signale les séances prévues
   aujourd'hui ou demain, les séances à valider ou validées et les réservations.
6. **La progression gamifiée (livré)** — badges (première séance, 10 et 50 séances, premier
   programme, séries de 7 et 30 jours, premier record, 10 records), niveaux et classement.
7. **La nutrition (prévu)** — plans alimentaires, journal des repas et besoins caloriques.
8. **L'administrateur (prévu)** — back-office pour superviser les comptes et modérer les
   contenus publics.

## 5. Contenu de la v0.1.0, phase par phase

Le projet suit un plan incrémental en quatorze phases, chacune livrée par sa branche, sa
Pull Request, sa migration Flyway et ses tests.

| Phase | Contenu | État dans la v0.1.0 |
| --- | --- | --- |
| 1 | Socle technique : Gradle, Docker Compose, base de données, migration initiale | Livrée |
| 2 | Authentification JWT, rôles, profil, préférences, poids corporel | Livrée |
| 3 | Catalogue d'exercices : muscles, tags, difficultés, alternatives, recherche | Livrée |
| 4 | Programmes : jours, prescriptions, duplication, partage, notation, visibilité « Mes athlètes » | Livrée |
| 5 | Carnet d'entraînement : séances, séries, volume, records personnels | Livrée |
| 6 | Planning : calendrier, séance du jour, reprogrammation, validation par le coach | Livrée |
| 7 | Statistiques : progression, volume, streak, assiduité, répartition musculaire | Livrée |
| 8 | Portail de coaching : invitations, notes privées, suivi, publications | Livrée |
| 9 | Réservation de créneaux : disponibilités, réservation, annulation | Livrée |
| 10 | Messagerie coach ↔ athlète | Livrée |
| 11 | Gamification : badges, expérience, niveaux, classement | Livrée (défis non faits) |
| 12 | Génération de programmes (règles, Claude en option) | Livrée |
| 13 | Nutrition (bonus) | Non livrée |
| 14 | Back-office, CI, déploiement | CI livrée ; back-office et déploiement non réalisés |

Hors plan numéroté : notifications et rappels (migration V12) et programmes visibles par les
athlètes du coach (V14). Le détail est dans `CHANGELOG.md`.

## 6. Architecture et frameworks

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
| Frontend | TypeScript strict, Vite, React 19 ; TanStack Router et Query ; react-hook-form + zod ; zustand ; Tailwind v4 + shadcn/ui (Radix) ; client typé `openapi-typescript` / `openapi-fetch` ; MSW ; Vitest + Testing Library ; oxlint, Prettier |
| API / Backend | Java 21, Spring Boot 4.1 (Web MVC, Validation, Data JPA, Actuator) ; Spring Security + JWT (jjwt) ; contrôle d'accès par rôle (`@PreAuthorize`) et par relation coach/athlète ; erreurs ProblemDetail (RFC 9457) à codes stables ; springdoc-openapi (Swagger UI) ; tâches planifiées (rappels) |
| Base de données | PostgreSQL 16 + pgAdmin via Docker Compose ; Flyway seule source de vérité du schéma (`ddl-auto=validate`), migrations V1 à V14, une par phase ; base `fitcoach_test` séparée pour les tests, même moteur qu'en production |
| Qualité / CI | JUnit 5 et Spring (tests d'intégration sur PostgreSQL réel), ArchUnit, JaCoCo ; Vitest, Testing Library, oxlint ; GitHub Actions |

**Organisation du code.** Le backend est un monolithe modulaire découpé par fonctionnalité :
`common` (configuration, sécurité, erreurs), `identity`, `catalog`, `program`, `training`,
`planning`, `stats`, `coaching`, `booking`, `messaging`, `gamification`, `notification`,
`ai`, et les modules réservés `nutrition` et `admin`. Chaque module se découpe en `web`,
`service`, `repository` et `domain`, avec ses `dto`, ses `exception` et, quand d'autres
modules en ont besoin, une façade `api`. Un module n'utilise un autre module que par cette
façade, et `common` ne dépend d'aucun module métier : deux règles vérifiées à chaque build
par `ArchitectureTest`. Le frontend reprend le même découpage. Les unités sont métriques
en base (kilogrammes, centimètres) et l'API renvoie des codes stables (`WEIGHT_LOSS`,
`BEGINNER`…) que le frontend traduit.

**Sécurité.** Authentification JWT sans état ; secret JWT sans valeur par défaut hors profils
`dev` et `test` ; rôles contrôlés par `@PreAuthorize` avec un vrai statut **403** en HTTP
(un test de bout en bout le vérifie) ; les ressources d'autrui répondent 404 plutôt que 403
pour ne pas révéler leur existence ; images de publications servies par un point d'accès
authentifié réservé au coach et à ses clients actifs ; contenu réel des fichiers envoyés
vérifié ; erreurs d'intégrité journalisées sans détail exposé au client.

## 7. Intégration continue et qualité

**Workflows GitHub Actions** (`.github/workflows/`) :

| Workflow | Déclencheur | Contenu |
| --- | --- | --- |
| `backend.yml` | modifications de `src/**`, `build.gradle`, `gradle/**` | Java 21, PostgreSQL 16 en service, `./gradlew build` (tests + JaCoCo), rapport de couverture en artefact |
| `frontend.yml` | modifications de `frontend/**` | lint, format, typecheck, tests avec couverture, build, rapport en artefact |

Ils s'exécutent à chaque Pull Request concernée. Au moment de ce dossier, les workflows
n'ont pas encore été exécutés sur GitHub : le premier résultat apparaît à l'ouverture de la
Pull Request correspondante.

**Tests et couverture, mesurés sur la v0.1.0** (2026-11-17) :

| Périmètre | Tests | Couverture (lignes) |
| --- | --- | --- |
| Backend | 146 tests dans 31 classes, 0 échec | 81,0 % (2 488 lignes sur 3 071) |
| Frontend | 70 tests dans 11 fichiers, 0 échec | 53,8 % (883 lignes sur 1 640) |

Les tests backend couvrent l'authentification, les autorisations et le 403 réel, la machine
à états du planning, les records personnels, les statistiques et leurs fuseaux, les
invitations (y compris les relations en attente ou refusées), les programmes visibles par
les athlètes et leur notation, la réservation, la messagerie, la gamification, les
notifications, la génération de programmes et les règles d'architecture. Les couvertures
sont données en clair : un badge dynamique (Codecov, SonarCloud) demande un compte et un
jeton que seul le propriétaire du dépôt peut créer.

## 8. Protocole d'usage de l'IA

Les assistants d'IA générative servent à avancer plus vite ; **les décisions et la validation
restent humaines**.

- **Outils** : Claude Code (Anthropic) en ligne de commande et Cursor en éditeur. Chaque
  intervention est tracée dans l'historique git (trailer `Co-Authored-By`).
- **Usages autorisés** : implémentation à partir d'une conception décidée par l'équipe ;
  revue croisée (un assistant différent de celui qui a généré le code le relit : bugs,
  sécurité, cas limites ; une telle revue a produit un plan de remédiation complet appliqué
  avant cette version) ; écriture de tests ; documentation relue par un membre.
- **Ce qui reste humain** : l'architecture (modules, frontières ArchUnit, modèle de
  données), le choix des cas de test, les règles d'autorisation, le contrat d'API et le
  choix des fonctionnalités.
- **Règles de livraison** : personne ne fusionne du code qu'il ne sait pas expliquer ; rien
  ne se livre sans tests verts ; tout passe par branche et Pull Request qui indique les
  parties générées par IA ; aucun secret n'est transmis à un assistant.
- **IA dans le produit** : la génération de programmes utilise par défaut un générateur
  **à base de règles**, déterministe et sans appel réseau ; l'**API Claude** (Anthropic) est
  branchée en option par `ANTHROPIC_API_KEY` (stratégie `auto`, `rules` ou `claude`). Dans
  tous les cas, la sortie est un brouillon validé contre le catalogue réel (les exercices
  inconnus sont écartés, séries et répétitions bornées) et **n'écrit jamais en base** :
  l'utilisateur l'enregistre explicitement par les routes habituelles des programmes.

## 9. Installer et tester la v0.1.0

Prérequis : JDK 21, Docker Desktop lancé, Node.js 22 ou plus, Git. Le pas à pas complet,
le parcours de test et le dépannage sont dans la section « Tester la v0.1.0 » du `README.md`.
En résumé :

```
git clone https://github.com/Romdeux-ops/PROJET-M1-S1.git && cd PROJET-M1-S1
git checkout release/v0.1.0        # puis : git checkout v0.1.0 une fois le tag créé
cp .env.example .env && docker compose up -d
./gradlew bootRun                  # terminal 1
cd frontend && npm install && npm run dev    # terminal 2 : http://localhost:5173
```

Sur une base vide en profil `dev`, deux comptes de démonstration sont créés
(`coach@fitcoach.dev` et `athlete@fitcoach.dev`, mot de passe `Password1`), déjà reliés,
avec un programme visible par les athlètes et une séance prévue aujourd'hui.
`npm run dev:mock` lance le frontend seul, avec une API simulée.

## 10. Limites connues et feuille de route

- **Nutrition** (Mathieu) : non commencée dans cette version.
- **Back-office d'administration** et **déploiement** : non réalisés.
- **Défis** de la gamification : non implémentés (badges, expérience et classement le sont).
- **Badges dynamiques** de couverture et de qualité de code : à brancher par le
  propriétaire du dépôt (compte Codecov ou SonarCloud et jeton).
- **Fichier `LICENSE`** absent : la licence est à choisir par le propriétaire du dépôt ;
  aucun badge de licence n'est affiché en attendant.
- **API Claude** : le chemin Claude de la génération n'a pas été exécuté contre la vraie
  API (aucun appel réel dans les tests) ; seul le générateur à règles est vérifié de bout
  en bout. Les contraintes libres saisies par l'utilisateur ne sont pas interprétées par
  les règles.
- **Pistes** pour la suite : export PDF/CSV du carnet, mode hors ligne (PWA), comparaison de
  progression entre athlètes d'un même coach, validation optionnelle des réservations par
  le coach, déploiement.
