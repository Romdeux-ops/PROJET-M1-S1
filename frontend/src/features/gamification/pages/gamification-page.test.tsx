import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/node'
import { loginAs, renderWithProviders } from '@/test/utils'

import { GamificationPage } from './gamification-page'

describe('GamificationPage', () => {
  beforeEach(() => loginAs('ATHLETE'))

  it('affiche le niveau, l’expérience et la progression', async () => {
    renderWithProviders(<GamificationPage />)

    expect(await screen.findByText('80 XP')).toBeInTheDocument()
    expect(screen.getByText('Expérience')).toBeInTheDocument()
    expect(screen.getByText(/120 XP avant le niveau 3/)).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: /niveau suivant/i })).toBeInTheDocument()
  })

  it('distingue les badges obtenus des badges verrouillés', async () => {
    renderWithProviders(<GamificationPage />)

    const earned = (await screen.findByText('Première séance')).closest('li')
    const locked = screen.getByText('Mois de fer').closest('li')

    expect(earned).toHaveAttribute('data-earned', 'true')
    expect(locked).toHaveAttribute('data-earned', 'false')
    expect(screen.getByText('1 sur 8 obtenus.')).toBeInTheDocument()
  })

  it('met en évidence la ligne de l’utilisateur dans le classement', async () => {
    renderWithProviders(<GamificationPage />)

    const you = (await screen.findByText('(vous)')).closest('tr')

    expect(you).not.toBeNull()
    expect(within(you as HTMLElement).getByText('80')).toBeInTheDocument()
  })

  it('invite à s’entraîner quand le classement est vide', async () => {
    server.use(http.get('*/api/gamification/leaderboard', () => HttpResponse.json([])))
    renderWithProviders(<GamificationPage />)

    expect(await screen.findByText(/personne n'a encore gagné/i)).toBeInTheDocument()
  })
})
