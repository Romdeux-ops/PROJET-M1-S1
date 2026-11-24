import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect } from 'react'

import { splitNumeric, type NumericParts } from './numeric'
import { useAnimationsEnabled } from './use-animations-enabled'

interface AnimatedNumberProps {
  value: string | number
  className?: string
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const enabled = useAnimationsEnabled()
  const text = String(value)
  const parts = splitNumeric(text)

  if (!enabled || !parts) return <span className={className}>{text}</span>
  return <Counter parts={parts} text={text} className={className} />
}

function Counter({
  parts,
  text,
  className,
}: {
  parts: NumericParts
  text: string
  className?: string
}) {
  const progress = useMotionValue(0)
  const display = useTransform(
    progress,
    (p) => (parts.value * p).toFixed(parts.decimals) + parts.suffix,
  )

  useEffect(() => {
    const controls = animate(progress, 1, { duration: 0.9, ease: 'easeOut' })
    return () => controls.stop()
  }, [progress, parts.value])

  return (
    <>
      <span className="sr-only">{text}</span>
      <motion.span aria-hidden className={className}>
        {display}
      </motion.span>
    </>
  )
}
