import { Link } from '@tanstack/react-router'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { useVisibleNavigation } from './use-visible-navigation'

interface SidebarNavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const groups = useVisibleNavigation()

  return (
    <nav className="flex flex-col gap-6" aria-label="Navigation principale">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p
            className={cn(
              'px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase transition-opacity',
              collapsed && 'sr-only',
            )}
          >
            {group.label}
          </p>
          {group.items.map((item) => {
            const Icon = item.icon
            const link = (
              <Link
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all',
                  'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                  'data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground data-[status=active]:shadow-sm',
                  'before:absolute before:top-2 before:bottom-2 before:left-0 before:w-1 before:rounded-full before:bg-primary before:opacity-0 before:transition-opacity data-[status=active]:before:opacity-100',
                  collapsed && 'justify-center px-0',
                )}
              >
                <Icon className="size-4.5 shrink-0 group-data-[status=active]:text-primary" />
                <span className={cn('truncate', collapsed && 'sr-only')}>{item.label}</span>
              </Link>
            )

            if (!collapsed) return <div key={item.key}>{link}</div>
            return (
              <Tooltip key={item.key}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
