import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'

import { splitNumeric, type NumericParts } from './numeric'
import { useAnimationsEnabled } from './use-animations-enabled'

interface AnimatedNumberProps {
  value: string | number
  className?: string
  /** Demarre le comptage quand l'element entre dans l'ecran (sections plus bas dans la page). */
  whenVisible?: boolean
}

export function AnimatedNumber({ value, className, whenVisible }: AnimatedNumberProps) {
  const enabled = useAnimationsEnabled()
  const text = String(value)
  const parts = splitNumeric(text)

  if (!enabled || !parts) return <span className={className}>{text}</span>
  return <Counter parts={parts} text={text} className={className} whenVisible={whenVisible} />
}

function Counter({
  parts,
  text,
  className,
  whenVisible,
}: {
  parts: NumericParts
  text: string
  className?: string
  whenVisible?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const visible = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const started = !whenVisible || visible
  const progress = useMotionValue(0)
  const display = useTransform(
    progress,
    (p) => (parts.value * p).toFixed(parts.decimals) + parts.suffix,
  )

  useEffect(() => {
    if (!started) return
    const controls = animate(progress, 1, { duration: 1.1, ease: 'easeOut' })
    return () => controls.stop()
  }, [progress, parts.value, started])

  return (
    <>
      <span className="sr-only">{text}</span>
      <motion.span ref={ref} aria-hidden className={className}>
        {display}
      </motion.span>
    </>
  )
}
