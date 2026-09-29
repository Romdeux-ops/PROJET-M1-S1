import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme'

export function ThemeToggle() {
  const resolved = useTheme((s) => s.resolved)
  const toggle = useTheme((s) => s.toggle)
  const label = resolved === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={label} title={label}>
      {resolved === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
