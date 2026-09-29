import { createFileRoute } from '@tanstack/react-router'

import { CatalogPage } from '@/features/catalog'

export const Route = createFileRoute('/_app/catalog')({
  component: CatalogPage,
})
