import { Loader2, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { DayRow } from '../components/day-row'
import { ScheduleForm } from '../components/schedule-form'
import { WeekSummary } from '../components/week-summary'
import { WeekToolbar } from '../components/week-toolbar'
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
  const [todayIso] = useState(() => toIso(new Date()))
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
  const isCurrentWeek = todayIso >= from && todayIso <= to
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
          <Button onClick={() => setScheduleDate(todayIso)}>
            <Plus /> Planifier une séance
          </Button>
        }
      />

      <div className="space-y-6">
        <WeekToolbar
          days={days}
          isCurrentWeek={isCurrentWeek}
          onShift={shiftWeek}
          onToday={() => setWeekStart(startOfWeek(new Date()))}
        />

        {isLoading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <WeekSummary sessions={sessions} />
            <Stagger className="space-y-3">
              {days.map((day, i) => {
                const iso = toIso(day)
                return (
                  <StaggerItem key={iso}>
                    <DayRow
                      label={WEEKDAY_LABELS[i]!}
                      date={day}
                      isToday={iso === todayIso}
                      isPast={iso < todayIso}
                      sessions={sessions.filter((s) => s.scheduledDate === iso)}
                      onAdd={() => setScheduleDate(iso)}
                    />
                  </StaggerItem>
                )
              })}
            </Stagger>
          </>
        )}
      </div>

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
