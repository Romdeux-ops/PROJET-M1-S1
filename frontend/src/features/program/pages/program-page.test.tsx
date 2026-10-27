import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/node'
import { loginAs, renderWithProviders } from '@/test/utils'

import { ProgramPage } from './program-page'

describe('ProgramPage', () => {
  beforeEach(() => loginAs('ATHLETE'))

  it('affiche les programmes renvoyés par l’API', async () => {
    renderWithProviders(<ProgramPage />)

    expect(await screen.findByText('Full body débutant')).toBeInTheDocument()
  })

  it('filtre sur "mes programmes"', async () => {
    const { user } = renderWithProviders(<ProgramPage />)
    await screen.findByText('Full body débutant')

    await user.click(screen.getByRole('button', { name: /mes programmes/i }))

    expect(await screen.findByText('Aucun programme ne correspond à ces critères.')).toBeInTheDocument()
  })

  it('affiche un état vide quand aucun programme ne correspond', async () => {
    server.use(http.get('*/api/programs', () => HttpResponse.json([])))
    renderWithProviders(<ProgramPage />)

    expect(await screen.findByText('Aucun programme ne correspond à ces critères.')).toBeInTheDocument()
  })
})
