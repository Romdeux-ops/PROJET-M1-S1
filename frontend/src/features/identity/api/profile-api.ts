import { http } from '@/lib/api/client'
import { toApiError } from '@/lib/api/errors'
import { useSession } from '@/lib/auth/session'

import type { ProfileResponse, UpdateProfileInput } from '../schemas'

const baseUrl = import.meta.env.VITE_API_URL || window.location.origin

/**
 * Contrat attendu du module identity (backend, profil complet) :
 *   GET   /api/users/me/profile          -> ProfileResponse
 *   PATCH /api/users/me/profile          -> ProfileResponse
 *   POST  /api/users/me/profile/avatar   -> { avatarUrl }
 */
export const profileApi = {
  get: () => http.get<ProfileResponse>('/api/users/me/profile'),
  update: (input: UpdateProfileInput) =>
    http.patch<ProfileResponse>('/api/users/me/profile', input),
  uploadAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const token = useSession.getState().token
    const response = await fetch(new URL('/api/users/me/profile/avatar', baseUrl), {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    })
    if (!response.ok) {
      throw await toApiError(response)
    }
    return (await response.json()) as { avatarUrl: string }
  },
}
