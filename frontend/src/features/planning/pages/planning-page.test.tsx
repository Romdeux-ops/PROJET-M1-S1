import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/node'
import { loginAs, renderWithProviders } from '@/test/utils'

import { PlanningPage } from './planning-page'

describe('PlanningPage', () => {
  beforeEach(() => loginAs('ATHLETE'))

  it('affiche la grille de la semaine avec les séances prévues', async () => {
    renderWithProviders(<PlanningPage />)

    expect(await screen.findByText('Push day')).toBeInTheDocument()
    expect(screen.getByText('Lundi')).toBeInTheDocument()
  })

  it('ouvre le formulaire de planification', async () => {
    const { user } = renderWithProviders(<PlanningPage />)
    await screen.findByText('Push day')

    await user.click(screen.getByRole('button', { name: /planifier une séance/i }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('affiche "Rien de prévu" pour les jours sans séance', async () => {
    server.use(http.get('*/api/planning/scheduled', () => HttpResponse.json([])))
    renderWithProviders(<PlanningPage />)

    expect(await screen.findAllByText('Rien de prévu')).toHaveLength(7)
  })
})
