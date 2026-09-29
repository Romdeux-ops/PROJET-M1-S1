import createClient, { type Middleware } from 'openapi-fetch'

import { useSession } from '@/lib/auth/session'

import { toApiError } from './errors'
import type { paths } from './schema'

const baseUrl = import.meta.env.VITE_API_URL || window.location.origin

function authHeaders(headers: Headers) {
  const token = useSession.getState().token
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)
}

function handleUnauthorized(response: Response) {
  if (response.status === 401 && useSession.getState().token) useSession.getState().logout()
}

const authMiddleware: Middleware = {
  onRequest({ request }) {
    authHeaders(request.headers)
    return request
  },
  onResponse({ response }) {
    handleUnauthorized(response)
    return response
  },
}

/**
 * Client type a partir du contrat OpenAPI (`npm run gen:api`).
 * A privilegier des qu'un endpoint existe cote backend.
 *
 * @example const data = await unwrap(api.GET('/api/sessions'))
 */
export const api = createClient<paths>({ baseUrl })
api.use(authMiddleware)

/** Transforme le resultat d'openapi-fetch en donnee, ou lance une ApiError. */
export async function unwrap<T>(
  promise: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await promise
  if (!response.ok) throw await toApiError(response, error)
  return data as T
}

type QueryParams = Record<string, string | number | boolean | null | undefined>

interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  body?: unknown
  query?: QueryParams
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, headers: initHeaders, ...init } = options
  const url = new URL(path, baseUrl)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
  }

  const headers = new Headers(initHeaders)
  headers.set('Accept', 'application/json')
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  authHeaders(headers)

  const response = await fetch(url, {
    ...init,
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  handleUnauthorized(response)
  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

/**
 * Client HTTP generique pour les endpoints pas encore presents dans le contrat
 * OpenAPI (developpement contre les mocks MSW). Meme gestion du JWT et des erreurs que `api`.
 */
export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T = void>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
}
