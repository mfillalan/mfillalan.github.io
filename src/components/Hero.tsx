import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Magnetic } from './Magnetic'
import { boidShare } from '@/lib/boidShare'

// "variants" let a parent orchestrate child animations.
// The parent fires "show", children inherit it and stagger via staggerChildren.
const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-24"
    >
      {/* Animated radial gradient backdrop */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)_0%,_transparent_45%)] opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_70%,var(--color-background))]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container mx-auto max-w-5xl px-6 text-center"
      >
        <motion.div variants={item} className="flex justify-center mb-6">
          <div
            className="relative"
            data-boid-shelter
            data-boid-shelter-color="180, 140, 255"
          >
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary via-fuchsia-500/60 to-cyan-500/60 blur-md opacity-70" />
            <img
              src={`${import.meta.env.BASE_URL}profile-photo.jpeg`}
              alt="Michael Fillalan"
              className="relative size-24 rounded-full object-cover border-2 border-background"
            />
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur px-3 py-1 text-xs text-muted-foreground mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Available for new opportunities
        </motion.div>

        <motion.h1
          variants={item}
          className="text-balance font-display text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.95] tracking-tight"
        >
          Software that feels{' '}
          <em className="italic text-primary">
            <SeaweedPhysics />
            <Letter char="a" />
            <Letter char="l" />
            <Letter char="i" />
            <Letter char="v" />
            <Letter char="e" />.
          </em>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 mx-auto max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl"
        >
          I'm <span className="text-foreground font-medium">Michael Fillalan</span>, a software
          engineer with 14 years of production experience, now fully committed to AI-native
          development. I build systems that work, and interfaces that feel good using them.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex items-center justify-center gap-3">
          <Magnetic shelter shelterTight shelterColor="180, 140, 255">
            <Button asChild size="lg" className="rounded-full">
              <a href="#projects">
                <Sparkles className="size-4" />
                See my work
              </a>
            </Button>
          </Magnetic>
          <Magnetic shelter shelterTight shelterColor="200, 200, 220">
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <a href="#contact">Get in touch</a>
            </Button>
          </Magnetic>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-20 flex flex-col items-center gap-2 text-xs text-muted-foreground"
        >
          <span className="font-mono uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="size-4" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}

// Per-letter strand definitions. offsetX is the horizontal anchor as a
// fraction of the letter's box width (0 = left edge, 0.5 = center, 1 = right).
// Each letter of "alive" carries 1–2 strands at slightly varied positions so
// the seaweed reads as actually growing from the letterforms.
interface SeaweedDef {
  offsetX: number
  width: number
  length: number
  color: string
  opacity: number
}

const LETTER_STRANDS: Record<string, SeaweedDef[]> = {
  a: [
    { offsetX: 0.3, width: 1.8, length: 18, color: '60, 145, 95', opacity: 0.85 },
    { offsetX: 0.72, width: 1.4, length: 14, color: '80, 165, 110', opacity: 0.78 },
  ],
  l: [
    { offsetX: 0.5, width: 1.5, length: 17, color: '70, 155, 100', opacity: 0.82 },
  ],
  i: [
    { offsetX: 0.5, width: 1.2, length: 13, color: '85, 170, 110', opacity: 0.76 },
  ],
  v: [
    { offsetX: 0.32, width: 1.8, length: 16, color: '55, 150, 100', opacity: 0.82 },
    { offsetX: 0.68, width: 1.5, length: 20, color: '75, 165, 105', opacity: 0.78 },
  ],
  e: [
    { offsetX: 0.3, width: 1.8, length: 18, color: '60, 155, 100', opacity: 0.85 },
    { offsetX: 0.7, width: 2.1, length: 22, color: '50, 140, 90', opacity: 0.88 },
  ],
}

