export { coachingApi } from './api/coaching-api'
export {
  useAcceptInvitation,
  useAthleteOverview,
  useCancelInvitation,
  useCreateNote,
  useCreatePost,
  useDeclineInvitation,
  useDeleteNote,
  useDeletePost,
  useEndAthlete,
  useEndCoach,
  useInviteAthlete,
  useMyAthletes,
  useMyCoaches,
  useNotes,
  usePosts,
  useReceivedInvitations,
  useSentInvitations,
  useUpdateNote,
} from './hooks/use-coaching'
export { CoachingPage } from './pages/coaching-page'
export type {
  AthleteOverview,
  CoachNote,
  CoachPost,
  CreatePostInput,
  InviteAthleteInput,
  Invitation,
} from './schemas'
