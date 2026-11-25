import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { screen } from '@testing-library/react'

import { db } from '@/mocks/db'
import { useSession } from '@/lib/auth/session'
import { loginAs, renderWithProviders } from '@/test/utils'

import { CoachProfilePage } from './coach-profile-page'

const COACH_ID = 'u-coach'

function renderProfile(coachId = COACH_ID) {
  const root = createRootRoute({ component: () => <CoachProfilePage coachId={coachId} /> })
  const routeTree = root.addChildren(
    ['/login', '/register', '/coaching'].map((path) =>
      createRoute({ getParentRoute: () => root, path, component: () => <p>{path}</p> }),
    ),
  )
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return renderWithProviders(<RouterProvider router={router} />)
}

/** Les comptes de demo sont deja lies : on retire la relation pour tester une premiere demande. */
function unlink() {
  db.coachAthletes = db.coachAthletes.filter((c) => c.coachId !== COACH_ID)
}

describe('CoachProfilePage', () => {
  afterEach(() => useSession.getState().logout())

  it('montre le profil du coach à un visiteur sans compte, sans son e-mail', async () => {
    renderProfile()

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/hugo bernard/i)
    expect(screen.getByText('Préparateur physique · Musculation')).toBeInTheDocument()
    expect(screen.getByText(/dix ans à accompagner/i)).toBeInTheDocument()
    expect(screen.queryByText(/@/)).not.toBeInTheDocument()
  })

  it('invite le visiteur à se connecter pour demander un suivi', async () => {
    renderProfile()

    expect(await screen.findByRole('link', { name: 'Se connecter' })).toHaveAttribute(
      'href',
      `/login?redirect=%2Fcoach%2F${COACH_ID}`,
    )
    expect(screen.getByRole('link', { name: 'Créer un compte' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /demander à être suivi/i })).not.toBeInTheDocument()
  })

  it('permet à un athlète de demander un suivi, puis de retirer sa demande', async () => {
    unlink()
    loginAs('ATHLETE')
    const { user } = renderProfile()

    await user.click(await screen.findByRole('button', { name: /demander à être suivi/i }))

    expect(await screen.findByText(/demande envoyée, en attente/i)).toBeInTheDocument()
    expect(db.coachAthletes.some((c) => c.status === 'REQUESTED')).toBe(true)

    await user.click(screen.getByRole('button', { name: /annuler la demande/i }))
    expect(
      await screen.findByRole('button', { name: /demander à être suivi/i }),
    ).toBeInTheDocument()
    expect(db.coachAthletes.some((c) => c.status === 'REQUESTED')).toBe(false)
  })

  it('indique à un athlète déjà suivi qu’il l’est', async () => {
    loginAs('ATHLETE')
    renderProfile()

    expect(await screen.findByText(/vous êtes suivi par ce coach/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /demander à être suivi/i })).not.toBeInTheDocument()
  })

  it('renvoie un athlète invité vers son invitation plutôt que de dupliquer', async () => {
    db.coachAthletes = [
      {
        coachId: COACH_ID,
        athleteId: 'u-athlete',
        status: 'PENDING',
        invitedAt: new Date().toISOString(),
      },
    ]
    loginAs('ATHLETE')
    renderProfile()

    expect(await screen.findByText(/ce coach vous a déjà invité/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /voir l.invitation/i })).toHaveAttribute(
      'href',
      '/coaching',
    )
  })

  it('reconnaît le coach sur sa propre page et lui propose de gérer son QR code', async () => {
    loginAs('COACH')
    renderProfile()

    expect(await screen.findByText(/c.est votre profil public/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /récupérer le qr code/i })).toBeInTheDocument()
  })

  it('refuse la demande à un autre coach', async () => {
    loginAs('ADMIN')
    useSession.setState((s) => ({ user: s.user && { ...s.user, roles: ['COACH'] } }))
    renderProfile()

    expect(await screen.findByText(/seuls les athlètes peuvent demander/i)).toBeInTheDocument()
  })

  it('affiche une page claire quand le profil n’est pas public', async () => {
    db.coachPublicProfiles[0]!.enabled = false
    renderProfile()

    expect(await screen.findByText("Ce profil n'est pas disponible")).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('affiche la même page pour un identifiant inconnu', async () => {
    renderProfile('inconnu')

    expect(await screen.findByText("Ce profil n'est pas disponible")).toBeInTheDocument()
  })
})
