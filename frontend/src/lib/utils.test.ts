import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  it("garde l'ombre douce quand une couleur d'ombre est ajoutee", () => {
    const merged = cn('shadow-soft', 'shadow-primary/20')
    expect(merged).toContain('shadow-soft')
    expect(merged).toContain('shadow-primary/20')
  })

  it("remplace l'ombre douce par une autre ombre", () => {
    expect(cn('shadow-soft', 'shadow-none')).toBe('shadow-none')
    expect(cn('shadow-soft', 'shadow-lg')).toBe('shadow-lg')
  })

  it('fusionne toujours les classes en conflit', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
