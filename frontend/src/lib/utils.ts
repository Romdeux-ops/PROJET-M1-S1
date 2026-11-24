import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// `shadow-soft` est une ombre (utilitaire du design system), pas une couleur d'ombre :
// sans cette declaration, tailwind-merge le confond avec `shadow-primary/20` et le supprime.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { shadow: [{ shadow: ['soft'] }] } },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
