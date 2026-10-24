import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useSession } from '@/lib/auth/session'

import { profileApi } from '../api/profile-api'
import type { UpdateProfileInput } from '../schemas'

export const profileKeys = {
  me: ['identity', 'profile', 'me'] as const,
}

export const profileQuery = () =>
  queryOptions({
    queryKey: profileKeys.me,
    queryFn: profileApi.get,
  })

export function useProfile() {
  return useQuery(profileQuery())
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = useSession((s) => s.setUser)
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profileApi.update(input),
    meta: { successMessage: 'Profil mis à jour' },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.me, profile)
      setUser({
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        roles: profile.roles,
        avatarUrl: profile.avatarUrl,
      })
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const setUser = useSession((s) => s.setUser)
  const user = useSession((s) => s.user)
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    meta: { successMessage: 'Photo de profil mise à jour' },
    onSuccess: ({ avatarUrl }) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me })
      if (user) setUser({ ...user, avatarUrl })
    },
  })
}
