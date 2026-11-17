import { Loader2, RefreshCw, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LEVEL_LABELS } from '@/features/program'

import type { GeneratedProgram } from '../schemas'

export function GeneratedProgramPreview({
  draft,
  onRegenerate,
  onSave,
  isRegenerating,
  isSaving,
}: {
  draft: GeneratedProgram
  onRegenerate: () => void
  onSave: () => void
  isRegenerating: boolean
  isSaving: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">{draft.name}</h2>
          <Badge variant="secondary">{LEVEL_LABELS[draft.level]}</Badge>
        </div>
        {draft.description && <p className="text-sm text-muted-foreground">{draft.description}</p>}
      </div>

      <div className="space-y-3">
        {draft.days.map((day, index) => (
          <section key={`${day.label}-${index}`} className="rounded-md border p-3">
            <h3 className="mb-2 text-sm font-medium">{day.label}</h3>
            <ul className="space-y-1 text-sm">
              {day.exercises.map((item, i) => (
                <li key={`${item.exerciseId}-${i}`} className="flex justify-between gap-3">
                  <span>{item.exerciseName}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {item.sets} × {item.reps} · repos {item.restSeconds} s
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onSave} disabled={isSaving || isRegenerating}>
          {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
          Enregistrer ce programme
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onRegenerate}
          disabled={isSaving || isRegenerating}
        >
          <RefreshCw /> Régénérer
        </Button>
      </div>
    </div>
  )
}
