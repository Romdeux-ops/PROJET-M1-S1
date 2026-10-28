import { TrendingDown, TrendingUp } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useProgressionScore } from '../hooks/use-stats'

export function ProgressionScoreCard() {
  const { data } = useProgressionScore()
  if (!data) return null

  const isPositive = data.changePercent >= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {isPositive ? (
            <TrendingUp className="size-4 text-success" />
          ) : (
            <TrendingDown className="size-4 text-destructive" />
          )}
          Progression sur 30 jours
        </CardTitle>
        <CardDescription>Volume total vs les 30 jours précédents.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? '+' : ''}
          {data.changePercent.toFixed(0)}%
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.last30DaysVolume.toLocaleString('fr-FR')} kg vs{' '}
          {data.previous30DaysVolume.toLocaleString('fr-FR')} kg
        </p>
      </CardContent>
    </Card>
  )
}
