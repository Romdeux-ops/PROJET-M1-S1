# FitCoach — Frontend

Application web de FitCoach : React 19, TypeScript strict, Vite, Tailwind CSS v4
et shadcn/ui. Elle consomme l'API Spring Boot du dossier parent.

## Demarrer

Prerequis : Node.js 22 ou plus.

```bash
npm install
npm run dev:mock   # API simulee par MSW, aucun backend necessaire
npm run dev        # API reelle : lancer d'abord le backend (./gradlew bootRun)
```

http://localhost:5173. En mode mock, la page de connexion propose trois comptes
de demo (athlete, coach, admin, mot de passe `Password1`).

| Script                     | Role                                                          |
| -------------------------- | ------------------------------------------------------------- |
| `npm run dev` / `dev:mock` | serveur de dev, backend reel / simule                         |
| `npm run build`            | build de production dans `dist/`                              |
| `npm run lint`             | oxlint (regles ESLint, en beaucoup plus rapide)               |
| `npm run format`           | Prettier, tri des classes Tailwind inclus                     |
| `npm run typecheck`        | regenere les routes puis `tsc`                                |
| `npm test` / `test:watch`  | Vitest + Testing Library                                      |
| `npm run gen:api`          | regenere les types depuis `http://localhost:8080/v3/api-docs` |

La CI (`.github/workflows/frontend.yml`) lance lint, format, typecheck, tests et
build sur toute PR qui touche `frontend/`.

## Stack

| Besoin          | Outil                                                        |
| --------------- | ------------------------------------------------------------ |
| Routage         | TanStack Router, routes par fichiers et typees               |
| Donnees serveur | TanStack Query (cache, chargement, erreurs, invalidation)    |
| Formulaires     | react-hook-form + zod                                        |
| Etat client     | zustand (session, theme, etat du layout)                     |
| UI              | Tailwind v4, shadcn/ui (Radix), lucide-react, sonner, motion |
| Contrat API     | openapi-typescript + openapi-fetch                           |
| Mocks           | MSW, partage entre le navigateur et les tests                |

## Organisation

Le front est decoupe **par fonctionnalite**, avec les memes modules que le
backend (`com.fitcoach.*`). Chacun travaille dans son dossier `src/features/<module>`.

```
src/
├── app/              providers, routeur, layouts (AppShell, AuthLayout)
├── routes/           fichiers de routes : fins, ils branchent une page de feature
├── features/
│   ├── navigation.ts registre unique du menu (sidebar, mobile, recherche Ctrl+K)
│   ├── identity/     connexion, inscription, profil
│   ├── training/     FEATURE DE REFERENCE, a copier (voir note ci-dessous)
│   ├── dashboard/    tableau de bord (agrege stats et training)
│   └── program/ planning/ stats/ coaching/ booking/ messaging/
│       ai/ gamification/ nutrition/ catalog/ admin/
├── components/
│   ├── ui/           composants shadcn (generes, modifiables)
│   └── *.tsx         composants transverses : PageHeader, EmptyState, StatCard,
│                     DataTable, ErrorState, ModulePlaceholder...
├── lib/
│   ├── api/          client HTTP, erreurs, schema.d.ts (genere)
│   ├── auth/         session, roles, guards de routes
│   └── ...           query-client, theme, format, utils
├── mocks/            handlers MSW par feature + base en memoire (db.ts)
├── styles/           globals.css : tokens du theme clair / sombre
└── test/             setup Vitest et helpers de rendu
```

Structure d'une feature :

```
features/training/
├── api/training-api.ts        appels HTTP + contrat attendu du backend
├── hooks/use-sessions.ts      cles de cache, queries et mutations
├── components/                composants propres a la feature
├── pages/training-page.tsx    page (+ son test .test.tsx)
├── schemas.ts                 types et schemas zod
└── index.ts                   API publique de la feature
```

**Regle d'import** : une feature n'importe une autre feature que via son
`index.ts` (`@/features/training`), jamais un fichier interne.

> **Note** : `training` a d'abord ete maquette avec un type de seance
> (`STRENGTH`/`CARDIO`/`HIIT`/`MOBILITY`), un `perceivedEffort` et un
> `exerciseCount`. Ces champs ont ete retires lors du branchement sur le vrai
> backend (phase 5) au profit du contrat reel : une seance a des `sets`
> individuels (exercice, charge, repetitions, RPE) et un `totalVolume` calcule,
> sans notion de type global.

## Ajouter une fonctionnalite en 5 etapes

Exemple : la liste des programmes dans `features/program`.

1. **Contrat et types**, dans `schemas.ts` : l'interface renvoyee par l'API et
   le schema zod des formulaires.
