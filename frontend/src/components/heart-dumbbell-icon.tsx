import type { LucideIcon, LucideProps } from 'lucide-react'
import { forwardRef } from 'react'

import { cn } from '@/lib/utils'

/**
 * Logo FitMatch : un coeur barre d'une haltere. Lucide n'en propose pas ; ce
 * composant en reprend la grille (24x24, trait 2, bouts arrondis) pour
 * s'utiliser partout ou une `LucideIcon` est attendue (navigation, EmptyState).
 */
export const HeartDumbbell = forwardRef<SVGSVGElement, LucideProps>(function HeartDumbbell(
  { size = 24, strokeWidth = 2, color = 'currentColor', className, ...props },
  ref,
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('lucide lucide-heart-dumbbell', className)}
      aria-hidden="true"
      {...props}
    >
      {/* Coeur */}
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      {/* Haltere : barre et disques */}
      <path d="M8.5 11h7" />
      <path d="M7 9v4" />
      <path d="M17 9v4" />
      <path d="M5.5 10v2" />
      <path d="M18.5 10v2" />
    </svg>
  )
}) as unknown as LucideIcon
