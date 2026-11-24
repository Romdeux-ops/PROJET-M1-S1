import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { MotionConfig } from 'motion/react'
import { useState } from 'react'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { createQueryClient } from '@/lib/query-client'

import { createAppRouter } from './router'

export function App() {
  const [queryClient] = useState(createQueryClient)
  const [router] = useState(() => createAppRouter(queryClient))

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={200}>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  )
}