2. **Appels API**, dans `api/program-api.ts`, en ecrivant en commentaire le
   contrat attendu (methode, URL, corps, reponse) pour le binome backend :

   ```ts
   export const programApi = {
     list: () => http.get<Program[]>('/api/programs'),
   }
   ```

3. **Hooks**, dans `hooks/use-programs.ts` : une fabrique de cles
   (`programKeys`), `useQuery` pour lire, `useMutation` pour ecrire, et
   `meta.successMessage` pour le toast de succes. Les erreurs sont affichees
   automatiquement (voir `lib/query-client.ts`).
4. **Mock**, dans `src/mocks/handlers/program.ts`, a ajouter dans
   `handlers/index.ts`. La feature marche alors en `dev:mock` et en test avant
   que le backend existe.
5. **Page**, en remplacant le `ModulePlaceholder` de `pages/program-page.tsx`,
   puis en ajoutant un test `program-page.test.tsx` (modele : `training-page.test.tsx`).

La route (`src/routes/_app/program.tsx`) et l'entree de menu (`features/navigation.ts`)
existent deja pour les modules du backend. Pour une **nouvelle page** : creer
le fichier dans `src/routes/_app/`, l'arbre de routes est regenere
automatiquement par `npm run dev`. Pour une **page reservee** :
`beforeLoad: requireRole('COACH')` et `roles: ['COACH']` dans la navigation.

## Brancher le vrai backend

Quand un endpoint est livre cote Spring :

1. backend lance, `npm run gen:api` met a jour `src/lib/api/schema.d.ts` ;
2. dans `api/*.ts`, remplacer `http` par le client type `api` :

   ```ts
   list: () => unwrap(api.GET('/api/programs')),
   ```

   URL, parametres et reponses sont alors verifies par TypeScript contre le
   contrat OpenAPI ;

3. garder le handler MSW : il sert toujours aux tests et au mode demo.

L'authentification est centralisee : le JWT est ajoute a chaque requete, et un
401 deconnecte l'utilisateur et le renvoie vers `/login`.

Contrats consommes par le front a ce jour :

