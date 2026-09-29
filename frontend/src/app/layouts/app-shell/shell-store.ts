import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ShellState {
  collapsed: boolean
  mobileOpen: boolean
  commandOpen: boolean
  toggleCollapsed: () => void
  setMobileOpen: (open: boolean) => void
  setCommandOpen: (open: boolean) => void
}

export const useShell = create<ShellState>()(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,
      commandOpen: false,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setMobileOpen: (mobileOpen) => set({ mobileOpen }),
      setCommandOpen: (commandOpen) => set({ commandOpen }),
    }),
    { name: 'fitcoach-shell', partialize: (s) => ({ collapsed: s.collapsed }) },
  ),
)
