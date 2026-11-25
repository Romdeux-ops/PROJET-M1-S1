import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'

import { useSession } from '@/lib/auth/session'
import { loginAs } from '@/test/utils'

import { LandingPage } from './landing-page'

function renderLanding() {
  const root = createRootRoute({ component: LandingPage })
  const routeTree = root.addChildren(
    ['/login', '/register', '/dashboard'].map((path) =>
      createRoute({ getParentRoute: () => root, path, component: () => <p>{path}</p> }),
    ),
  )
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return render(<RouterProvider router={router} />)
}

describe('LandingPage', () => {
  it('presente le produit et propose de creer un compte ou de se connecter', async () => {
    renderLanding()

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Travaille. Progresse. Recommence.',
    )
    expect(screen.getByRole('link', { name: /commencer gratuitement/i })).toHaveAttribute(
      'href',
      '/register',
    )
    expect(screen.getByRole('link', { name: /j.ai déjà un compte/i })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('affiche les sections fonctionnalites, parcours et chiffres', async () => {
    renderLanding()

    expect(
      await screen.findByRole('heading', { name: /tout pour progresser/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /trois séries/i })).toBeInTheDocument()
    expect(screen.getByText('badges à débloquer')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(6)
  })

  it('propose la navigation par ancres', async () => {
    renderLanding()

    const nav = await screen.findByRole('navigation', { name: 'Sections' })
    expect(nav).toHaveTextContent('Fonctionnalités')
    expect(nav.querySelector('a[href="#parcours"]')).not.toBeNull()
  })

  it("propose l'inscription et la connexion à un visiteur", async () => {
    renderLanding()

    expect(await screen.findByRole('link', { name: /créer un compte/i })).toHaveAttribute(
      'href',
      '/register',
    )
    expect(screen.getByRole('link', { name: /connexion/i })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('link', { name: /mon espace/i })).not.toBeInTheDocument()
  })

  it("propose d'accéder à son espace quand on est connecté, sans redirection", async () => {
    loginAs('ATHLETE')
    renderLanding()

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /mon espace|accéder à mon espace/i })[0],
    ).toHaveAttribute('href', '/dashboard')
    expect(screen.queryByRole('link', { name: /créer un compte/i })).not.toBeInTheDocument()
    useSession.getState().logout()
  })
})
