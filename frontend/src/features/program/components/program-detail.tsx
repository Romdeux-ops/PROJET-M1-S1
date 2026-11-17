import { Loader2 } from 'lucide-react'

import { useProgram } from '../hooks/use-programs'
import { ProgramDayList } from './program-day-list'
import { RatingWidget, StaticStars } from './rating-widget'

export function ProgramDetail({ programId }: { programId: string }) {
  const { data: program, isLoading } = useProgram(programId)

  if (isLoading || !program) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />
  }

  return (
    <div className="space-y-4">
      {program.mine && program.shareToken && (
        <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Lien de partage public : <code>/programs/shared/{program.shareToken}</code>
        </p>
      )}

      {program.visibility !== 'PRIVATE' && (
        <div className="flex items-center gap-2 text-sm">
          <StaticStars value={program.averageRating} />
          <span className="text-muted-foreground">
            {program.ratingsCount > 0
              ? `${program.averageRating.toFixed(1)} / 5 (${program.ratingsCount} note${program.ratingsCount > 1 ? 's' : ''})`
              : 'Pas encore de note'}
          </span>
        </div>
      )}

      {!program.mine && program.visibility !== 'PRIVATE' && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Noter ce programme :</span>
          <RatingWidget programId={program.id} />
        </div>
      )}

      {program.days.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun jour pour l’instant.</p>
      ) : null}

      <ProgramDayList program={program} canManage={program.mine} />
    </div>
  )
}
