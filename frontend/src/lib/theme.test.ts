import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** Recharge le module pour relire le stockage, comme au demarrage de l'application. */
async function loadTheme() {
  vi.resetModules()
  return (await import('./theme')).useTheme
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-palette')
  document.documentElement.classList.remove('dark')
  document.head.innerHTML = '<meta name="theme-color" content="#000000">'
})

afterEach(() => vi.restoreAllMocks())

describe('useTheme : lecture au demarrage', () => {
  it('prend aurora et le theme systeme par defaut', async () => {
    const useTheme = await loadTheme()
    expect(useTheme.getState().palette).toBe('aurora')
    expect(useTheme.getState().theme).toBe('system')
  })

  it('retombe sur aurora quand la palette stockee est invalide', async () => {
    localStorage.setItem('fitcoach-palette', 'rose-bonbon')
    const useTheme = await loadTheme()
    expect(useTheme.getState().palette).toBe('aurora')
  })

  it('retombe sur le theme systeme quand le theme stocke est invalide', async () => {
    localStorage.setItem('fitcoach-theme', 'violet')
    const useTheme = await loadTheme()
    expect(useTheme.getState().theme).toBe('system')
  })

  it('relit une palette valide', async () => {
    localStorage.setItem('fitcoach-palette', 'ocean')
    const useTheme = await loadTheme()
    expect(useTheme.getState().palette).toBe('ocean')
  })

  it('ne plante pas quand le stockage est bloque', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('stockage refuse')
    })
    const useTheme = await loadTheme()
    expect(useTheme.getState().palette).toBe('aurora')
    expect(useTheme.getState().theme).toBe('system')
  })
})

describe('useTheme : setPalette', () => {
  it('memorise la palette et l applique au document', async () => {
    const useTheme = await loadTheme()
    useTheme.getState().setPalette('emerald')

    expect(localStorage.getItem('fitcoach-palette')).toBe('emerald')
    expect(document.documentElement.dataset.palette).toBe('emerald')
    expect(useTheme.getState().palette).toBe('emerald')
  })

  it('met a jour la couleur de la barre du navigateur', async () => {
    const useTheme = await loadTheme()
    useTheme.getState().setPalette('sunset')

    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(
      '#d03e00',
    )
  })

  it('applique la palette meme quand le stockage est bloque', async () => {
    const useTheme = await loadTheme()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })

    expect(() => useTheme.getState().setPalette('ocean')).not.toThrow()
    expect(document.documentElement.dataset.palette).toBe('ocean')
  })
})

describe('useTheme : setTheme', () => {
  it('memorise le theme et bascule la classe dark', async () => {
    const useTheme = await loadTheme()
    useTheme.getState().setTheme('dark')

    expect(localStorage.getItem('fitcoach-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
