import { Link } from '@tanstack/react-router'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

import { useShell } from './shell-store'
import { SidebarNav } from './sidebar-nav'

export function Sidebar() {
  const collapsed = useShell((s) => s.collapsed)
  const toggleCollapsed = useShell((s) => s.toggleCollapsed)

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border/60 bg-sidebar transition-[width] duration-300 ease-out lg:flex',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <div className={cn('flex h-16 items-center px-4', collapsed && 'justify-center px-0')}>
        <Link to="/dashboard" aria-label="Accueil FitCoach">
          <Logo withText={!collapsed} />
        </Link>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className={cn('px-3 py-2', collapsed && 'px-3')}>
          <SidebarNav collapsed={collapsed} />
        </div>
      </ScrollArea>
      <div className={cn('border-t p-3', collapsed && 'flex justify-center')}>
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          onClick={toggleCollapsed}
          className={cn('text-muted-foreground', !collapsed && 'w-full justify-start')}
          aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          {!collapsed && 'Replier'}
        </Button>
      </div>
    </aside>
  )
}
