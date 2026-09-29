import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/node'
import { loginAs, renderWithProviders } from '@/test/utils'

import { TrainingPage } from './training-page'

describe('TrainingPage', () => {
  beforeEach(() => loginAs('ATHLETE'))

  it('affiche les séances renvoyées par l’API', async () => {
    renderWithProviders(<TrainingPage />)

    expect(await screen.findByText('Push day')).toBeInTheDocument()
    expect(screen.getByText('Leg day')).toBeInTheDocument()
    expect(screen.getByText(/8 séances/)).toBeInTheDocument()
  })

  it('crée une séance et l’ajoute à la liste', async () => {
    const { user } = renderWithProviders(<TrainingPage />)
    await screen.findByText('Push day')

    await user.click(screen.getByRole('button', { name: /nouvelle séance/i }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('Intitulé'), 'Sortie vélo')
    await user.click(within(dialog).getByRole('radio', { name: /cardio/i }))
    await user.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByText('Sortie vélo')).toBeInTheDocument()
    expect(await screen.findByText('Séance enregistrée')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('valide le formulaire avant envoi', async () => {
    const { user } = renderWithProviders(<TrainingPage />)
    await user.click(await screen.findByRole('button', { name: /nouvelle séance/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))

    expect(await within(dialog).findByText('2 caractères minimum')).toBeInTheDocument()
  })

  it('affiche un état vide quand il n’y a aucune séance', async () => {
    server.use(http.get('*/api/training/sessions', () => HttpResponse.json([])))
    renderWithProviders(<TrainingPage />)

    expect(await screen.findByText("Aucune séance pour l'instant")).toBeInTheDocument()
  })

  it('affiche une erreur récupérable si l’API échoue', async () => {
    server.use(
      http.get('*/api/training/sessions', () =>
        HttpResponse.json({ status: 500, detail: 'Base indisponible' }, { status: 500 }),
      ),
    )
    renderWithProviders(<TrainingPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Base indisponible')
    expect(screen.getByRole('button', { name: /réessayer/i })).toBeInTheDocument()
  })
})
