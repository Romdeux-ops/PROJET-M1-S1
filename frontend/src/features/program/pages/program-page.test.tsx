import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { db } from '@/mocks/db'
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

    expect(
      await screen.findByText('Aucun programme ne correspond à ces critères.'),
    ).toBeInTheDocument()
  })

  it('affiche un état vide quand aucun programme ne correspond', async () => {
    server.use(http.get('*/api/programs', () => HttpResponse.json([])))
    renderWithProviders(<ProgramPage />)

    expect(
      await screen.findByText('Aucun programme ne correspond à ces critères.'),
    ).toBeInTheDocument()
  })

  it('liste les programmes de son coach dans l’onglet dédié, absents de la liste générale', async () => {
    const { user } = renderWithProviders(<ProgramPage />)
    await screen.findByText('Full body débutant')
    expect(screen.queryByText('Prise de masse sur mesure')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /programmes de mon coach/i }))

    expect(await screen.findByText('Prise de masse sur mesure')).toBeInTheDocument()
    expect(screen.queryByText('Full body débutant')).not.toBeInTheDocument()
    expect(screen.getByText('Mes athlètes')).toBeInTheDocument()
  })

  it('n’affiche plus les programmes du coach une fois la relation terminée', async () => {
    db.coachAthletes[0]!.status = 'ENDED'
    const { user } = renderWithProviders(<ProgramPage />)
    await screen.findByText('Full body débutant')

    await user.click(screen.getByRole('button', { name: /programmes de mon coach/i }))

    expect(
      await screen.findByText('Aucun programme partagé par vos coachs pour le moment.'),
    ).toBeInTheDocument()
  })

  it('ne propose pas la visibilité "Mes athlètes" à un athlète', async () => {
    const { user } = renderWithProviders(<ProgramPage />)
    await screen.findByText('Full body débutant')

    await user.click(screen.getByRole('button', { name: /créer un programme/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getAllByRole('combobox')[2]!)

    expect(await screen.findByRole('option', { name: 'Public' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Mes athlètes' })).not.toBeInTheDocument()
  })
})

describe('ProgramPage (coach)', () => {
  beforeEach(() => loginAs('COACH'))

  it('permet à un coach de créer un programme visible par ses athlètes', async () => {
    const { user } = renderWithProviders(<ProgramPage />)
    await screen.findByText('Full body débutant')
    expect(
      screen.queryByRole('button', { name: /programmes de mon coach/i }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /créer un programme/i }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/titre/i), 'Programme pour mes athlètes')
    await user.click(within(dialog).getAllByRole('combobox')[2]!)
    await user.click(await screen.findByRole('option', { name: 'Mes athlètes' }))
    await user.click(within(dialog).getByRole('button', { name: /créer le programme/i }))

    expect(await screen.findByText('Programme pour mes athlètes')).toBeInTheDocument()
    expect(db.programs.find((p) => p.title === 'Programme pour mes athlètes')).toMatchObject({
      visibility: 'CLIENTS',
      ownerId: 'u-coach',
    })
  })
})
