import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface MagneticProps {
  children: ReactNode
  /** How strongly the button pulls toward the cursor (0–1). */
  strength?: number
  /** Invisible padding around the button that acts as the sensing area. */
  range?: number
  className?: string
  /**
   * If true, marks the inner element as a "shelter" that ambient boids
   * gravitate toward and hide behind. Boids scatter when the cursor
   * approaches (the existing cursor-flee force handles dispersion).
   */
  shelter?: boolean
  /**
   * Pulls sheltered boids deep into the chip so only the front of the
   * triangle pokes past the edge. Use for buttons where boids should
   * "barely peek their heads out" instead of forming a halo around it.
   */
  shelterTight?: boolean
  /** Optional "r, g, b" string applied to sheltered/nearby boids. */
  shelterColor?: string
}

/**
 * Wraps any element so it pulls toward the cursor when nearby.
 *
 * Pattern:
 *  - useMotionValue holds reactive numbers WITHOUT triggering re-renders
 *    (a normal useState here would re-render on every mousemove, ~60fps).
 *  - useSpring smooths those raw values into physical motion.
 *  - An invisible padded wrapper is the actual mousemove sensor; the inner
 *    motion.div is what visually translates. That's why the magnet "reaches"
 *    out past the button's visible bounds.
 */
export function Magnetic({
  children,
  strength = 0.35,
  range = 28,
  className,
  shelter = false,
  shelterTight = false,
  shelterColor,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })

  return (
    <div
      ref={ref}
      className={className}
      style={{ padding: range, margin: -range, display: 'inline-block' }}
      onMouseMove={(e) => {
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        x.set((e.clientX - cx) * strength)
        y.set((e.clientY - cy) * strength)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      <motion.div
        style={{ x: sx, y: sy, display: 'inline-block' }}
        {...(shelter ? { 'data-boid-shelter': '' } : {})}
        {...(shelter && shelterTight ? { 'data-boid-shelter-tight': '' } : {})}
        {...(shelter && shelterColor ? { 'data-boid-shelter-color': shelterColor } : {})}
      >
        {children}
      </motion.div>
    </div>
  )
}