// ── Physics ────────────────────────────────────────────────────────────
// Each strand carries a `bend` value (-BEND_MAX..+BEND_MAX) that's evolved
// by a damped spring + per-frame noise + push from passing boids. The
// rendered SVG path is regenerated from the bend each frame.
interface PhysicsStrand {
  pathRef: { current: SVGPathElement | null }
  width: number
  length: number
  bend: number
  bendVel: number
  /** Per-strand bias for scroll-induced wobble. Random ±1 so neighboring
   *  strands lean different directions when the page scrolls — turbulence,
   *  not a synchronized salute. */
  scrollBias: number
}

const strandRegistry: PhysicsStrand[] = []
const SEAWEED_SPRING_K = 0.006
const SEAWEED_DAMP = 0.06
const SEAWEED_NOISE = 0.0018
const SEAWEED_BEND_MAX = 1.4
// Boids drag the strand sideways while passing within this perpendicular
// distance. The push is proportional to their horizontal velocity, so a
// fast fish tugs the blade harder than a slow one.
const BOID_RANGE_X = 22
const BOID_PUSH = 0.045
// Mouse drag is similar but mouse moves much faster than boids (50+ px
// per frame vs ~2 px), so the coefficient is an order of magnitude lower.
const MOUSE_RANGE_X = 32
const MOUSE_PUSH = 0.0035
// Scroll velocity (px/frame) is converted to a horizontal kick on each
// strand, signed by its scrollBias so the bed turbulates instead of all
// leaning the same way. Clamped to avoid huge spikes from trackpad bursts.
const SCROLL_PUSH = 0.0009
const SCROLL_VY_MAX = 60

// Closed leaf path. Anchor at (0,0), tip at (b * l * 0.4, l). The blade is
// widest at y = l/2 (about ±w). Quadratic curves on both sides give the
// natural taper. b = -1..+1 bends the entire blade sideways.
function leafPath(w: number, l: number, b: number): string {
  const wb = w * 0.3 * b
  const tipX = b * l * 0.4
  return [
    `M 0 0`,
    `Q ${w * 0.65 + wb} ${l * 0.22}, ${w + wb} ${l * 0.55}`,
    `Q ${w * 0.5 + tipX * 0.6} ${l * 0.85}, ${tipX} ${l}`,
    `Q ${-w * 0.5 + tipX * 0.6} ${l * 0.85}, ${-w + wb} ${l * 0.55}`,
    `Q ${-w * 0.65 + wb} ${l * 0.22}, 0 0`,
    'Z',
  ].join(' ')
}

function SeaweedStrand({ def }: { def: SeaweedDef }) {
  const pathRef = useRef<SVGPathElement | null>(null)
  useEffect(() => {
    const s: PhysicsStrand = {
      pathRef,
      width: def.width,
      length: def.length,
      bend: 0,
      bendVel: 0,
      scrollBias: (Math.random() - 0.5) * 2,
    }
    strandRegistry.push(s)
    return () => {
      const i = strandRegistry.indexOf(s)
      if (i >= 0) strandRegistry.splice(i, 1)
    }
  }, [def.width, def.length])

  // Pad horizontal bounds so a fully-bent tip never gets clipped.
  const halfW = def.width * 1.8 + def.length * 0.45 + 4
  return (
    <span
      className="absolute top-0 block"
      style={{ left: `${def.offsetX * 100}%`, transform: 'translateX(-50%)' }}
    >
      <svg
        width={halfW * 2}
        height={def.length + 4}
        viewBox={`${-halfW} 0 ${halfW * 2} ${def.length + 4}`}
        style={{ overflow: 'visible', display: 'block' }}
      >
        <path
          ref={pathRef}
          d={leafPath(def.width, def.length, 0)}
          fill={`rgba(${def.color}, ${def.opacity})`}
        />
      </svg>
    </span>
  )
}

function Letter({ char }: { char: string }) {
  const strands = LETTER_STRANDS[char.toLowerCase()] ?? []
  return (
    <span className="relative inline-block">
      {char}
      {strands.length > 0 && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[85%] block leading-none"
        >
          {strands.map((s, i) => (
            <SeaweedStrand key={i} def={s} />
          ))}
        </span>
      )}
    </span>
  )
}

