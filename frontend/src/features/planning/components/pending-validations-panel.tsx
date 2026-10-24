import { CheckCircle2, ClipboardCheck, Loader2 } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/format'

import { usePendingValidations, useValidate } from '../hooks/use-planning'

export function PendingValidationsPanel() {
  const { data: sessions = [], isLoading } = usePendingValidations()
  const validate = useValidate()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="size-4" /> Séances à valider
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : sessions.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="Rien à valider pour le moment" />
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.athleteName} · {formatDate(s.scheduledDate)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={validate.isPending}
                  onClick={() => validate.mutate(s.id)}
                >
                  {validate.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-3.5" />
                  )}
                  Valider
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
