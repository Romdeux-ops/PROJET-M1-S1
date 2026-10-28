import { Loader2, Star } from 'lucide-react'
import { useState } from 'react'

import { useRateProgram } from '../hooks/use-programs'

export function RatingWidget({ programId }: { programId: string }) {
  const [hovered, setHovered] = useState(0)
  const rate = useRateProgram(programId)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          className="text-amber-500"
          onMouseEnter={() => setHovered(value)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => rate.mutate({ stars: value })}
          disabled={rate.isPending}
        >
          <Star className={value <= hovered ? 'fill-current' : ''} />
        </button>
      ))}
      {rate.isPending && <Loader2 className="size-4 animate-spin" />}
    </div>
  )
}

export function StaticStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-3.5 ${i <= Math.round(value) ? 'fill-current' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  )
}
