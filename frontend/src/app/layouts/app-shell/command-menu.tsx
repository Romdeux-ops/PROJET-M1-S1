import { useNavigate } from '@tanstack/react-router'
import { CornerDownLeft, Search } from 'lucide-react'
import { type KeyboardEvent, useEffect, useMemo, useState } from 'react'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { useShell } from './shell-store'
import { useVisibleNavigation } from './use-visible-navigation'

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

/** Palette de navigation rapide (Ctrl+K / Cmd+K). */
export function CommandMenu() {
  const open = useShell((s) => s.commandOpen)
  const setOpen = useShell((s) => s.setCommandOpen)
  const groups = useVisibleNavigation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen(!useShell.getState().commandOpen)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setOpen])

  const results = useMemo(() => {
    const q = normalize(query.trim())
    return groups
      .flatMap((g) => g.items)
      .filter((item) => !q || normalize(`${item.label} ${item.description}`).includes(q))
  }, [groups, query])

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setQuery('')
      setActive(0)
    }
  }

  const go = (index: number) => {
    const item = results[index]
    if (!item) return
    onOpenChange(false)
    void navigate({ to: item.to })
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      go(active)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogTitle className="sr-only">Rechercher</DialogTitle>
        <DialogDescription className="sr-only">Aller rapidement à une section</DialogDescription>
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            aria-label="Rechercher une section"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Aller à…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="py-8 text-center text-sm text-muted-foreground">Aucun résultat.</li>
          )}
          {results.map((item, index) => {
            const Icon = item.icon
            return (
              <li key={item.key}>
                <button
                  type="button"
                  aria-current={index === active ? 'true' : undefined}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(index)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                    index === active && 'bg-accent text-accent-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  {index === active && (
                    <CornerDownLeft className="size-3.5 text-muted-foreground" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
