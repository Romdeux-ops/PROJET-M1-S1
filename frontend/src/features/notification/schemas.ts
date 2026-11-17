export const NOTIFICATION_TYPES = [
  'SESSION_REMINDER',
  'SESSION_PENDING_VALIDATION',
  'SESSION_VALIDATED',
  'BOOKING_CREATED',
  'BOOKING_CANCELLED',
  'BOOKING_REMINDER',
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

/** Notification in-app de l'utilisateur connecte ; `link` est une route frontend, `readAt` nul tant qu'elle n'est pas lue. */
export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  link: string | null
  createdAt: string
  readAt: string | null
}

export interface NotificationPage {
  content: AppNotification[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
