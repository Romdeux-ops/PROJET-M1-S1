import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AnimatedNumber } from './animated-number'
import { splitNumeric } from './numeric'
import { Stagger, StaggerItem } from './stagger'

describe('splitNumeric', () => {
  it('isole un entier et son suffixe', () => {
    expect(splitNumeric('12 j')).toEqual({ value: 12, decimals: 0, suffix: ' j' })
  })

  it('conserve le nombre de decimales', () => {
    expect(splitNumeric('7.5/10')).toEqual({ value: 7.5, decimals: 1, suffix: '/10' })
    expect(splitNumeric('7,25')).toEqual({ value: 7.25, decimals: 2, suffix: '' })
  })

  it("refuse un texte qui contient d'autres chiffres apres le premier nombre", () => {
    expect(splitNumeric('3h 20')).toBeNull()
    expect(splitNumeric('abc')).toBeNull()
  })
})

describe('animations desactivees en test', () => {
  it('AnimatedNumber affiche directement la valeur finale', () => {
    render(<AnimatedNumber value="42 XP" />)
    expect(screen.getByText('42 XP')).toBeInTheDocument()
  })

  it('Stagger rend simplement ses enfants avec la bonne balise', () => {
    render(
      <Stagger as="ul" data-testid="liste">
        <StaggerItem as="li">un</StaggerItem>
        <StaggerItem as="li">deux</StaggerItem>
      </Stagger>,
    )
    expect(screen.getByTestId('liste').tagName).toBe('UL')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})
