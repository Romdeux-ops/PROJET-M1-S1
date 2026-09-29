import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { getNavItem, type ModuleKey } from '@/features/navigation'

/** Page d'attente d'un module : a remplacer par la vraie page de la feature. */
export function ModulePlaceholder({ module }: { module: ModuleKey }) {
  const item = getNavItem(module)
  return (
    <>
      <PageHeader
        title={item.label}
        description={item.description}
        actions={<Badge variant="outline">En construction</Badge>}
      />
      <EmptyState
        icon={item.icon}
        title="Ce module arrive bientôt"
        description={
          <>
            Le code de cette page vit dans{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              src/features/{module}
            </code>
            . Suivez le guide du README pour la construire.
          </>
        }
      />
    </>
  )
}
