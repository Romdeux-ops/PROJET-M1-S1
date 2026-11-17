import { Sparkles } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import type { GamificationProfile } from '../schemas'

export function LevelCard({ profile }: { profile: GamificationProfile }) {
  const span = profile.nextLevelXp - profile.levelStartXp
  const percent = span > 0 ? Math.round(((profile.xp - profile.levelStartXp) / span) * 100) : 0

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <Sparkles className="size-7" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Niveau</p>
            <p className="text-3xl font-semibold tabular-nums">{profile.level}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-muted-foreground">Expérience</p>
            <p className="text-xl font-semibold tabular-nums">{profile.xp} XP</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <Progress value={percent} aria-label="Progression vers le niveau suivant" />
          <p className="text-xs text-muted-foreground">
            {profile.nextLevelXp - profile.xp} XP avant le niveau {profile.level + 1}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
