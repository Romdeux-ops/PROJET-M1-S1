import { cn } from '@/lib/utils'

import type { LeaderboardEntry } from '../schemas'

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Personne n'a encore gagné d'expérience. Enregistrez une séance pour ouvrir le classement.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-muted-foreground">
          <tr>
            <th className="pb-2 text-left">#</th>
            <th className="pb-2 text-left">Athlète</th>
            <th className="pb-2 text-right">Niveau</th>
            <th className="pb-2 text-right">XP</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {entries.map((entry) => (
            <tr key={entry.userId} className={cn(entry.you && 'bg-accent/60 font-medium')}>
              <td className="py-2 pr-2 tabular-nums">{entry.rank}</td>
              <td className="py-2">
                {entry.displayName}
                {entry.you && <span className="ml-2 text-xs text-muted-foreground">(vous)</span>}
              </td>
              <td className="py-2 text-right tabular-nums">{entry.level}</td>
              <td className="py-2 text-right tabular-nums">{entry.xp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
