import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useHasRole } from '@/lib/auth/session'
import { isoInDays } from '@/lib/format'

import { AvailableSlotList } from '../components/available-slot-list'
import { BookingList } from '../components/booking-list'
import { CoachSlotList } from '../components/coach-slot-list'
import { SlotForm } from '../components/slot-form'

/** Fenetre affichee : du jour meme aux 8 semaines suivantes. */
const HORIZON_DAYS = 56

export function BookingPage() {
  const isCoach = useHasRole('COACH')
  const from = isoInDays(0)
  const to = isoInDays(HORIZON_DAYS)

  return (
    <>
      <PageHeader
        title="Réservations"
        description={
          isCoach
            ? 'Publiez vos créneaux et suivez les réservations de vos athlètes.'
            : 'Réservez un créneau avec votre coach.'
        }
      />
      {isCoach ? <CoachView from={from} to={to} /> : <AthleteView from={from} to={to} />}
    </>
  )
}

function CoachView({ from, to }: { from: string; to: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Publier un créneau</CardTitle>
          <CardDescription>Un créneau accueille un seul athlète.</CardDescription>
        </CardHeader>
        <CardContent>
          <SlotForm />
        </CardContent>
      </Card>
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Mes créneaux</CardTitle>
          </CardHeader>
          <CardContent>
            <CoachSlotList from={from} to={to} />
          </CardContent>
        </Card>
        <BookingsCard from={from} to={to} />
      </div>
    </div>
  )
}

function AthleteView({ from, to }: { from: string; to: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Créneaux disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <AvailableSlotList from={from} to={to} />
        </CardContent>
      </Card>
      <BookingsCard from={from} to={to} />
    </div>
  )
}

function BookingsCard({ from, to }: { from: string; to: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Réservations</CardTitle>
        <CardDescription>Annulables jusqu'à 24 h avant le début.</CardDescription>
      </CardHeader>
      <CardContent>
        <BookingList from={from} to={to} />
      </CardContent>
    </Card>
  )
}
