import { publicProfileUrl } from './profile-url'

describe('publicProfileUrl', () => {
  afterEach(() => vi.unstubAllEnvs())

  it("utilise l'adresse du site par défaut", () => {
    vi.stubEnv('VITE_PUBLIC_URL', '')

    expect(publicProfileUrl('abc')).toBe(`${window.location.origin}/coach/abc`)
  })

  it("préfère VITE_PUBLIC_URL pour qu'un téléphone puisse ouvrir le lien", () => {
    vi.stubEnv('VITE_PUBLIC_URL', 'http://192.168.1.20:5173/')

    expect(publicProfileUrl('abc')).toBe('http://192.168.1.20:5173/coach/abc')
  })
})
