/** Format ProblemDetail (RFC 9457) renvoye par Spring. */
export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  /** Erreurs de validation par champ, si le backend les expose. */
  errors?: Record<string, string>
}

export class ApiError extends Error {
  readonly status: number
  readonly problem?: ProblemDetail

  constructor(status: number, message: string, problem?: ProblemDetail) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
  }

  get isUnauthorized() {
    return this.status === 401
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'La requête est invalide.',
  401: 'Votre session a expiré, reconnectez-vous.',
  403: "Vous n'avez pas les droits pour cette action.",
  404: 'Ressource introuvable.',
  409: 'Cette ressource existe déjà ou a été modifiée entre-temps.',
  422: 'Certaines données sont invalides.',
  500: 'Erreur interne du serveur.',
  503: 'Le service est momentanément indisponible.',
}

export async function toApiError(response: Response, body?: unknown): Promise<ApiError> {
  let problem: ProblemDetail | undefined
  if (body && typeof body === 'object') {
    problem = body as ProblemDetail
  } else {
    try {
      problem = (await response.clone().json()) as ProblemDetail
    } catch {
      problem = undefined
    }
  }
  const message = problem?.detail ?? STATUS_MESSAGES[response.status] ?? `Erreur ${response.status}`
  return new ApiError(response.status, message, problem)
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof TypeError)
    return 'Impossible de joindre le serveur. Vérifiez votre connexion.'
  if (error instanceof Error) return error.message
  return 'Une erreur inattendue est survenue.'
}
