import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

// Meme cle que le script inline de index.html qui applique le theme avant le rendu.
const STORAGE_KEY = 'fitcoach-theme'

const media = window.matchMedia('(prefers-color-scheme: dark)')

function resolve(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return media.matches ? 'dark' : 'light'
  return theme
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', resolve(theme) === 'dark')
}

function readStored(): Theme {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : 'system'
}

interface ThemeState {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggle: () => void
}

export const useTheme = create<ThemeState>()((set, get) => ({
  theme: readStored(),
  resolved: resolve(readStored()),
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme)
    apply(theme)
    set({ theme, resolved: resolve(theme) })
  },
  toggle: () => get().setTheme(get().resolved === 'dark' ? 'light' : 'dark'),
}))

media.addEventListener('change', () => {
  const { theme } = useTheme.getState()
  if (theme !== 'system') return
  apply(theme)
  useTheme.setState({ resolved: resolve(theme) })
})
