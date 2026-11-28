import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ChipGroupProps<T extends string> {
  label: string
  options: readonly T[]
  labels: Record<T, string>
  value: T[]
  onChange: (value: T[]) => void
  max?: number
}

/** Choix multiple sous forme de pastilles ; chaque pastille est un bouton a bascule accessible. */
export function ChipGroup<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
  max,
}: ChipGroupProps<T>) {
  const toggle = (option: T) => {
    if (value.includes(option)) onChange(value.filter((v) => v !== option))
    else if (!max || value.length < max) onChange([...value, option])
  }

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value.includes(option)
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(option)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors',
              'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-background text-foreground hover:bg-accent',
            )}
          >
            {selected && <Check className="size-3.5" />}
            {labels[option]}
          </button>
        )
      })}
    </div>
  )
}