| Methode | URL                                               | Reponse                                                       |
| ------- | -------------------------------------------------- | ------------------------------------------------------------- |
| POST    | `/api/auth/login`                                  | `{ accessToken, user }`                                       |
| POST    | `/api/auth/register`                               | `{ accessToken, user }`                                       |
| GET     | `/api/users/me`                                    | `user` (`id, email, firstName, lastName, roles[], avatarUrl`) |
| GET     | `/api/users/me/profile`                            | `ProfileResponse`                                              |
| PATCH   | `/api/users/me/profile`                            | `ProfileResponse`                                              |
| POST    | `/api/users/me/profile/avatar`                     | `{ avatarUrl }`                                                |
| GET     | `/api/catalog/muscle-groups`                       | `MuscleGroup[]`                                                |
| GET     | `/api/catalog/tags`                                | `Tag[]`                                                        |
| GET     | `/api/catalog/exercises`                           | `Exercise[]` (filtres en query string)                         |
| GET     | `/api/catalog/exercises/{id}`                      | `Exercise`                                                     |
| POST    | `/api/catalog/exercises`                           | `Exercise` (201, role COACH/ADMIN)                              |
| PUT     | `/api/catalog/exercises/{id}`                      | `Exercise` (role COACH/ADMIN)                                   |
| DELETE  | `/api/catalog/exercises/{id}`                      | 204 (role COACH/ADMIN)                                          |
| GET     | `/api/programs`                                    | `Program[]` (filtres en query string)                          |
| GET     | `/api/programs/{id}`                               | `Program`                                                       |
| GET     | `/api/programs/shared/{token}`                     | `Program` (public, sans auth)                                   |
| POST    | `/api/programs`                                    | `Program` (201)                                                 |
| PUT     | `/api/programs/{id}`                               | `Program` (proprietaire)                                        |
| DELETE  | `/api/programs/{id}`                               | 204 (proprietaire)                                              |
| POST    | `/api/programs/{id}/duplicate`                     | `Program` (201)                                                 |
| POST    | `/api/programs/{id}/days`                          | `Program` (proprietaire)                                        |
| DELETE  | `/api/programs/{id}/days/{dayId}`                  | `Program` (proprietaire)                                        |
| PATCH   | `/api/programs/{id}/days/positions`                | `Program` (proprietaire)                                        |
| POST    | `/api/programs/{id}/days/{dayId}/exercises`        | `Program` (proprietaire)                                        |
| DELETE  | `/api/programs/{id}/days/{dayId}/exercises/{eid}`  | `Program` (proprietaire)                                        |
| POST    | `/api/programs/{id}/ratings`                       | `Program` (non-proprietaire, programme public)                  |
| GET     | `/api/training/sessions`                           | `TrainingSession[]`                                             |
| GET     | `/api/training/sessions/{id}`                      | `TrainingSession`                                               |
| POST    | `/api/training/sessions`                           | `TrainingSession` (201)                                         |
| DELETE  | `/api/training/sessions/{id}`                      | 204                                                             |
| POST    | `/api/training/sessions/{id}/sets`                 | `TrainingSession`                                               |
| DELETE  | `/api/training/sessions/{id}/sets/{setId}`         | `TrainingSession`                                               |
| GET     | `/api/training/personal-records`                   | `PersonalRecord[]`                                              |
| GET     | `/api/planning/scheduled?from=&to=`                | `ScheduledSession[]`                                            |
| GET     | `/api/planning/scheduled/today`                    | `ScheduledSession[]`                                            |
| POST    | `/api/planning/scheduled`                          | `ScheduledSession` (201)                                        |
| PATCH   | `/api/planning/scheduled/{id}/reschedule`          | `ScheduledSession`                                               |
| PATCH   | `/api/planning/scheduled/{id}/skip`                | `ScheduledSession`                                               |
| PATCH   | `/api/planning/scheduled/{id}/complete`            | `ScheduledSession` (verifie le proprietaire du `workoutSessionId`) |
| PATCH   | `/api/planning/scheduled/{id}/validate`            | `ScheduledSession` (coach actif de l'athlete)                    |
| GET     | `/api/planning/pending-validations`                | `ScheduledSession[]` (coach)                                     |
| DELETE  | `/api/planning/scheduled/{id}`                     | 204                                                              |
| GET     | `/api/stats/overview`                              | `StatsOverview`                                                  |
| GET     | `/api/stats/exercises/{exerciseId}/progression`    | `ExerciseProgressionPoint[]`                                     |
| GET     | `/api/stats/volume/weekly?weeks=`                  | `WeeklyVolumePoint[]`                                            |
| GET     | `/api/stats/streak`                                | `{ currentStreakDays }`                                          |
| GET     | `/api/stats/adherence/weekly?weeks=`               | `WeeklyAdherencePoint[]`                                         |
| GET     | `/api/stats/muscle-distribution?days=`             | `MuscleVolumeShare[]`                                            |
| GET     | `/api/stats/progression-score`                     | `ProgressionScore`                                               |
| POST    | `/api/coaching/athletes`                           | `SessionUser` (201)                                              |
| GET     | `/api/coaching/athletes`                           | `SessionUser[]` (role COACH)                                     |
| GET     | `/api/coaching/coaches`                            | `SessionUser[]` (role ATHLETE)                                   |
| POST    | `/api/coaching/posts`                              | `CoachPost` (201, role COACH)                                    |
| POST    | `/api/coaching/posts/images`                       | `{ imageUrl }` (role COACH)                                      |
| GET     | `/api/coaching/posts/{coachId}`                    | `CoachPost[]` (le coach ou ses clients actifs)                   |
| DELETE  | `/api/coaching/posts/{postId}`                     | 204 (auteur uniquement)                                          |

Les erreurs sont attendues au format `ProblemDetail` de Spring : `detail` est
affiche tel quel a l'utilisateur.

Les features `catalog`, `program`, `planning` et `stats` consomment le client
type `api` (genere par `npm run gen:api` depuis `/v3/api-docs`) plutot que le
client `http` generique. Le schema OpenAPI de springdoc ne declare pas les
champs `required` : les reponses sont donc recastees vers le contrat strict de
chaque `schemas.ts` au niveau de la fonction d'appel API, pour eviter de
propager des `| undefined` partout dans les composants.

## Conventions

- **Fichiers** en `kebab-case.tsx`, **composants** en `PascalCase`, **hooks** en `useXxx`.
- **Couleurs** : uniquement les tokens du theme (`bg-primary`, `text-muted-foreground`,
  `bg-brand`...), jamais `bg-orange-500`. Le mode sombre fonctionne alors sans effort.
- **Composants UI** : ajouter un composant shadcn avec
  `npx shadcn@latest add <nom>`, puis remplacer dans le fichier genere
  `from "cn"` par `from "@/lib/utils"` si besoin.
- **Donnees serveur** toujours via TanStack Query, jamais de `fetch` dans un
  `useEffect`. **Etat client partage** via zustand, sinon `useState`.
- **Textes** en francais dans les composants. L'API renvoie des codes stables
  (`STRENGTH`, `BEGINNER`) que le front traduit (`SESSION_TYPE_LABELS`).
- Fichiers generes, a ne pas editer : `src/routeTree.gen.ts`,
  `src/lib/api/schema.d.ts`, `public/mockServiceWorker.js`.
