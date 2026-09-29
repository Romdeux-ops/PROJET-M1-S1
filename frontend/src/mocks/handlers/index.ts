import { identityHandlers } from './identity'
import { statsHandlers } from './stats'
import { trainingHandlers } from './training'

/** Ajouter ici les handlers de chaque nouvelle feature. */
export const handlers = [...identityHandlers, ...trainingHandlers, ...statsHandlers]
