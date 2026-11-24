import { create } from 'zustand'

interface CelebrationState {
  /** Identifiant unique du dernier evenement a celebrer (record, badge...) ; null si rien. */
  event: string | null
  fire: (kind: string) => void
}

export const useCelebration = create<CelebrationState>((set) => ({
  event: null,
  fire: (kind) => set({ event: `${kind}-${Date.now()}` }),
}))
