import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { db, defaultProfile } from '@/mocks/db'
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

  it('envoie une invitation qui reste en attente jusqu’à la réponse de l’athlète', async () => {
    db.users.push({
      id: 'u-nina',
      email: 'nina@fitcoach.dev',
      firstName: 'Nina',
      lastName: 'Rossi',
      roles: ['ATHLETE'],
      password: 'Password1',
      profile: defaultProfile(),
    })
    loginAs('COACH')
    const { user } = renderWithProviders(<CoachingPage />)

    await user.type(await screen.findByPlaceholderText('email@athlete.fr'), 'nina@fitcoach.dev')
    await user.click(screen.getByRole('button', { name: 'Inviter' }))

    expect(await screen.findByText('Nina Rossi')).toBeInTheDocument()
    expect(screen.getByText('Invitations en attente')).toBeInTheDocument()
    // Elle n'apparait pas parmi les athletes suivis tant qu'elle n'est pas acceptee.
    expect(screen.getByText('Mes athlètes').closest('[data-slot="card"]')).not.toHaveTextContent(
      'Nina Rossi',
    )
  })

  it('signale une invitation vers un athlète déjà suivi', async () => {
    loginAs('COACH')
    const { user } = renderWithProviders(<CoachingPage />)

    await user.type(await screen.findByPlaceholderText('email@athlete.fr'), 'athlete@fitcoach.dev')
    await user.click(screen.getByRole('button', { name: 'Inviter' }))

    expect(
      await screen.findByText('Cet athlète fait déjà partie de vos clients.'),
    ).toBeInTheDocument()
  })

  it('permet au coach d’annuler une invitation en attente', async () => {
    db.coachAthletes.push({
      coachId: 'u-coach',
      athleteId: 'u-other',
      status: 'PENDING',
      invitedAt: new Date().toISOString(),
    })
    db.users.push({
      id: 'u-other',
      email: 'other@fitcoach.dev',
      firstName: 'Omar',
      lastName: 'Diallo',
      roles: ['ATHLETE'],
      password: 'Password1',
      profile: defaultProfile(),
    })
    loginAs('COACH')
    const { user } = renderWithProviders(<CoachingPage />)

    expect(await screen.findByText('Omar Diallo')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Annuler/ }))

    expect(await screen.findByText('Aucune invitation en attente.')).toBeInTheDocument()
  })

  it('permet à l’athlète d’accepter une invitation de coach', async () => {
    loginAs('ATHLETE')
    const { user } = renderWithProviders(<CoachingPage />)

    expect(await screen.findByText('Invitations de coachs')).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: /Accepter/ }))

    expect(await screen.findByRole('button', { name: /Admin FitCoach/ })).toBeInTheDocument()
    expect(screen.queryByText('Invitations de coachs')).not.toBeInTheDocument()
  })

  it('permet à l’athlète de refuser une invitation de coach', async () => {
    loginAs('ATHLETE')
    const { user } = renderWithProviders(<CoachingPage />)

    await user.click(await screen.findByRole('button', { name: /Refuser/ }))

    await waitFor(() => expect(screen.queryByText('Invitations de coachs')).not.toBeInTheDocument())
    expect(await screen.findByText('Hugo Bernard')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Admin FitCoach/ })).not.toBeInTheDocument()
  })

  it('ouvre le suivi d’un athlète avec son tableau de bord et ses notes privées', async () => {
    loginAs('COACH')
    const { user } = renderWithProviders(<CoachingPage />)

    await user.click(await screen.findByRole('button', { name: /Léa Martin/ }))

    const detail = await screen.findByRole('region', { name: 'Suivi de Léa Martin' })
    expect(await within(detail).findByText('Séances sur 30 jours')).toBeInTheDocument()
    expect(within(detail).getByText('À valider')).toBeInTheDocument()
    expect(await within(detail).findByText(/Reprise après une gêne à l’épaule/)).toBeInTheDocument()

    await user.type(
      within(detail).getByRole('textbox', { name: 'Note' }),
      'Objectif : 100 kg au squat',
    )
    await user.click(within(detail).getByRole('button', { name: 'Ajouter la note' }))

    expect(await within(detail).findByText('Objectif : 100 kg au squat')).toBeInTheDocument()
  })

  it('refuse une note vide', async () => {
    loginAs('COACH')
    const { user } = renderWithProviders(<CoachingPage />)

    await user.click(await screen.findByRole('button', { name: /Léa Martin/ }))
    const detail = await screen.findByRole('region', { name: 'Suivi de Léa Martin' })
    await user.click(await within(detail).findByRole('button', { name: 'Ajouter la note' }))

    expect(await within(detail).findByText('La note est vide')).toBeInTheDocument()
  })

  it('termine le suivi d’un athlète après confirmation', async () => {
    loginAs('COACH')
    const { user } = renderWithProviders(<CoachingPage />)

    await user.click(await screen.findByRole('button', { name: /Léa Martin/ }))
    await user.click(await screen.findByRole('button', { name: 'Mettre fin au suivi' }))
    await user.click(await screen.findByRole('button', { name: 'Confirmer' }))

    expect(await screen.findByText('Aucun athlète pour le moment')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Suivi de Léa Martin' })).not.toBeInTheDocument()
  })
})
