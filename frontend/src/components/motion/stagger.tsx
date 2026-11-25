import { motion, type HTMLMotionProps, type Variants } from 'motion/react'
import { createElement, type ComponentPropsWithoutRef } from 'react'

import { useAnimationsEnabled } from './use-animations-enabled'

type Tag = 'div' | 'ul' | 'li' | 'section'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
}

type StaggerProps<T extends Tag> = { as?: T } & ComponentPropsWithoutRef<T> & HTMLMotionProps<T>

/** Conteneur dont les StaggerItem apparaissent l'un apres l'autre. */
export function Stagger<T extends Tag = 'div'>({ as, ...props }: StaggerProps<T>) {
  const enabled = useAnimationsEnabled()
  const tag = as ?? 'div'
  if (!enabled) return createElement(tag, props as object)
  const Comp = motion[tag] as React.ElementType
  return <Comp variants={container} initial="hidden" animate="show" {...props} />
}

export function StaggerItem<T extends Tag = 'div'>({ as, ...props }: StaggerProps<T>) {
  const enabled = useAnimationsEnabled()
  const tag = as ?? 'div'
  if (!enabled) return createElement(tag, props as object)
  const Comp = motion[tag] as React.ElementType
  return <Comp variants={item} {...props} />
}
