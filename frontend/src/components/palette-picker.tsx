import { Check, Palette as PaletteIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PALETTES, useTheme } from '@/lib/theme'

export function PalettePicker() {
  const palette = useTheme((s) => s.palette)
  const setPalette = useTheme((s) => s.setPalette)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Changer la palette de couleurs">
          <PaletteIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Couleurs</DropdownMenuLabel>
        {PALETTES.map((p) => (
          <DropdownMenuItem key={p.id} onSelect={() => setPalette(p.id)} className="gap-3">
            <span className="size-4 rounded-full" style={{ background: p.swatch }} />
            <span className="flex-1">{p.label}</span>
            {palette === p.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
