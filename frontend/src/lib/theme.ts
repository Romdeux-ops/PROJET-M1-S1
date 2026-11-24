import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'
export type Palette = 'aurora' | 'emerald' | 'ocean' | 'sunset'

export const PALETTES: { id: Palette; label: string; swatch: string }[] = [
  { id: 'aurora', label: 'Aurora', swatch: 'oklch(0.55 0.23 280)' },
  { id: 'emerald', label: 'Émeraude', swatch: 'oklch(0.53 0.15 160)' },
  { id: 'ocean', label: 'Océan', swatch: 'oklch(0.545 0.17 245)' },
  { id: 'sunset', label: 'Coucher de soleil', swatch: 'oklch(0.57 0.2 45)' },
]

// Meme cle que le script inline de index.html qui applique le theme avant le rendu.
const STORAGE_KEY = 'fitcoach-theme'
const PALETTE_KEY = 'fitcoach-palette'

/** Couleur de la barre du navigateur (mobile) : la couleur principale de chaque palette. */
const THEME_COLORS: Record<Palette, string> = {
  aurora: '#6051f2',
  emerald: '#00854c',
  ocean: '#0075cb',
  sunset: '#d03e00',
}

// Le stockage peut etre bloque (navigation privee, politique du navigateur) : on retombe sur les defauts.
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Preference non memorisee : elle reste appliquee pour la session en cours.
  }
}

const media = window.matchMedia('(prefers-color-scheme: dark)')

function resolve(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return media.matches ? 'dark' : 'light'
  return theme
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', resolve(theme) === 'dark')
}

function readPalette(): Palette {
  const value = readStorage(PALETTE_KEY)
  return PALETTES.some((p) => p.id === value) ? (value as Palette) : 'aurora'
}

function applyPalette(palette: Palette) {
  document.documentElement.dataset.palette = palette
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[palette])
}

function readStored(): Theme {
  const value = readStorage(STORAGE_KEY)
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
    writeStorage(PALETTE_KEY, palette)
    applyPalette(palette)
    set({ palette })
  },
  setTheme: (theme) => {
    writeStorage(STORAGE_KEY, theme)
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
