import { createFileRoute } from '@tanstack/react-router'

import { BookingPage } from '@/features/booking'

export const Route = createFileRoute('/_app/booking')({
  component: BookingPage,
})