// Single rAF tick that drives every registered strand's physics. Spring
// pulls bend toward 0; damping prevents runaway oscillation; noise gives
// the constant "in water" wiggle; boids dragging past push the bend in
// the direction of their horizontal motion. Path `d` is updated via
// setAttribute (not React state) so 60fps doesn't trigger re-renders.
function SeaweedPhysics() {
  useEffect(() => {
    // Mouse state: x/y are the latest position, prevX is read-and-reset
    // each tick so we get a clean per-frame velocity instead of one
    // accumulated across many mousemove events.
    const mouse = { x: -9999, y: -9999, prevX: -9999, active: false }
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (!mouse.active) mouse.prevX = mouse.x
      mouse.active = true
    }
    const onLeave = () => {
      mouse.active = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    let raf = 0
    let prevScrollY = window.scrollY
    const tick = () => {
      const boids = boidShare.current
      const mouseVx = mouse.active ? mouse.x - mouse.prevX : 0
      mouse.prevX = mouse.x

      // Per-frame scroll velocity. Clamp so a fast trackpad fling doesn't
      // launch the strands into the bend ceiling on a single frame.
      const rawScrollVy = window.scrollY - prevScrollY
      prevScrollY = window.scrollY
      const scrollVy = Math.max(-SCROLL_VY_MAX, Math.min(SCROLL_VY_MAX, rawScrollVy))

      for (const s of strandRegistry) {
        const path = s.pathRef.current
        if (!path) continue
        const svg = path.ownerSVGElement
        if (!svg) continue
        const r = svg.getBoundingClientRect()
        const anchorX = r.left + r.width / 2
        const anchorY = r.top

        // Boid drag: any fish whose vertical position falls inside the
        // strand's drop-zone and whose horizontal distance is within
        // BOID_RANGE_X contributes a force proportional to its vx.
        let externalForce = 0
        for (const b of boids) {
          const dy = b.y - anchorY
          if (dy < -8 || dy > s.length + 8) continue
          const dx = b.x - anchorX
          if (dx < -BOID_RANGE_X || dx > BOID_RANGE_X) continue
          const closeness = 1 - Math.abs(dx) / BOID_RANGE_X
          externalForce += b.vx * BOID_PUSH * closeness
        }

        // Scroll wobble: vertical scroll converts into a horizontal kick
        // signed by this strand's per-strand scrollBias, so the bed
        // turbulates rather than swinging in unison.
        if (scrollVy !== 0) {
          externalForce += scrollVy * SCROLL_PUSH * s.scrollBias
        }

        // Mouse drag: same model. Mouse moving past a strand drags the
        // blade in the direction of motion, scaled by closeness.
        if (mouse.active && mouseVx !== 0) {
          const dy = mouse.y - anchorY
          if (dy >= -8 && dy <= s.length + 8) {
            const dx = mouse.x - anchorX
            if (dx >= -MOUSE_RANGE_X && dx <= MOUSE_RANGE_X) {
              const closeness = 1 - Math.abs(dx) / MOUSE_RANGE_X
              externalForce += mouseVx * MOUSE_PUSH * closeness
            }
          }
        }

        const springForce = -SEAWEED_SPRING_K * s.bend
        const dampForce = -SEAWEED_DAMP * s.bendVel
        const noise = (Math.random() - 0.5) * SEAWEED_NOISE
        s.bendVel += springForce + dampForce + noise + externalForce
        s.bend += s.bendVel
        if (s.bend > SEAWEED_BEND_MAX) {
          s.bend = SEAWEED_BEND_MAX
          s.bendVel *= -0.3
        } else if (s.bend < -SEAWEED_BEND_MAX) {
          s.bend = -SEAWEED_BEND_MAX
          s.bendVel *= -0.3
        }
        path.setAttribute('d', leafPath(s.width, s.length, s.bend))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])
  return null
}
