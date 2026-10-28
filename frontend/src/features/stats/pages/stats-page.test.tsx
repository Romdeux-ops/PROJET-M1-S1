import { screen } from '@testing-library/react'

import { loginAs, renderWithProviders } from '@/test/utils'

import { StatsPage } from './stats-page'

describe('StatsPage', () => {
  beforeEach(() => loginAs('ATHLETE'))

  it("affiche les indicateurs de l'aperçu", async () => {
    renderWithProviders(<StatsPage />)

    expect(await screen.findByText('Série en cours')).toBeInTheDocument()
    expect(screen.getByText('Séances cette semaine')).toBeInTheDocument()
    expect(screen.getByText('RPE moyen')).toBeInTheDocument()
  })

  it('affiche les sections de graphiques', async () => {
    renderWithProviders(<StatsPage />)

    await screen.findByText('Série en cours')
    expect(screen.getByText('Volume hebdomadaire')).toBeInTheDocument()
    expect(screen.getByText('Répartition par muscle')).toBeInTheDocument()
    expect(screen.getByText('Assiduité au planning')).toBeInTheDocument()
  })
})
