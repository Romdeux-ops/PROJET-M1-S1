import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/node'
import { loginAs, renderWithProviders } from '@/test/utils'

import { DashboardPage } from './dashboard-page'

/** La page contient des liens : on la monte dans un routeur en memoire. */
function renderDashboard() {
  const router = createRouter({
    routeTree: createRootRoute({ component: DashboardPage }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return renderWithProviders(<RouterProvider router={router} />)
}

describe('DashboardPage', () => {
  beforeEach(() => loginAs('ATHLETE'))

  it('affiche la séance planifiée aujourd’hui', async () => {
    renderDashboard()

    const card = (await screen.findByText('Séance du jour')).closest<HTMLElement>(
      '[data-slot="card"]',
    )!
    expect(await within(card).findByText('Push day')).toBeInTheDocument()
    expect(within(card).getByText('Prévu')).toBeInTheDocument()
  })

  it('indique quand rien n’est prévu aujourd’hui', async () => {
    server.use(http.get('*/api/planning/scheduled/today', () => HttpResponse.json([])))
    renderDashboard()

    expect(await screen.findByText("Rien de prévu aujourd'hui.")).toBeInTheDocument()
  })
})
