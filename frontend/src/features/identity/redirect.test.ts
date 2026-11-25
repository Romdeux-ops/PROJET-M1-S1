import { safeRedirect } from './redirect'

describe('safeRedirect', () => {
  it('accepte un chemin interne', () => {
    expect(safeRedirect('/coach/42')).toBe('/coach/42')
  })

  it.each(['//evil.com', 'https://evil.com', 'coach/42', ''])('refuse %j', (value) => {
    expect(safeRedirect(value)).toBeUndefined()
  })

  it('ignore une valeur absente', () => {
    expect(safeRedirect(undefined)).toBeUndefined()
  })
})
