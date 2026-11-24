import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { coachingApi } from '../api/coaching-api'
import type {
  CreatePostInput,
  InviteAthleteInput,
  NoteFormInput,
  PublicProfileSettingsInput,
} from '../schemas'

export const coachingKeys = {
  all: ['coaching'] as const,
  athletes: () => [...coachingKeys.all, 'athletes'] as const,
  coaches: () => [...coachingKeys.all, 'coaches'] as const,
  sentInvitations: () => [...coachingKeys.all, 'invitations', 'sent'] as const,
  receivedInvitations: () => [...coachingKeys.all, 'invitations', 'received'] as const,
  overview: (athleteId: string) => [...coachingKeys.all, 'overview', athleteId] as const,
  notes: (athleteId: string) => [...coachingKeys.all, 'notes', athleteId] as const,
  posts: (coachId: string) => [...coachingKeys.all, 'posts', coachId] as const,
  publicSettings: () => [...coachingKeys.all, 'public-settings'] as const,
  publicProfile: (coachId: string) => [...coachingKeys.all, 'public-profile', coachId] as const,
  receivedRequests: () => [...coachingKeys.all, 'follow-requests', 'received'] as const,
  sentRequests: () => [...coachingKeys.all, 'follow-requests', 'sent'] as const,
}

export function useMyAthletes() {
  return useQuery({ queryKey: coachingKeys.athletes(), queryFn: coachingApi.listAthletes })
}

export function useMyCoaches() {
  return useQuery({ queryKey: coachingKeys.coaches(), queryFn: coachingApi.listCoaches })
}

export function useSentInvitations() {
  return useQuery({
    queryKey: coachingKeys.sentInvitations(),
    queryFn: coachingApi.listSentInvitations,
  })
}

export function useReceivedInvitations() {
  return useQuery({
    queryKey: coachingKeys.receivedInvitations(),
    queryFn: coachingApi.listReceivedInvitations,
  })
}

export function useInviteAthlete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: InviteAthleteInput) => coachingApi.inviteAthlete(input),
    meta: { successMessage: 'Invitation envoyée', silentError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coachingKeys.sentInvitations() }),
  })
}

export function useCancelInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (athleteId: string) => coachingApi.cancelInvitation(athleteId),
    meta: { successMessage: 'Invitation annulée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coachingKeys.sentInvitations() }),
  })
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (coachId: string) => coachingApi.acceptInvitation(coachId),
    meta: { successMessage: 'Invitation acceptée' },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coachingKeys.receivedInvitations() })
      void queryClient.invalidateQueries({ queryKey: coachingKeys.coaches() })
    },
  })
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (coachId: string) => coachingApi.declineInvitation(coachId),
    meta: { successMessage: 'Invitation refusée' },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: coachingKeys.receivedInvitations() }),
  })
}

/** Le coach met fin au suivi d'un athlete. */
export function useEndAthlete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (athleteId: string) => coachingApi.endAthlete(athleteId),
    meta: { successMessage: 'Suivi terminé' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coachingKeys.athletes() }),
  })
}

/** L'athlete met fin au suivi par un coach. */
export function useEndCoach() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (coachId: string) => coachingApi.endCoach(coachId),
    meta: { successMessage: 'Suivi terminé' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coachingKeys.coaches() }),
  })
}

export function useAthleteOverview(athleteId: string) {
  return useQuery({
    queryKey: coachingKeys.overview(athleteId),
    queryFn: () => coachingApi.getOverview(athleteId),
    enabled: Boolean(athleteId),
  })
}

export function useNotes(athleteId: string) {
  return useQuery({
    queryKey: coachingKeys.notes(athleteId),
    queryFn: () => coachingApi.listNotes(athleteId),
    enabled: Boolean(athleteId),
  })
}

export function useCreateNote(athleteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NoteFormInput) => coachingApi.createNote(athleteId, input),
    meta: { successMessage: 'Note ajoutée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coachingKeys.notes(athleteId) }),
  })
}

export function useUpdateNote(athleteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ noteId, ...input }: NoteFormInput & { noteId: string }) =>
      coachingApi.updateNote(athleteId, noteId, input),
    meta: { successMessage: 'Note modifiée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coachingKeys.notes(athleteId) }),
  })
}

export function useDeleteNote(athleteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (noteId: string) => coachingApi.deleteNote(athleteId, noteId),
    meta: { successMessage: 'Note supprimée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coachingKeys.notes(athleteId) }),
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

export function usePublicSettings() {
  return useQuery({
    queryKey: coachingKeys.publicSettings(),
    queryFn: coachingApi.getPublicSettings,
  })
}

export function useUpdatePublicSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PublicProfileSettingsInput) => coachingApi.updatePublicSettings(input),
    meta: { successMessage: 'Profil public enregistré' },
    onSuccess: (settings) => queryClient.setQueryData(coachingKeys.publicSettings(), settings),
  })
}

/** Profil public d'un coach (page ouverte depuis un QR code) ; une 404 signifie "pas publié", inutile de reessayer. */
export function usePublicProfile(coachId: string) {
  return useQuery({
    queryKey: coachingKeys.publicProfile(coachId),
    queryFn: () => coachingApi.getPublicProfile(coachId),
    retry: false,
  })
}

export function useRequestFollow(coachId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => coachingApi.requestFollow(coachId),
    meta: { successMessage: 'Demande envoyée' },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: coachingKeys.publicProfile(coachId) }),
        queryClient.invalidateQueries({ queryKey: coachingKeys.sentRequests() }),
      ]),
  })
}

export function useCancelFollowRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (coachId: string) => coachingApi.cancelRequest(coachId),
    meta: { successMessage: 'Demande retirée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coachingKeys.all }),
  })
}

export function useReceivedFollowRequests() {
  return useQuery({
    queryKey: coachingKeys.receivedRequests(),
    queryFn: coachingApi.listReceivedRequests,
  })
}

export function useSentFollowRequests() {
  return useQuery({ queryKey: coachingKeys.sentRequests(), queryFn: coachingApi.listSentRequests })
}

export function useAcceptFollowRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (athleteId: string) => coachingApi.acceptRequest(athleteId),
    meta: { successMessage: 'Demande acceptée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coachingKeys.all }),
  })
}

export function useDeclineFollowRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (athleteId: string) => coachingApi.declineRequest(athleteId),
    meta: { successMessage: 'Demande refusée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coachingKeys.receivedRequests() }),
  })
}
