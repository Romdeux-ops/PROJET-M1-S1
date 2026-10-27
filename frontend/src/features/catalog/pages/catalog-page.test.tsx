import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/node'
import { loginAs, renderWithProviders } from '@/test/utils'

import { CatalogPage } from './catalog-page'

describe('CatalogPage', () => {
  it('affiche les exercices renvoyés par l’API', async () => {
    loginAs('ATHLETE')
    renderWithProviders(<CatalogPage />)

    expect(await screen.findByText('Développé couché')).toBeInTheDocument()
    expect(screen.getByText('Squat')).toBeInTheDocument()
  })

  it('cache le bouton d’ajout pour un athlète', async () => {
    loginAs('ATHLETE')
    renderWithProviders(<CatalogPage />)

    await screen.findByText('Développé couché')
    expect(screen.queryByRole('button', { name: /ajouter un exercice/i })).not.toBeInTheDocument()
  })

  it('affiche le bouton d’ajout pour un coach', async () => {
    loginAs('COACH')
    renderWithProviders(<CatalogPage />)

    expect(await screen.findByRole('button', { name: /ajouter un exercice/i })).toBeInTheDocument()
  })

  it('affiche un état vide quand aucun exercice ne correspond', async () => {
    loginAs('ATHLETE')
    server.use(http.get('*/api/catalog/exercises', () => HttpResponse.json([])))
    renderWithProviders(<CatalogPage />)

    expect(await screen.findByText('Aucun exercice ne correspond à ces critères.')).toBeInTheDocument()
  })
})
