import { useNavigate } from '@tanstack/react-router'
import { Menu, Search } from 'lucide-react'

import { PalettePicker } from '@/components/palette-picker'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/features/notification'

import { useShell } from './shell-store'
import { UserMenu } from './user-menu'

export function Topbar() {
  const navigate = useNavigate()
  const setMobileOpen = useShell((s) => s.setMobileOpen)
  const setCommandOpen = useShell((s) => s.setCommandOpen)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu />
      </Button>

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-xl border bg-muted/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Rechercher…</span>
        <kbd className="hidden rounded border bg-background px-1.5 font-mono text-[10px] font-medium sm:inline">
          Ctrl K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <NotificationBell onNavigate={(link) => void navigate({ to: link })} />
        <PalettePicker />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
