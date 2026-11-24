import { Confetti } from '@/components/motion/confetti'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { BadgeGrid } from '../components/badge-grid'
import { LeaderboardTable } from '../components/leaderboard-table'
import { LevelCard } from '../components/level-card'
import { useGamificationProfile, useLeaderboard } from '../hooks/use-gamification'
import { useSession } from '@/lib/auth/session'
import { useNewBadgeCelebration } from '../use-new-badges'

export function GamificationPage() {
  const { data: profile } = useGamificationProfile()
  const { data: leaderboard } = useLeaderboard()
  const earned = profile?.badges.filter((b) => b.awardedAt !== null).length ?? 0
  const userId = useSession((s) => s.user?.id ?? 'anonymous')
  const celebration = useNewBadgeCelebration(profile?.badges, userId)

  return (
    <>
      <Confetti fire={celebration} />
      <PageHeader
        title="Progression"
        description="Gagnez de l'expérience à chaque séance, débloquez des badges et comparez-vous aux autres athlètes."
      />

      <div className="space-y-6">
        {profile && <LevelCard profile={profile} />}

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>
              {profile ? `${earned} sur ${profile.badges.length} obtenus.` : 'Chargement…'}
            </CardDescription>
          </CardHeader>
          <CardContent>{profile && <BadgeGrid badges={profile.badges} />}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classement</CardTitle>
            <CardDescription>Les athlètes ayant le plus d'expérience.</CardDescription>
          </CardHeader>
          <CardContent>{leaderboard && <LeaderboardTable entries={leaderboard} />}</CardContent>
        </Card>
      </div>
    </>
  )
}
