import { useMutation, useQueryClient } from '@tanstack/react-query'

import { programKeys } from '@/features/program'

import { aiApi } from '../api/ai-api'
import type { GeneratedProgram, GenerationFormInput } from '../schemas'

export function useGenerateProgram() {
  return useMutation({
    mutationFn: ({ input, variant }: { input: GenerationFormInput; variant: number }) =>
      aiApi.generate(input, variant),
  })
}

export function useSaveGeneratedProgram() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (draft: GeneratedProgram) => aiApi.save(draft),
    meta: { successMessage: 'Programme enregistré dans vos programmes' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: programKeys.all }),
  })
}
