import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { db } from '@/mocks/db'
import { server } from '@/mocks/node'
import { loginAs, renderWithProviders } from '@/test/utils'

import { AiPage } from './ai-page'

describe('AiPage', () => {
  beforeEach(() => loginAs('ATHLETE'))

  it('génère un brouillon et l’affiche avec les noms d’exercices', async () => {
    const { user } = renderWithProviders(<AiPage />)
    expect(screen.getByText('Le programme proposé apparaîtra ici.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /générer un programme/i }))

    expect(await screen.findByText('Programme généré')).toBeInTheDocument()
    expect(screen.getAllByText('Squat').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /enregistrer ce programme/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /régénérer/i })).toBeInTheDocument()
  })

  it('enregistre le brouillon via l’API des programmes puis prévient la page', async () => {
    const onSaved = vi.fn()
    const { user } = renderWithProviders(<AiPage onSaved={onSaved} />)
    await user.click(screen.getByRole('button', { name: /générer un programme/i }))
    await user.click(await screen.findByRole('button', { name: /enregistrer ce programme/i }))

    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    const saved = db.programs.find((p) => p.title === 'Programme généré')
    expect(saved?.visibility).toBe('PRIVATE')
    expect(saved?.days).toHaveLength(3)
    expect(saved?.days[0]?.exercises).toHaveLength(3)
  })

  it('signale l’erreur quand la génération IA n’est pas configurée', async () => {
    server.use(
      http.post('*/api/ai/program-generation', () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Service Unavailable',
            status: 503,
            detail: 'Generation IA non configuree',
          },
          { status: 503, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    )
    const { user } = renderWithProviders(<AiPage />)

    await user.click(screen.getByRole('button', { name: /générer un programme/i }))

    expect(await screen.findByText(/non configuree/i)).toBeInTheDocument()
    expect(screen.getByText('Le programme proposé apparaîtra ici.')).toBeInTheDocument()
  })
})
