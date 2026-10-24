import { CalendarCheck, Clock, Flame, Gauge } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/stat-card'

import { ExerciseProgressionChart } from '../components/exercise-progression-chart'
import { MuscleDistributionChart } from '../components/muscle-distribution-chart'
import { ProgressionScoreCard } from '../components/progression-score-card'
import { WeeklyActivityChart } from '../components/weekly-activity-chart'
import { WeeklyAdherenceChart } from '../components/weekly-adherence-chart'
import { WeeklyVolumeChart } from '../components/weekly-volume-chart'
import { useStatsOverview } from '../hooks/use-stats'

export function StatsPage() {
  const { data: overview } = useStatsOverview()

  return (
    <>
      <PageHeader title="Statistiques" description="Votre progression, séance après séance." />

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Flame}
            label="Série en cours"
            value={overview ? `${overview.currentStreakDays} j` : '—'}
          />
          <StatCard
            icon={CalendarCheck}
            label="Séances cette semaine"
            value={overview ? String(overview.sessionsThisWeek) : '—'}
            trend={overview?.sessionsTrend}
          />
          <StatCard
            icon={Clock}
            label="Minutes cette semaine"
            value={overview ? String(overview.minutesThisWeek) : '—'}
            trend={overview?.minutesTrend}
          />
          <StatCard icon={Gauge} label="RPE moyen" value={overview ? overview.averageEffort.toFixed(1) : '—'} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Activité des 7 derniers jours</CardTitle>
            </CardHeader>
            <CardContent>{overview && <WeeklyActivityChart data={overview.weeklyActivity} />}</CardContent>
          </Card>
          <ProgressionScoreCard />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Volume hebdomadaire</CardTitle>
              <CardDescription>Tonnage total (charge × répétitions) des 12 dernières semaines.</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyVolumeChart />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Répartition par muscle</CardTitle>
              <CardDescription>Volume des 30 derniers jours, par groupe musculaire primaire.</CardDescription>
            </CardHeader>
            <CardContent>
              <MuscleDistributionChart />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assiduité au planning</CardTitle>
            <CardDescription>Séances réalisées vs sautées, par semaine.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyAdherenceChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progression par exercice</CardTitle>
            <CardDescription>Charge maximale et 1RM estimé au fil du temps.</CardDescription>
          </CardHeader>
          <CardContent>
            <ExerciseProgressionChart />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
