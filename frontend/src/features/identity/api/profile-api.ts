import { api, postMultipart, unwrap } from '@/lib/api/client'

import type { ProfileResponse, UpdateProfileInput } from '../schemas'

/**
 * Contrat du module identity (backend, profil complet) :
 *   GET   /api/users/me/profile          -> ProfileResponse
 *   PATCH /api/users/me/profile          -> ProfileResponse
 *   POST  /api/users/me/profile/avatar   -> { avatarUrl }
 */
export const profileApi = {
  get: () => unwrap(api.GET('/api/users/me/profile')) as Promise<ProfileResponse>,
  update: (input: UpdateProfileInput) =>
    unwrap(api.PATCH('/api/users/me/profile', { body: input })) as Promise<ProfileResponse>,
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return postMultipart<{ avatarUrl: string }>('/api/users/me/profile/avatar', formData)
  },
}
