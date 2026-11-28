import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'

import { db, type MockMatchProfile } from '@/mocks/db'
import { server } from '@/mocks/node'
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

    await user.type(screen.getByLabelText('Votre accroche'), 'Premier 10 km en vue')
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
    await user.type(screen.getByLabelText('Votre accroche'), 'Je veux me mettre à la muscu')
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

describe('MatchingPage : pile de cartes', () => {
  beforeEach(() => {
    loginAs('ATHLETE')
    registerLea()
  })

  it('rend la carte après une erreur passagère (5xx)', async () => {
    server.use(
      http.post('*/api/matching/swipes', () =>
        HttpResponse.json({ status: 503, detail: 'Indisponible' }, { status: 503 }),
      ),
    )
    const { user } = renderWithProviders(<MatchingPage />)
    await screen.findByRole('article', { name: /sarah/i })

    await user.click(screen.getByRole('button', { name: 'Passer' }))

    await waitFor(() =>
      expect(screen.getAllByRole('article', { name: /sarah/i }).length).toBeGreaterThan(0),
    )
    expect(db.swipes.some((s) => s.swiperId === 'u-athlete')).toBe(false)
  })

  it('ne rend pas une carte refusée définitivement (4xx)', async () => {
    server.use(
      http.post('*/api/matching/swipes', () =>
        HttpResponse.json({ status: 404, detail: 'Profil FitMatch introuvable.' }, { status: 404 }),
      ),
    )
    const { user } = renderWithProviders(<MatchingPage />)
    await screen.findByRole('article', { name: /sarah/i })

    await user.click(screen.getByRole('button', { name: 'Passer' }))

    expect(await screen.findByRole('article', { name: /inès/i })).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: /sarah/i })).not.toBeInTheDocument(),
    )
  })

  it('affiche le match même si on swipe la carte suivante avant la réponse', async () => {
    // Les reponses arrivent apres le second clic ; sans contenu, le handler passe la main au mock.
    server.use(
      http.post('*/api/matching/swipes', async () => {
        await delay(80)
      }),
    )
    const { user } = renderWithProviders(<MatchingPage />)
    await screen.findByRole('article', { name: /sarah/i })

    await user.click(screen.getByRole('button', { name: "J'aime" }))
    await user.click(screen.getByRole('button', { name: 'Passer' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/sarah et vous/i)).toBeInTheDocument()
    // Le second swipe vise bien la carte suivante (et se termine avant la fin du test).
    await waitFor(() =>
      expect(db.swipes).toContainEqual({
        swiperId: 'u-athlete',
        targetId: 'u-fm-ines',
        decision: 'PASS',
      }),
    )
  })

  it('ne ressuscite pas les cartes swipées après un changement d’onglet', async () => {
    const { user } = renderWithProviders(<MatchingPage />)
    await screen.findByRole('article', { name: /sarah/i })

    await user.click(screen.getByRole('button', { name: 'Passer' }))
    await screen.findByRole('article', { name: /inès/i })
    await user.click(screen.getByRole('tab', { name: /mes matchs/i }))
    await user.click(screen.getByRole('tab', { name: /découvrir/i }))

    expect(await screen.findByRole('article', { name: /inès/i })).toBeInTheDocument()
    expect(screen.queryByRole('article', { name: /sarah/i })).not.toBeInTheDocument()
  })

  it('les flèches swipent, sauf quand le focus est sur les onglets', async () => {
    const { user } = renderWithProviders(<MatchingPage />)
    await screen.findByRole('article', { name: /sarah/i })

    screen.getByRole('tab', { name: /découvrir/i }).focus()
    await user.keyboard('{ArrowRight}')
    expect(db.swipes.some((s) => s.swiperId === 'u-athlete')).toBe(false)

    await user.click(screen.getByRole('tab', { name: /découvrir/i }))
    ;(document.activeElement as HTMLElement | null)?.blur()
    await user.keyboard('{ArrowLeft}')
    await waitFor(() =>
      expect(db.swipes).toContainEqual({
        swiperId: 'u-athlete',
        targetId: 'u-fm-sarah',
        decision: 'PASS',
      }),
    )
  })

  it('verrouille la date de naissance déjà connue du compte', async () => {
    const { user } = renderWithProviders(<MatchingPage />)
    await user.click(await screen.findByRole('tab', { name: /mon profil/i }))

    const birthDate = await screen.findByLabelText(/date de naissance/i)
    expect(birthDate).toHaveAttribute('readonly')
    expect(birthDate).toHaveValue('1999-06-01')
  })

  it('affiche un état d’erreur si le profil ne se charge pas', async () => {
    server.use(
      http.get('*/api/matching/profile', () =>
        HttpResponse.json({ status: 500, detail: 'Erreur interne' }, { status: 500 }),
      ),
    )
    renderWithProviders(<MatchingPage />)

    expect(await screen.findByText('FitMatch est indisponible pour le moment')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /réessayer/i })).toBeInTheDocument()
  })
})
