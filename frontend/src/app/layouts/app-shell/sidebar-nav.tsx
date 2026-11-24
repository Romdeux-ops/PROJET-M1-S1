import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useId } from 'react'

import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { useVisibleNavigation } from './use-visible-navigation'

interface SidebarNavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const groups = useVisibleNavigation()
  const pillId = useId()
  const order = new Map(groups.flatMap((g) => g.items).map((item, i) => [item.key, i]))
  const animated = useAnimationsEnabled()

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
                style={{ animationDelay: `${(order.get(item.key) ?? 0) * 45}ms` }}
                className={cn(
                  'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all',
                  'motion-safe:animate-[rise_0.5s_cubic-bezier(0.2,0.7,0.3,1)_both]',
                  'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                  'data-[status=active]:text-sidebar-accent-foreground',
                  !animated &&
                    'data-[status=active]:bg-sidebar-accent data-[status=active]:shadow-sm',
                  collapsed && 'justify-center px-0',
                )}
              >
                {({ isActive }) => (
                  <>
                    {animated && isActive && (
                      <motion.span
                        layoutId={pillId}
                        aria-hidden
                        className="absolute inset-0 rounded-xl bg-sidebar-accent shadow-sm"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Icon className="relative size-4.5 shrink-0 transition-transform group-hover:scale-110 group-data-[status=active]:text-primary" />
                    <span className={cn('relative truncate', collapsed && 'sr-only')}>
                      {item.label}
                    </span>
                  </>
                )}
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
