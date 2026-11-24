import { delay, HttpResponse } from 'msw'

/** Latence simulee en dev pour voir les etats de chargement ; nulle en test. */
export function networkDelay() {
  return delay(import.meta.env.MODE === 'test' ? 0 : 350)
}

/**
 * Reponse d'erreur au format ProblemDetail, comme Spring. Un 401 porte par defaut
 * `WWW-Authenticate: Bearer` comme le backend quand le jeton est absent ou invalide ;
 * `challenge: false` reproduit un refus sans lien avec la session (mauvais mot de passe).
 */
export function problem(status: number, detail: string, { challenge = status === 401 } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/problem+json' }
  if (challenge) headers['WWW-Authenticate'] = 'Bearer'
  return HttpResponse.json(
    { type: 'about:blank', title: 'Error', status, detail },
    { status, headers },
  )
}

export function isoDaysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}
