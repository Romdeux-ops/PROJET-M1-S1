import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useMuscleGroups, useTags } from '../hooks/use-catalog'
import { DIFFICULTY_LABELS, type ExerciseSearchFilters, difficulties } from '../schemas'

const ALL = '__all__'

export function ExerciseFiltersBar({
  filters,
  onChange,
}: {
  filters: ExerciseSearchFilters
  onChange: (filters: ExerciseSearchFilters) => void
}) {
  const { data: muscleGroups = [] } = useMuscleGroups()
  const { data: tags = [] } = useTags()

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Rechercher un exercice..."
          value={filters.query ?? ''}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
        />
      </div>

      <Select
        value={filters.muscleGroupId ?? ALL}
        onValueChange={(value) =>
          onChange({ ...filters, muscleGroupId: value === ALL ? undefined : value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Muscle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tous les muscles</SelectItem>
          {muscleGroups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.tagId ?? ALL}
        onValueChange={(value) =>
          onChange({ ...filters, tagId: value === ALL ? undefined : value })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tous les tags</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              {tag.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.difficulty ?? ALL}
        onValueChange={(value) =>
          onChange({
            ...filters,
            difficulty: value === ALL ? undefined : (value as (typeof difficulties)[number]),
          })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Difficulté" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Toutes difficultés</SelectItem>
          {difficulties.map((d) => (
            <SelectItem key={d} value={d}>
              {DIFFICULTY_LABELS[d]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
