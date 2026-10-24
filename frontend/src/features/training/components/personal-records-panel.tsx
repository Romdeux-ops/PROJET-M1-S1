import { Loader2, Trophy } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { usePersonalRecords } from '../hooks/use-sessions'
import { METRIC_LABELS } from '../schemas'

export function PersonalRecordsPanel() {
  const { data: records = [], isLoading } = usePersonalRecords()

  if (isLoading) return <Loader2 className="size-5 animate-spin text-muted-foreground" />
  if (records.length === 0) return null

  const byExercise = new Map<string, typeof records>()
  for (const record of records) {
    byExercise.set(record.exerciseId, [...(byExercise.get(record.exerciseId) ?? []), record])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-4" /> Records personnels
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...byExercise.entries()].map(([exerciseId, entries]) => (
          <div key={exerciseId} className="rounded-md border p-3">
            <p className="text-sm font-medium">{entries[0]?.exerciseName}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {entries.map((r) => (
                <Badge key={r.metric} variant="outline">
                  {METRIC_LABELS[r.metric]} : {r.value}kg
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
