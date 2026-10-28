import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/node'
import { loginAs, renderWithProviders } from '@/test/utils'

import { CoachingPage } from './coaching-page'

describe('CoachingPage', () => {
  it('affiche les athlètes rattachés pour un coach', async () => {
    loginAs('COACH')
    renderWithProviders(<CoachingPage />)

    expect(await screen.findByText('Léa Martin')).toBeInTheDocument()
  })

  it('affiche un état vide quand le coach n’a aucun athlète', async () => {
    loginAs('COACH')
    server.use(http.get('*/api/coaching/athletes', () => HttpResponse.json([])))
    renderWithProviders(<CoachingPage />)

    expect(await screen.findByText('Aucun athlète pour le moment')).toBeInTheDocument()
  })

  it('affiche les coachs rattachés pour un athlète', async () => {
    loginAs('ATHLETE')
    renderWithProviders(<CoachingPage />)

    expect(await screen.findByText('Hugo Bernard')).toBeInTheDocument()
  })
})
