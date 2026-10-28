import { ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { ScheduleForm } from '../components/schedule-form'
import { ScheduledItem } from '../components/scheduled-item'
import { useScheduledRange } from '../hooks/use-planning'

function toIso(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return d
}

const WEEKDAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export function PlanningPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [scheduleDate, setScheduleDate] = useState<string | null>(null)

  const days = useMemo(
    () =>
      Array.from(
        { length: 7 },
        (_, i) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i),
      ),
    [weekStart],
  )
  const from = toIso(days[0]!)
  const to = toIso(days[6]!)
  const { data: sessions = [], isLoading } = useScheduledRange(from, to)

  function shiftWeek(delta: number) {
    setWeekStart(
      (prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + delta * 7),
    )
  }

  return (
    <>
      <PageHeader
        title="Planning"
        description="Calendrier des séances prévues, réalisées et sautées."
        actions={
          <Button onClick={() => setScheduleDate(toIso(new Date()))}>
            <Plus /> Planifier une séance
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <Button type="button" variant="outline" size="icon-sm" onClick={() => shiftWeek(-1)}>
          <ChevronLeft />
        </Button>
        <p className="text-sm font-medium">
          {from} — {to}
        </p>
        <Button type="button" variant="outline" size="icon-sm" onClick={() => shiftWeek(1)}>
          <ChevronRight />
        </Button>
      </div>

      {isLoading ? (
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {days.map((day, i) => {
            const iso = toIso(day)
            const daySessions = sessions.filter((s) => s.scheduledDate === iso)
            return (
              <Card key={iso}>
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>{WEEKDAY_LABELS[i]}</span>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setScheduleDate(iso)}
                    >
                      {day.getDate()}/{day.getMonth() + 1}
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {daySessions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Rien de prévu</p>
                  ) : (
                    daySessions.map((s) => <ScheduledItem key={s.id} session={s} />)
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={scheduleDate !== null} onOpenChange={(open) => !open && setScheduleDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Planifier une séance</DialogTitle>
          </DialogHeader>
          {scheduleDate && (
            <ScheduleForm defaultDate={scheduleDate} onDone={() => setScheduleDate(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
