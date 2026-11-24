import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

import { gamificationKeys } from '@/features/gamification'
import { statsKeys } from '@/features/stats'
import { loginAs } from '@/test/utils'

import { useAddSet, useCreateSession } from './use-sessions'

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const invalidatedKeys = () => invalidate.mock.calls.map(([filters]) => filters?.queryKey)
  return { wrapper, invalidatedKeys }
}

/** XP, badges et statistiques derivent des seances : ils doivent etre recharges apres chaque ecriture. */
describe('mutations du carnet', () => {
  beforeEach(() => loginAs('ATHLETE'))

  it('recharge la progression et les stats après la création d’une séance', async () => {
    const { wrapper, invalidatedKeys } = setup()
    const { result } = renderHook(() => useCreateSession(), { wrapper })

    result.current.mutate({ title: 'Jambes', performedAt: new Date().toISOString() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidatedKeys()).toEqual(expect.arrayContaining([gamificationKeys.all, statsKeys.all]))
  })

  it('recharge la progression et les stats après l’ajout d’une série', async () => {
    const { wrapper, invalidatedKeys } = setup()
    const { result } = renderHook(() => useAddSet('s-1'), { wrapper })

    result.current.mutate({ exerciseId: 'ex-1', setNumber: 1, reps: 8, weightKg: 60 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidatedKeys()).toEqual(expect.arrayContaining([gamificationKeys.all, statsKeys.all]))
  })
})
