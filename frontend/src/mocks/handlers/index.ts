import { aiHandlers } from './ai'
import { bookingHandlers } from './booking'
import { catalogHandlers } from './catalog'
import { coachingHandlers } from './coaching'
import { gamificationHandlers } from './gamification'
import { identityHandlers } from './identity'
import { matchingHandlers } from './matching'
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
  ...gamificationHandlers,
  ...notificationHandlers,
  ...aiHandlers,
  ...matchingHandlers,
]
