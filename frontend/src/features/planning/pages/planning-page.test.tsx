import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { db } from '@/mocks/db'
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

  it('planifie une séance rattachée à un programme et à un jour', async () => {
    const { user } = renderWithProviders(<PlanningPage />)
    await screen.findByText('Push day')
    await user.click(screen.getByRole('button', { name: /planifier une séance/i }))
    const dialog = await screen.findByRole('dialog')

    await user.click(within(dialog).getAllByRole('combobox')[0]!)
    await user.click(await screen.findByRole('option', { name: 'Full body débutant' }))
    await user.click(within(dialog).getAllByRole('combobox')[1]!)
    await user.click(await screen.findByRole('option', { name: 'Jour 1' }))

    expect(within(dialog).getByLabelText(/titre/i)).toHaveValue('Full body débutant – Jour 1')
    await user.click(within(dialog).getByRole('button', { name: /^planifier$/i }))

    await waitFor(() =>
      expect(
        db.scheduledSessions.find((s) => s.title === 'Full body débutant – Jour 1'),
      ).toMatchObject({
        programId: 'prog-1',
        programDayId: 'day-1',
      }),
    )
  })

  it('propose aussi les programmes réservés aux athlètes du coach', async () => {
    const { user } = renderWithProviders(<PlanningPage />)
    await screen.findByText('Push day')
    await user.click(screen.getByRole('button', { name: /planifier une séance/i }))
    const dialog = await screen.findByRole('dialog')

    await user.click(within(dialog).getAllByRole('combobox')[0]!)

    expect(
      await screen.findByRole('option', { name: 'Prise de masse sur mesure' }),
    ).toBeInTheDocument()
  })

  it('affiche "Rien de prévu" pour les jours sans séance', async () => {
    server.use(http.get('*/api/planning/scheduled', () => HttpResponse.json([])))
    renderWithProviders(<PlanningPage />)

    expect(await screen.findAllByText('Rien de prévu')).toHaveLength(7)
  })

  it('résume la semaine par statut', async () => {
    renderWithProviders(<PlanningPage />)
    await screen.findByText('Push day')

    const summary = screen.getByRole('region', { name: /bilan de la semaine/i })
    for (const label of ['À faire', 'À valider', 'Réalisées', 'Sautées']) {
      expect(within(summary).getByText(label)).toBeInTheDocument()
    }
  })

  it('met en avant la journée en cours et permet de revenir à aujourd’hui', async () => {
    const { user } = renderWithProviders(<PlanningPage />)
    await screen.findByText('Push day')

    expect(document.querySelectorAll('[data-today="true"]')).toHaveLength(1)
    const today = screen.getByRole('button', { name: "Aujourd'hui" })
    expect(today).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Semaine suivante' }))
    expect(screen.getByRole('button', { name: "Aujourd'hui" })).toBeEnabled()
    expect(document.querySelectorAll('[data-today="true"]')).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: "Aujourd'hui" }))
    expect(screen.getByRole('button', { name: "Aujourd'hui" })).toBeDisabled()
  })

  it('range les actions secondaires dans un menu et ouvre la replanification', async () => {
    const { user } = renderWithProviders(<PlanningPage />)
    await screen.findByText('Push day')

    expect(screen.queryByRole('menuitem', { name: /replanifier/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /autres actions pour push day/i }))
    await user.click(await screen.findByRole('menuitem', { name: /replanifier/i }))

    expect(
      await screen.findByRole('dialog', { name: /replanifier la séance/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Nouvelle date')).toBeInTheDocument()
  })
})
