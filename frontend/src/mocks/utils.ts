import { delay, HttpResponse } from 'msw'

/** Latence simulee en dev pour voir les etats de chargement ; nulle en test. */
export function networkDelay() {
  return delay(import.meta.env.MODE === 'test' ? 0 : 350)
}

/** Reponse d'erreur au format ProblemDetail, comme Spring. */
export function problem(status: number, detail: string) {
  return HttpResponse.json(
    { type: 'about:blank', title: 'Error', status, detail },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  )
}

export function isoDaysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}
