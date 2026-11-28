import { useState } from 'react'

import { LayoutDashboard, BatteryCharging, Moon, Activity, RefreshCw, Info } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/feedback'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

import { useRecoveryOverview } from '../hooks/use-recovery'

import { useRefreshRecoveryOverview } from '../hooks/use-recovery-mutations'

import { RecoveryOverview } from '../components/overview/recovery-overview'

import { BodyBatteryTab } from '../components/body-battery/body-battery-tab'

import { SleepTab } from '../components/sleep/sleep-tab'

import { TrainingReadinessTab } from '../components/training-readiness/training-readiness-tab'

import { RecoverySettingsDialog } from '../components/forms/recovery-settings-dialog'

function formatCalculationTime(value?: string | null, timeZone?: string | null): string | null {
  if (!value) return null

  const date = new Date(value)

  if (!Number.isFinite(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timeZone ?? undefined,
  }).format(date)
}

function RecoveryPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full max-w-xl rounded-lg" />

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-64 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-28 rounded-xl" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}

export function RecoveryPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const overviewQuery = useRecoveryOverview()

  const refreshMutation = useRefreshRecoveryOverview()

  const overview = overviewQuery.data

  const lastCalculation = formatCalculationTime(
    overview?.todayAssessment?.calculatedAt,
    overview?.timeZone,
  )

  const refreshing = refreshMutation.isPending

  function handleRetry() {
    void overviewQuery.refetch()
  }

  return (
    <>
      <PageHeader
        title="Recovery"
        description="Suivez votre récupération, analysez votre sommeil et adaptez vos entraînements."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {overview && <RecoverySettingsDialog settings={overview.settings} />}

            <Button
              type="button"
              variant="outline"
              disabled={refreshing || overviewQuery.isFetching || !overview}
              onClick={() => refreshMutation.mutate()}
            >
              <RefreshCw
                className={`mr-2 size-4 ${
                  refreshing ? 'animate-spin motion-reduce:animate-none' : ''
                }`}
              />

              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </Button>
          </div>
        }
      />

      {overviewQuery.isPending && <RecoveryPageSkeleton />}

      {overviewQuery.isError && !overview && (
        <ErrorState error={overviewQuery.error} onRetry={handleRetry} />
      )}

      {overview && (
        <div className="space-y-6">
          <div
            className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"
            aria-live="polite"
          >
            <span>
              {lastCalculation
                ? `Dernière évaluation : ${lastCalculation}`
                : 'Aucune évaluation calculée pour aujourd’hui.'}
            </span>

            {overviewQuery.isFetching && <span>Chargement des données...</span>}

            {refreshing && <span>Recalcul des indicateurs en cours...</span>}
          </div>

          {overviewQuery.isError && (
            <ErrorState error={overviewQuery.error} onRetry={handleRetry} />
          )}

          {refreshMutation.isError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
            >
              <p className="font-medium">Impossible d'actualiser les évaluations.</p>

              <p className="mt-1 text-muted-foreground">
                Les dernières données disponibles restent affichées. Vous pouvez réessayer avec le
                bouton Actualiser.
              </p>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

            <p className="text-xs leading-relaxed text-muted-foreground">
              Après une modification de vos entraînements ou de votre poids, utilisez le bouton
              Actualiser pour recalculer vos indicateurs sur les 30 derniers jours.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="h-auto w-full flex-wrap justify-start sm:w-fit">
              <TabsTrigger value="overview" className="min-h-9">
                <LayoutDashboard className="size-4" />
                Vue d'ensemble
              </TabsTrigger>

              <TabsTrigger value="body-battery" className="min-h-9">
                <BatteryCharging className="size-4" />
                Body Battery
              </TabsTrigger>

              <TabsTrigger value="sleep" className="min-h-9">
                <Moon className="size-4" />
                Sleep Score
              </TabsTrigger>

              <TabsTrigger value="training-readiness" className="min-h-9">
                <Activity className="size-4" />
                Training Readiness
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <RecoveryOverview overview={overview} />
            </TabsContent>

            <TabsContent value="body-battery" className="space-y-6">
              <BodyBatteryTab overview={overview} />
            </TabsContent>

            <TabsContent value="sleep" className="space-y-6">
              <SleepTab overview={overview} />
            </TabsContent>

            <TabsContent value="training-readiness" className="space-y-6">
              <TrainingReadinessTab overview={overview} />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!overviewQuery.isPending && !overviewQuery.isError && !overview && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">Aucune donnée de récupération disponible.</p>

          <Button type="button" variant="outline" className="mt-4" onClick={handleRetry}>
            Réessayer
          </Button>
        </div>
      )}
    </>
  )
}
