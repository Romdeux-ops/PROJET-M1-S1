import { bookingHandlers } from './booking'
import { catalogHandlers } from './catalog'
import { coachingHandlers } from './coaching'
import { identityHandlers } from './identity'
import { messagingHandlers } from './messaging'
import { notificationHandlers } from './notification'
import { planningHandlers } from './planning'
import { programHandlers } from './program'
import { statsHandlers } from './stats'
import { trainingHandlers } from './training'

/** Ajouter ici les handlers de chaque nouvelle feature. */
export const handlers = [
  ...identityHandlers,
  ...trainingHandlers,
  ...statsHandlers,
  ...catalogHandlers,
  ...programHandlers,
  ...planningHandlers,
  ...coachingHandlers,
  ...bookingHandlers,
  ...messagingHandlers,
  ...notificationHandlers,
]
