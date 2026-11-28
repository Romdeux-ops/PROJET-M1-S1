import { fireEvent, screen, waitFor, within } from '@testing-library/react'

import { db, type MockMatchProfile } from '@/mocks/db'
import { loginAs, renderWithProviders } from '@/test/utils'

import { MatchingPage } from './matching-page'

/** Profil FitMatch de Lea (athlete de demo), pour les tests qui commencent apres l'inscription. */
function registerLea(overrides: Partial<MockMatchProfile> = {}) {
  const lea = db.users.find((u) => u.id === 'u-athlete')!
  lea.profile.birthDate = '1999-06-01'
  db.matchProfiles.push({
    userId: 'u-athlete',
    side: 'ATHLETE',
    headline: 'Je veux me mettre à la muscu',
    about: null,
    sports: ['STRENGTH'],
    goals: [],
    levels: [],
    availability: ['EVENING'],
    trainingMode: 'BOTH',
    city: 'Paris',
    maxBudgetEur: null,
    sessionRateEur: null,
    visible: true,
    updatedAt: new Date().toISOString(),
    ...overrides,
  })
}

describe('MatchingPage', () => {
  beforeEach(() => loginAs('ATHLETE'))

  it("pré-remplit l'inscription avec le compte et demande l'âge manquant", async () => {
    const { user } = renderWithProviders(<MatchingPage />)

    expect(await screen.findByText('Inscription à FitMatch')).toBeInTheDocument()
    expect(screen.getByLabelText('Prénom')).toHaveValue('Léa')
    expect(screen.getByText('À compléter')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Ton accroche'), 'Premier 10 km en vue')
    await user.click(screen.getByRole('button', { name: /suivant/i }))
    expect(await screen.findByText('Votre date de naissance est nécessaire')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/date de naissance/i), {
      target: { value: `${new Date().getFullYear() - 12}-01-01` },
    })
    await user.click(screen.getByRole('button', { name: /suivant/i }))
    expect(await screen.findByText('FitMatch est réservé aux 16 ans et plus')).toBeInTheDocument()
  })

  it("crée le profil en trois étapes puis affiche d'abord le coach le plus compatible", async () => {
    const { user } = renderWithProviders(<MatchingPage />)
    await screen.findByText('Inscription à FitMatch')

    fireEvent.change(screen.getByLabelText(/date de naissance/i), {
      target: { value: '1999-06-01' },
    })
    await user.type(screen.getByLabelText(/taille/i), '168')
    await user.type(screen.getByLabelText('Ton accroche'), 'Je veux me mettre à la muscu')
    await user.click(screen.getByRole('button', { name: /suivant/i }))

    await user.click(
      within(screen.getByRole('group', { name: 'Sports' })).getByRole('button', {
        name: 'Musculation',
      }),
    )
    await user.click(
      within(screen.getByRole('group', { name: 'Créneaux' })).getByRole('button', { name: 'Soir' }),
    )
    await user.click(screen.getByRole('button', { name: /suivant/i }))

    // Arriver a la derniere etape ne doit pas envoyer le formulaire.
    expect(
      await screen.findByRole('button', { name: /créer mon profil fitmatch/i }),
    ).toBeInTheDocument()
    expect(db.matchProfiles.some((p) => p.userId === 'u-athlete')).toBe(false)

    await user.type(screen.getByLabelText('Ville'), 'Paris')
    await user.click(screen.getByRole('button', { name: /créer mon profil fitmatch/i }))

    // Sarah : meme sport, objectif et niveau pris en charge, soir, Paris.
    const card = await screen.findByRole('article', { name: /sarah, 31 ans/i })
    expect(within(card).getByRole('img', { name: 'Compatibilité 85 %' })).toBeInTheDocument()
    expect(within(card).getByText('Mêmes sports')).toBeInTheDocument()
    expect(db.users.find((u) => u.id === 'u-athlete')!.profile.heightCm).toBe(168)
  })

  it('passer un profil affiche le suivant', async () => {
    registerLea()
    const { user } = renderWithProviders(<MatchingPage />)
    await screen.findByRole('article', { name: /sarah/i })

    await user.click(screen.getByRole('button', { name: 'Passer' }))

    expect(await screen.findByRole('article', { name: /inès/i })).toBeInTheDocument()
    expect(db.swipes).toContainEqual({
      swiperId: 'u-athlete',
      targetId: 'u-fm-sarah',
      decision: 'PASS',
    })
  })

  it('un like réciproque affiche le match et ouvre la conversation', async () => {
    registerLea()
    const onOpenConversation = vi.fn()
    const { user } = renderWithProviders(<MatchingPage onOpenConversation={onOpenConversation} />)
    await screen.findByRole('article', { name: /sarah/i })

    // Sarah a deja like Lea dans les donnees de demo.
    await user.click(screen.getByRole('button', { name: "J'aime" }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText("C'est un match !")).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /envoyer un message/i }))

    await waitFor(() => expect(onOpenConversation).toHaveBeenCalledTimes(1))
    const conversation = db.conversations.find(
      (c) => c.coachId === 'u-fm-sarah' && c.athleteId === 'u-athlete',
    )
    expect(onOpenConversation).toHaveBeenCalledWith(conversation?.id)
  })

  it("liste les matchs et permet d'en retirer un", async () => {
    registerLea()
    db.matches.push({
      id: 'match-1',
      coachId: 'u-fm-karim',
      athleteId: 'u-athlete',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderWithProviders(<MatchingPage />)

    await user.click(await screen.findByRole('tab', { name: /mes matchs/i }))
    expect(
      await screen.findByText('Préparateur running : du premier 10 km au marathon'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retirer le match avec Karim' }))

    expect(await screen.findByText('Pas encore de match')).toBeInTheDocument()
    expect(db.matches[0]?.status).toBe('ENDED')
  })
})
