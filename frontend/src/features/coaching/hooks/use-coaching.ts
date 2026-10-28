import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { coachingApi } from '../api/coaching-api'
import type { AddAthleteInput, CreatePostInput } from '../schemas'

export const coachingKeys = {
  all: ['coaching'] as const,
  athletes: () => [...coachingKeys.all, 'athletes'] as const,
  coaches: () => [...coachingKeys.all, 'coaches'] as const,
  posts: (coachId: string) => [...coachingKeys.all, 'posts', coachId] as const,
}

export function useMyAthletes() {
  return useQuery({ queryKey: coachingKeys.athletes(), queryFn: coachingApi.listAthletes })
}

export function useMyCoaches() {
  return useQuery({ queryKey: coachingKeys.coaches(), queryFn: coachingApi.listCoaches })
}

export function useAddAthlete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AddAthleteInput) => coachingApi.addAthlete(input),
    meta: { successMessage: 'Athlète rattaché', silentError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coachingKeys.athletes() }),
  })
}

export const postsQuery = (coachId: string) =>
  queryOptions({
    queryKey: coachingKeys.posts(coachId),
    queryFn: () => coachingApi.listPosts(coachId),
    enabled: Boolean(coachId),
  })

export function usePosts(coachId: string) {
  return useQuery(postsQuery(coachId))
}

export function useCreatePost(coachId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ content, image }: CreatePostInput & { image?: File }) => {
      const imageUrl = image ? (await coachingApi.uploadPostImage(image)).imageUrl : undefined
      return coachingApi.createPost({ content, imageUrl })
    },
    meta: { successMessage: 'Publication créée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coachingKeys.posts(coachId) }),
  })
}

export function useDeletePost(coachId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => coachingApi.deletePost(postId),
    meta: { successMessage: 'Publication supprimée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coachingKeys.posts(coachId) }),
  })
}
