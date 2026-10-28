import { useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useExercises } from '@/features/catalog'

import { useExerciseProgression } from '../hooks/use-stats'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

export function ExerciseProgressionChart() {
  const { data: exercises = [] } = useExercises({})
  const [exerciseId, setExerciseId] = useState('')
  const { data: points = [] } = useExerciseProgression(exerciseId)

  return (
    <div className="space-y-4">
      <Select value={exerciseId} onValueChange={setExerciseId}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Choisir un exercice" />
        </SelectTrigger>
        <SelectContent>
          {exercises.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!exerciseId ? (
        <p className="text-sm text-muted-foreground">
          Sélectionnez un exercice pour voir votre progression.
        </p>
      ) : points.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune série enregistrée pour cet exercice.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="pb-2 text-left">Date</th>
                <th className="pb-2 text-right">Charge max</th>
                <th className="pb-2 text-right">1RM estimé</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {points.map((p) => (
                <tr key={p.date}>
                  <td className="py-1.5">{dateFormatter.format(new Date(p.date))}</td>
                  <td className="py-1.5 text-right tabular-nums">{p.maxWeight} kg</td>
                  <td className="py-1.5 text-right tabular-nums">{p.estimated1Rm.toFixed(1)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
