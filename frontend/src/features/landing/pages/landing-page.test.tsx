import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'

import { LandingPage } from './landing-page'

function renderLanding() {
  const root = createRootRoute({ component: LandingPage })
  const routeTree = root.addChildren(
    ['/login', '/register'].map((path) =>
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
      'Entraînez-vous mieux, progressez plus vite.',
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
      await screen.findByRole('heading', { name: /tout ce qu.il faut pour progresser/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /trois étapes/i })).toBeInTheDocument()
    expect(screen.getByText('badges à débloquer')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(6)
  })

  it('propose la navigation par ancres', async () => {
    renderLanding()

    const nav = await screen.findByRole('navigation', { name: 'Sections' })
    expect(nav).toHaveTextContent('Fonctionnalités')
    expect(nav.querySelector('a[href="#parcours"]')).not.toBeNull()
  })
})
