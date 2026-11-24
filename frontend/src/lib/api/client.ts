import createClient, { type Middleware } from 'openapi-fetch'

import { useSession } from '@/lib/auth/session'

import { toApiError } from './errors'
import type { paths } from './schema'

const baseUrl = import.meta.env.VITE_API_URL || window.location.origin

function authHeaders(headers: Headers) {
  const token = useSession.getState().token
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)
}

/**
 * Ne deconnecte que sur un vrai rejet du jeton : la requete en portait un et le
 * backend repond 401 avec le defi `WWW-Authenticate: Bearer`. Un 401 metier
 * (mauvais mot de passe) ou une autre erreur ne ferme donc jamais la session.
 */
export function isSessionRejected(request: { headers: Headers }, response: Response) {
  if (response.status !== 401 || !request.headers.has('Authorization')) return false
  return (response.headers.get('WWW-Authenticate') ?? '').toLowerCase().startsWith('bearer')
}

function handleUnauthorized(request: { headers: Headers }, response: Response) {
  if (isSessionRejected(request, response) && useSession.getState().token)
    useSession.getState().logout()
}

const authMiddleware: Middleware = {
  onRequest({ request }) {
    authHeaders(request.headers)
    return request
  },
  onResponse({ request, response }) {
    handleUnauthorized(request, response)
    return response
  },
}

/**
 * Client type a partir du contrat OpenAPI (`npm run gen:api`).
 * A privilegier des qu'un endpoint existe cote backend.
 *
 * @example const data = await unwrap(api.GET('/api/sessions'))
 */
export const api = createClient<paths>({
  baseUrl,
  // `openapi-fetch` capture sa reference a `fetch` a la creation du client :
  // en test, MSW ne patche `globalThis.fetch` qu'au demarrage du serveur
  // (`beforeAll`), *apres* l'import de ce module. Un wrapper resout `fetch`
  // dynamiquement a chaque appel pour que MSW l'intercepte correctement.
  fetch: (...args: Parameters<typeof fetch>) => globalThis.fetch(...args),
})
api.use(authMiddleware)

/** Transforme le resultat d'openapi-fetch en donnee, ou lance une ApiError. */
export async function unwrap<T>(
  promise: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await promise
  if (!response.ok) throw await toApiError(response, error)
  return data as T
}

/**
 * Telecharge un binaire protege par le JWT (images privees). Un `<img src>`
 * n'envoie pas l'en-tete Authorization : passer par `useAuthorizedImage`.
 */
export async function fetchBlob(path: string): Promise<Blob> {
  const headers = new Headers()
  authHeaders(headers)
  const response = await fetch(new URL(path, baseUrl), { headers })
  handleUnauthorized({ headers }, response)
  if (!response.ok) throw await toApiError(response)
  return response.blob()
}

/**
 * Envoi multipart (upload de fichier) : openapi-fetch serialise le corps en
 * JSON, ce cas passe donc par `fetch` avec la meme gestion du JWT et des erreurs.
 */
export async function postMultipart<T>(path: string, formData: FormData): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' })
  authHeaders(headers)
  const response = await fetch(new URL(path, baseUrl), { method: 'POST', headers, body: formData })
  handleUnauthorized({ headers }, response)
  if (!response.ok) throw await toApiError(response)
  return (await response.json()) as T
}
