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
│   ├── training/     FEATURE DE REFERENCE, a copier
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

Contrats attendus par le front a ce jour (a implementer cote backend) :

| Methode | URL                            | Reponse                                                       |
| ------- | ------------------------------ | ------------------------------------------------------------- |
| POST    | `/api/auth/login`              | `{ accessToken, user }`                                       |
| POST    | `/api/auth/register`           | `{ accessToken, user }`                                       |
| GET     | `/api/users/me`                | `user` (`id, email, firstName, lastName, roles[], avatarUrl`) |
| GET     | `/api/training/sessions?type=` | `TrainingSession[]`                                           |
| POST    | `/api/training/sessions`       | `TrainingSession` (201)                                       |
| DELETE  | `/api/training/sessions/{id}`  | 204                                                           |
| GET     | `/api/stats/overview`          | `StatsOverview`                                               |

Les erreurs sont attendues au format `ProblemDetail` de Spring : `detail` est
affiche tel quel a l'utilisateur.

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
