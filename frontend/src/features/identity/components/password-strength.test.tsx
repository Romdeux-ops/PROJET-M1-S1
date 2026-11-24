import { render, screen } from '@testing-library/react'

import { passwordScore } from './password-rules'
import { PasswordStrength } from './password-strength'

describe('passwordScore', () => {
  it('vaut 0 pour un mot de passe vide', () => {
    expect(passwordScore('')).toBe(0)
  })

  it('compte les trois regles du formulaire', () => {
    expect(passwordScore('abc')).toBe(0)
    expect(passwordScore('abcdefgh')).toBe(1)
    expect(passwordScore('Abcdefgh')).toBe(2)
    expect(passwordScore('Abcdefg1')).toBe(3)
  })

  it('ajoute un point pour un mot de passe long avec un symbole', () => {
    expect(passwordScore('Abcdefghijk1!')).toBe(4)
  })
})

describe('PasswordStrength', () => {
  it('coche les regles remplies et indique le niveau', () => {
    render(<PasswordStrength password="Abcdefg1" />)

    expect(screen.getByText('Bon')).toBeInTheDocument()
    for (const label of ['8 caractères', 'Une majuscule', 'Un chiffre']) {
      expect(screen.getByText(label).closest('li')).toHaveAttribute('data-ok', 'true')
    }
  })

  it("n'affiche aucun niveau tant que rien n'est saisi", () => {
    render(<PasswordStrength password="" />)

    expect(screen.queryByText('Faible')).not.toBeInTheDocument()
    expect(screen.getByText('Un chiffre').closest('li')).toHaveAttribute('data-ok', 'false')
  })
})
