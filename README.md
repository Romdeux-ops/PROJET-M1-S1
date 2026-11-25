# FitCoach - Backend

![Version](https://img.shields.io/badge/version-0.1.2-blue)
[![Backend CI](https://github.com/Romdeux-ops/PROJET-M1-S1/actions/workflows/backend.yml/badge.svg)](https://github.com/Romdeux-ops/PROJET-M1-S1/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/Romdeux-ops/PROJET-M1-S1/actions/workflows/frontend.yml/badge.svg)](https://github.com/Romdeux-ops/PROJET-M1-S1/actions/workflows/frontend.yml)

Backend de l'application fitness mettant en relation athletes et coachs : carnet
d'entrainement, programmes, planning, statistiques, portail de coaching,
reservation de creneaux, messagerie et generation de programmes par IA.

## Stack

| Element | Version | Remarque |
| --- | --- | --- |
| Java | 21 (LTS) | toolchain declaree dans `build.gradle` |
| Spring Boot | 4.1.1 | la branche 3.5 est en fin de support OSS depuis juin 2026 |
| Gradle | wrapper fourni | Groovy DSL |
| PostgreSQL | 16 | via Docker Compose |
| Flyway | starter Spring Boot | seule source de verite du schema |
| springdoc-openapi | 3.1.1 | la ligne 3.x est celle compatible Boot 4 |

Le frontend React / TypeScript / Tailwind vit dans [`frontend/`](frontend/README.md).

## Tester la v0.1.2

Version livree pour le Rendu 3, figee par le tag `v0.1.2`
([release GitHub](https://github.com/Romdeux-ops/PROJET-M1-S1/releases/tag/v0.1.2)). En attendant la fusion dans `main`, le meme code est sur la
branche `release/v0.1.2`. Le detail des changements est dans
[CHANGELOG.md](CHANGELOG.md).

**Prerequis** : JDK 21, Docker Desktop **lance**, Node.js 22 ou plus, Git.

```bash
git clone https://github.com/Romdeux-ops/PROJET-M1-S1.git
cd PROJET-M1-S1
git checkout v0.1.2
cp .env.example .env               # PowerShell : Copy-Item .env.example .env
docker compose up -d               # PostgreSQL (5432) et pgAdmin (5050)
./gradlew bootRun                  # Windows : .\gradlew.bat bootRun
```

Dans un **second terminal** :

```bash
cd frontend
npm install
npm run dev
```

| Quoi | Ou |
| --- | --- |
| Application | http://localhost:5173 |
| API et Swagger UI | http://localhost:8080 et http://localhost:8080/swagger-ui.html |

Au premier demarrage en profil `dev` (`./gradlew bootRun`), des **comptes de demo**
sont crees sur une base vide (mot de passe `Password1`) : `coach@fitcoach.dev` et
`athlete@fitcoach.dev`, deja relies, avec un programme visible par les athletes du
coach et une seance prevue aujourd'hui. Sans backend, `npm run dev:mock` (dans
`frontend/`) lance l'application avec une API simulee et les memes comptes de demo
(les donnees y sont perdues a chaque rechargement).

**Parcours de test conseille**

1. Se connecter en `athlete@fitcoach.dev` : la cloche affiche le rappel de la
   seance du jour (le job de rappels tourne ~10 s apres le demarrage, puis toutes
   les 15 min) ; la page *Progression* (« Defis & badges ») montre XP et badges.
2. *Programmes* > *Programmes de mon coach* : ouvrir le programme du coach, le noter
   (etoiles) ou le dupliquer.
3. *Carnet* : creer une seance et ajouter des series (+XP, badge « Premiere seance »,
   record personnel).
4. *Generation IA* : generer un programme (sans cle API : generateur a regles), le
   regenerer, l'enregistrer.
5. Se deconnecter, creer un **nouveau compte coach** et un **nouveau compte athlete**
   sur `/register` ; en coach, *Coaching* > inviter l'athlete par e-mail ; en athlete,
   accepter l'invitation ; en coach, ouvrir la fiche de l'athlete (suivi, notes
   privees), creer un programme en visibilite « Mes athletes », publier un creneau
   (*Reservation*) ; en athlete, le reserver : le coach recoit la notification.

**Tests** : `./gradlew test` (backend, PostgreSQL requis, voir plus bas) et
`cd frontend && npm test`.

**En cas de probleme**

| Symptome | Remede |
| --- | --- |
| `Cannot connect to the Docker daemon` | lancer Docker Desktop, attendre qu'il soit pret, puis `docker compose up -d` |
| Erreur Flyway « checksum » ou « migration not resolved » (base creee avec une autre version) | repartir d'une base vierge : `docker compose down -v && docker compose up -d` |
| `Port 8080` ou `5173` deja utilise | arreter le processus qui l'occupe (`lsof -i :8080` sous macOS/Linux, `netstat -ano \| findstr 8080` sous Windows) |
| Les comptes de demo n'existent pas | ils ne sont crees que sur une base vide en profil `dev` ; sinon `docker compose down -v` |

## Demarrer en local

Prerequis : JDK 21 et Docker Desktop en cours d'execution.

```bash
cp .env.example .env      # facultatif, les valeurs par defaut suffisent
docker compose up -d      # PostgreSQL sur 5432, pgAdmin sur 5050
./gradlew bootRun         # .\gradlew.bat bootRun sous Windows
```

Au demarrage, Flyway applique les migrations puis Hibernate valide que les
entites correspondent au schema obtenu.

`application.yml` ne definit aucun profil par defaut : `./gradlew bootRun`
active `dev` (secret JWT de repli, logs SQL) si `SPRING_PROFILES_ACTIVE` est
absent, mais un jar lance ailleurs exige `SPRING_PROFILES_ACTIVE` et
`JWT_SECRET` explicites. `APP_TIME_ZONE` (defaut `Europe/Paris`) fixe le fuseau
des notions "aujourd'hui" et "semaine" ; les instants sont stockes en UTC.

La generation de programmes (phase 12, `POST /api/ai/program-generation`) marche
sans aucune cle : un generateur deterministe a base de regles compose les seances
a partir du vrai catalogue (groupes musculaires primaires, niveau, materiel,
objectif). Claude reste branche mais optionnel. `FITCOACH_AI_STRATEGY`
(`fitcoach.ai.strategy`) choisit le generateur :

| Valeur | Comportement |
| --- | --- |
| `auto` (defaut) | Claude si `ANTHROPIC_API_KEY` est renseignee, sinon les regles. Un echec de Claude reste un 503, sans repli silencieux. |
| `rules` | toujours les regles, meme avec une cle. |
| `claude` | toujours Claude ; 503 sans cle. |

Pour activer Claude, renseigner `ANTHROPIC_API_KEY` dans `.env` (modele par defaut
`claude-opus-5-5`, surchargeable avec `ANTHROPIC_MODEL`). La reponse indique son
origine dans `source` (`RULES` ou `CLAUDE`) ; `variant` (entier >= 0) fait tourner
la selection des regles pour obtenir un autre programme a entree egale.

| Service | URL |
| --- | --- |
| API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Etat de l'application | http://localhost:8080/actuator/health |
| pgAdmin | http://localhost:5050 |

### Frontend

Prerequis : Node.js 22 ou plus.

```bash
cd frontend
npm install
npm run dev:mock   # sans backend : API simulee (comptes de demo sur la page de connexion)
npm run dev        # avec le backend lance : /api est proxifie vers localhost:8080
```

L'application est servie sur http://localhost:5173. Le detail (architecture,
ajout d'une fonctionnalite, conventions) est dans [frontend/README.md](frontend/README.md).

## Tests

```bash
./gradlew test
```

Les tests tournent sur `fitcoach_test`, une base separee du meme conteneur
PostgreSQL, creee automatiquement a la premiere initialisation du volume par
`docker/postgres/init/01-create-test-database.sql`. Un `./gradlew test` ne
touche donc jamais aux donnees de developpement, et le moteur reste identique a
celui de production, ce qui compte ici : le schema utilise des specificites
PostgreSQL (`citext`, `gen_random_uuid`, les contraintes d'exclusion `gist`
du module de reservation) qu'une base en memoire ne sait pas reproduire.

Si la base `fitcoach_test` est absente, le volume a ete cree avant l'ajout du
script d'init. Pour la creer :

```bash
docker compose down -v && docker compose up -d
```

> Testcontainers n'est pas utilise : la version 1.21.3 (la plus recente a ce
> jour) echoue a negocier l'API de Docker Engine 29 et ne detecte aucun
> environnement Docker valide. La CI s'appuie sur un conteneur de service
> PostgreSQL 16 declare dans le workflow.

### Integration continue et couverture

Deux workflows GitHub Actions tournent sur chaque Pull Request qui touche le
code concerne :

| Workflow | Declencheur | Contenu |
| --- | --- | --- |
| `backend.yml` | `src/**`, `build.gradle`, `gradle/**` | PostgreSQL 16 en service, `./gradlew build` (tests + JaCoCo), rapport en artefact `jacoco-report` |
| `frontend.yml` | `frontend/**` | lint, format, typecheck, tests avec couverture, build, rapport en artefact `vitest-coverage` |

Couverture en local :

```bash
./gradlew test jacocoTestReport     # build/reports/jacoco/test/html/index.html
cd frontend && npm run test:coverage # frontend/coverage/index.html
```

Couverture mesuree le 2026-11-17 sur la v0.1.0 (a titre indicatif, pas un seuil) :
backend 81,0 % des lignes (146 tests), frontend 53,8 % des lignes (70 tests). Ces
chiffres sont donnes en clair et non sous forme de badge : un badge de
couverture ou de qualite de code dynamique (Codecov, SonarCloud) exige que le
proprietaire du depot cree un compte et ajoute un jeton dans les secrets
GitHub ; il sera branche a ce moment-la. La qualite du frontend est controlee
par `oxlint` et `prettier` dans la CI. Aucun badge de licence n'est affiche
tant que le depot ne contient pas de fichier `LICENSE`.

## Equipe et features majeures

Une feature majeure par etudiant, dans son module (backend `com.fitcoach.<module>`,
frontend `frontend/src/features/<module>`). Le detail est dans
[doc/dossier-lancement.md](doc/dossier-lancement.md), section 1.

| Membre | Compte GitHub | Feature majeure | v0.1.2 |
| --- | --- | --- | --- |
| Romain | `Romdeux-ops` | Messagerie coach / athlete (module `messaging`) et socle commun | Livree |
| Youcef | `Krat0s-web` | Portail de coaching : invitations, notes privees, suivi, programmes pour les athletes du coach (modules `coaching`, `program`) | Livree |
| Mathieu | `Mathieuleboss` | Nutrition (module `nutrition`) | Livree (branche `feature/nutrition`, integree a la release) |

## Organisation du code

Le projet est un monolithe modulaire decoupe **par fonctionnalite** et non par
couche technique. Chaque membre du groupe travaille dans son package, ce qui
reduit fortement les conflits de merge : avec un decoupage en
`controllers/ services/ repositories/`, tout le monde edite les memes dossiers.

```
com.fitcoach
├── common/        code transverse (configuration, securite, erreurs)
├── identity/      comptes, roles, profil, preferences, poids corporel
├── catalog/       exercices, muscles, tags, alternatives
├── program/       programmes, jours, prescriptions, notations
├── training/      seances realisees, series, volume, records
├── planning/      calendrier, seance du jour, reprogrammation
├── stats/         agregations, courbes, streak, rapports
├── coaching/      relation coach-athlete, suivi, notes
├── booking/       disponibilites et reservations
├── messaging/     conversations et messages
├── gamification/  badges, experience, classements, defis
├── nutrition/     plans, journal alimentaire, recettes (bonus)
├── ai/            generation de programmes
└── admin/         back-office
```

Chaque package porte un `package-info.java` decrivant sa responsabilite, ses
tables et la phase du projet a laquelle il appartient.

## Regles de l'equipe

**Aucun commit direct sur `main`.** Une branche par phase, puis une Pull Request.

```bash
git checkout main && git pull
git checkout -b feature/nom-de-la-feature
```

**Le schema appartient a Flyway.** `spring.jpa.hibernate.ddl-auto` est fixe a
`validate` et ne doit jamais passer a `update`. Toute evolution du schema passe
par un nouveau fichier `src/main/resources/db/migration/V<n>__description.sql`.

**Une migration jamais modifiee apres son merge.** Flyway enregistre une somme
de controle ; editer un fichier deja applique casse la base de tous les autres.
Pour corriger, on ajoute une migration suivante.

**Une migration par phase**, numerotee selon l'ordre du plan, afin d'eviter que
tout le monde edite le meme fichier.

**Les unites sont metriques en base.** Les charges sont en kilogrammes et les
mensurations en centimetres, sans exception. La preference `unit_system` de
l'utilisateur n'est qu'une conversion d'affichage cote client. Stocker des
unites melangees fausserait les calculs de volume et les comparaisons de
records.

**L'API renvoie des codes stables**, pas du texte traduit : `WEIGHT_LOSS`,
`BEGINNER`, `PUSH`. La traduction francais / anglais est la responsabilite du
frontend.

## Etat d'avancement

- [x] Phase 1 — socle technique, base de donnees, migration initiale
- [x] Phase 2 — authentification JWT et profil
- [x] Phase 3 — catalogue d'exercices
- [x] Phase 4 — programmes
- [x] Phase 5 — carnet d'entrainement
- [x] Phase 6 — planning
- [x] Phase 7 — statistiques
- [x] Phase 8 — portail de coaching
- [x] Phase 9 — reservation de creneaux
- [x] Phase 10 — messagerie
- [x] Phase 11 — gamification
- [x] Phase 12 — generation par IA
- [ ] Phase 13 — nutrition (bonus)
- [ ] Phase 14 — back-office, CI, deploiement
