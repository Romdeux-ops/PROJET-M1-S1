import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'
export type Palette = 'aurora' | 'emerald' | 'ocean' | 'sunset'

export const PALETTES: { id: Palette; label: string; swatch: string }[] = [
  { id: 'aurora', label: 'Aurora', swatch: 'oklch(0.55 0.23 280)' },
  { id: 'emerald', label: 'Émeraude', swatch: 'oklch(0.6 0.15 160)' },
  { id: 'ocean', label: 'Océan', swatch: 'oklch(0.56 0.17 245)' },
  { id: 'sunset', label: 'Coucher de soleil', swatch: 'oklch(0.68 0.2 45)' },
]

// Meme cle que le script inline de index.html qui applique le theme avant le rendu.
const STORAGE_KEY = 'fitcoach-theme'
const PALETTE_KEY = 'fitcoach-palette'

const media = window.matchMedia('(prefers-color-scheme: dark)')

function resolve(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return media.matches ? 'dark' : 'light'
  return theme
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', resolve(theme) === 'dark')
}

function readPalette(): Palette {
  const value = localStorage.getItem(PALETTE_KEY)
  return PALETTES.some((p) => p.id === value) ? (value as Palette) : 'aurora'
}

function applyPalette(palette: Palette) {
  document.documentElement.dataset.palette = palette
}

function readStored(): Theme {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : 'system'
}

interface ThemeState {
  theme: Theme
  resolved: 'light' | 'dark'
  palette: Palette
  setPalette: (palette: Palette) => void
  setTheme: (theme: Theme) => void
  toggle: () => void
}

export const useTheme = create<ThemeState>()((set, get) => ({
  theme: readStored(),
  resolved: resolve(readStored()),
  palette: readPalette(),
  setPalette: (palette) => {
    localStorage.setItem(PALETTE_KEY, palette)
    applyPalette(palette)
    set({ palette })
  },
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
