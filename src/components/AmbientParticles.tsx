import { useEffect, useRef } from 'react'
import { boidShare } from '@/lib/boidShare'

/**
 * Boids flocking field.
 *
 * Each boid follows three classic Reynolds rules against its local neighbors:
 *  - separation: steer away from boids that are too close (avoid collision)
 *  - alignment:  steer toward the average heading of nearby boids
 *  - cohesion:   steer toward the average position of nearby boids
 *
 * The cursor acts as a predator: boids within the flee radius steer hard
 * away from it, producing a "parting of the school" effect.
 *
 * Canvas, not DOM, because hundreds of moving sprites at 60fps are exactly
 * what canvas was made for; React would re-render itself out of memory.
 */

interface Boid {
  x: number
  y: number
  vx: number
  vy: number
  /** Smoothed heading. Avoids jittery flips when velocity is near zero. */
  angle: number
  /** Element of the shelter this boid has claimed, or null when roaming. */
  shelter: HTMLElement | null
  /** Angle around the claimed shelter's center where this boid rests. */
  shelterAngle: number
  /** Sine phase for the in/out peek oscillation while sheltered. */
  peekPhase: number
  /** Frames during which a recently-dispersed boid won't re-shelter. */
  cooldown: number
  /** Wander direction around the shelter while feeling brave. */
  wanderAngle: number
  /** Wander distance from shelter center, drifts with the angle. */
  wanderRadius: number
  /** Sustained orbit speed around the shelter (rad/frame), signed. Drifts
   *  slowly and occasionally reverses, so wander reads as committed swim
   *  direction instead of random twitching. */
  wanderTurnRate: number
  /** Element this boid is committed to orbit, or null. Capped per element so
   *  the Konami easter egg doesn't suck in the entire flock. */
  orbit: HTMLElement | null
}

const COUNT = 135
const PERCEIVE = 55
const SEPARATE = 22
const FLEE_RADIUS = 130
const MAX_SPEED = 1.8
const MAX_FORCE = 0.045
// Always-alive floor: every boid keeps drifting. Without this, shelter
// boids would dampen to a halt and look dead.
const MIN_SPEED = 0.55

// Shelters: DOM elements with [data-boid-shelter] attract nearby boids.
// Boids slow down once they reach the rest band so they cluster instead
// of orbiting. The cursor's flee force naturally disperses them.
// Optional [data-boid-shelter-color="r, g, b"] tints boids that get close,
// so e.g. the shadcn chip glows white-gray and the Tailwind chip cyan.
const SHELTER_REACH = 230
const W_SHELTER = 0.7
// Personality knobs: shelters host a small number of "tenant" boids that
// peek out, hide when the cursor approaches, and burst out when clicked.
const SHELTER_CAPACITY = 3
// Default rest position is just outside the chip edge in the boid's assigned
// direction. Per-element overrides via data-boid-shelter-rest (number, px).
// Tight shelters (data-boid-shelter-tight) tuck the boid INTO the chip so
// only the front of the triangle peeks past the edge.
const SHELTER_REST_PAD = 4
const SHELTER_REST_PAD_TIGHT = -3
const SHELTER_PEEK_AMP = 5
const SHELTER_PEEK_AMP_TIGHT = 2.5
const SHELTER_PEEK_SPEED = 0.045
// Cursor distance below which sheltered boids fully retract behind the chip.
const SHELTER_HIDE_DIST = 170
// Cursor distance above which sheltered boids feel safe enough to leave the
// chip and wander calmly nearby. Between HIDE and SAFE they lerp smoothly,
// so the boid's "bravery" reads as a continuous reaction to your cursor.
const SHELTER_SAFE_DIST = 360
// Wander orbit bounds — the boid's casual exploration stays within this
// ring around the shelter while brave. Min is just past the visible peek
// position; max is far enough that boids look like they're truly out and
// about, not just hovering at the rim.
const SHELTER_WANDER_MIN = 35
const SHELTER_WANDER_MAX = 95
// Sustained orbit speed range (rad/frame). The boid's wanderTurnRate is
// initialized in this band with a random sign so each fish picks its own
// pace and direction, then drifts slowly. Calm = small numbers.
const SHELTER_WANDER_RATE_MIN = 0.005
const SHELTER_WANDER_RATE_MAX = 0.018
// Per-frame drift of the orbit rate. Small enough to feel committed.
const SHELTER_WANDER_RATE_DRIFT = 0.0005
// Probability per frame of reversing direction. ~once every 6 seconds.
const SHELTER_WANDER_REVERSE = 0.0028
// Per-frame drift of the orbit radius. Small so fish hold their distance.
const SHELTER_WANDER_RADIUS_DRIFT = 0.18
// Spring drives sheltered boids toward their rest position; damping keeps
// them from oscillating into orbit. K * 4 ≈ critical damping squared, so
// D set near 2*sqrt(K) gives smooth settle with no overshoot. Tuned so
// arrival from any incoming velocity reads as "swims in, peeks out."
const SHELTER_SPRING_K = 0.05
const SHELTER_SPRING_D = 0.45
// Movement (px/frame) above which a shelter is considered "scrolling," so
// occupants forcibly hide and re-emerge once motion stops. Anything below
// is treated as static for peek purposes.
const SHELTER_SCROLL_HIDE = 8
// Outward speed on click-disperse, plus the frames a dispersed boid waits
// before it can re-claim a shelter (so they actually scatter).
const SHELTER_BURST_SPEED = 4.8
const SHELTER_COOLDOWN = 130

// Orbital shelters: [data-boid-orbit] pulls boids into a constantly-moving
// ring around the element. Physics model: a radial spring keeps them on the
// ring while a tangential velocity setpoint keeps every orbiter moving at the
// SAME angular speed. Same angular speed = same relative spacing forever, so
// boids that arrive at different angles stay spread out organically instead
// of bunching at one or two spots.
const ORBIT_REACH = 220
const ORBIT_RADIUS = 62
const ORBIT_RADIAL_K = 0.025
const ORBIT_TANGENT_K = 0.09
// Cap on how many boids a single orbit element can hold. Anything beyond
// this just swims past instead of getting recruited into the ring.
const ORBIT_CAPACITY = 15

// Behavior weights (tuning knobs).
const W_SEPARATION = 1.4
const W_ALIGNMENT = 0.95
const W_COHESION = 0.85
const W_FLEE = 2.6

export default function AmbientParticles() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const mouse = { x: -9999, y: -9999, active: false }
    let boids: Boid[] = []
    let raf = 0

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    const seed = () => {
      boids = Array.from({ length: COUNT }, () => {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.5 + Math.random() * 1.0
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          angle,
          shelter: null,
          shelterAngle: 0,
          peekPhase: Math.random() * Math.PI * 2,
          cooldown: 0,
          wanderAngle: 0,
          wanderRadius: 0,
          wanderTurnRate: 0,
          orbit: null,
        }
      })
    }

    const onResize = () => {
      // Mobile browsers (esp. Android Chrome) fire `resize` on every URL bar
      // show/hide during scroll. Reseeding on those events would teleport the
      // entire flock on every scroll. So: just resize the canvas; leave boids
      // alone. Any boids now outside the new bounds will wrap on the next
      // tick, so no visible glitch.
      resize()
    }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    }
    const onLeave = () => {
      mouse.active = false
    }

    // Click-to-disperse: walk up from the click target to find a shelter.
    // Set a flag the tick loop will consume to apply burst impulses to all
    // current occupants. WeakMap so we don't pin removed elements in memory.
    const shelterBurst = new WeakMap<HTMLElement, true>()
    // Per-shelter previous-frame center, used to compute per-frame movement.
    // Sheltered boids translate by this delta so they stay glued to the
    // shelter through scroll, magnetic pull, and layout shifts.
    const prevShelterPos = new WeakMap<HTMLElement, { x: number; y: number }>()
    const onClick = (e: MouseEvent) => {
      let el = e.target as HTMLElement | null
      while (el && el !== document.body) {
        if (el.matches?.('[data-boid-shelter]')) {
          shelterBurst.set(el, true)
          return
        }
        el = el.parentElement
      }
    }

    const limit = (vx: number, vy: number, max: number) => {
      const speed = Math.hypot(vx, vy)
      if (speed > max) {
        return [(vx / speed) * max, (vy / speed) * max]
      }
      return [vx, vy]
    }

    const isDark = () => document.documentElement.classList.contains('dark')

    const tick = () => {
      // Pause when the tab is hidden (battery / CPU) and when something on
      // the page (e.g. an opening modal) sets the pause flag. The Projects
      // dialog uses this so the layoutId morph isn't competing with 18k+
      // neighbor checks per frame and noticeably stuttering.
      if (document.hidden || document.documentElement.dataset.boidsPaused === '1') {
        raf = requestAnimationFrame(tick)
        return
      }

      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      const fill = isDark() ? 'rgba(200, 210, 240, 0.7)' : 'rgba(40, 50, 90, 0.65)'
      const fleeFill = isDark() ? 'rgba(180, 160, 255, 0.95)' : 'rgba(110, 80, 230, 0.9)'

      // Snapshot active shelters this frame. Cheap for a handful of elements
      // and ensures positions track through scroll, magnetic pull, layout shifts.
      const shelterEls = document.querySelectorAll<HTMLElement>('[data-boid-shelter]')
      const shelters: Array<{
        el: HTMLElement
        x: number
        y: number
        rx: number
        ry: number
        dx: number
        dy: number
        pad: number
        peekAmp: number
        color?: string
      }> = []
      const shelterByEl = new Map<HTMLElement, (typeof shelters)[number]>()
      shelterEls.forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.bottom < 0 || r.top > h || r.right < 0 || r.left > w) return
        // data-boid-shelter-tight makes boids tuck deep into the chip and
        // only peek their heads past the edge. Per-element pad/peek can
        // also be set explicitly via data attrs for one-off tuning.
        const tight = el.hasAttribute('data-boid-shelter-tight')
        const padAttr = Number(el.dataset.boidShelterRest)
        const ampAttr = Number(el.dataset.boidShelterPeek)
        const pad = Number.isFinite(padAttr)
          ? padAttr
          : tight
            ? SHELTER_REST_PAD_TIGHT
            : SHELTER_REST_PAD
        const peekAmp = Number.isFinite(ampAttr)
          ? ampAttr
          : tight
            ? SHELTER_PEEK_AMP_TIGHT
            : SHELTER_PEEK_AMP
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const prev = prevShelterPos.get(el)
        const dx = prev ? cx - prev.x : 0
        const dy = prev ? cy - prev.y : 0
        prevShelterPos.set(el, { x: cx, y: cy })
        const s = {
          el,
          x: cx,
          y: cy,
          rx: r.width / 2,
          ry: r.height / 2,
          dx,
          dy,
          pad,
          peekAmp,
          color: el.dataset.boidShelterColor,
        }
        shelters.push(s)
        shelterByEl.set(el, s)
      })

      // Consume click-disperse flags: any boid sheltered at a clicked element
      // gets an outward impulse along its assigned angle and a recovery
      // cooldown so it actually scatters instead of immediately reattaching.
      shelterEls.forEach((el) => {
        if (!shelterBurst.has(el)) return
        for (const b of boids) {
          if (b.shelter !== el) continue
          const jitter = (Math.random() - 0.5) * 0.6
          b.vx = Math.cos(b.shelterAngle) * (SHELTER_BURST_SPEED + jitter)
          b.vy = Math.sin(b.shelterAngle) * (SHELTER_BURST_SPEED + jitter)
          b.shelter = null
          b.cooldown = SHELTER_COOLDOWN
        }
        shelterBurst.delete(el)
      })

      // Tally current occupants per shelter, used downstream to enforce
      // capacity when roaming boids try to claim a slot. Also drop stale
      // claims (shelter scrolled out of viewport or removed from DOM).
      const occupantCount = new Map<HTMLElement, number>()
      for (const b of boids) {
        if (!b.shelter) continue
        if (!shelterByEl.has(b.shelter)) {
          b.shelter = null
          b.cooldown = 30
          continue
        }
        occupantCount.set(b.shelter, (occupantCount.get(b.shelter) ?? 0) + 1)
      }

      // Each orbit element can specify its own color + radius via data attrs:
      //   data-boid-orbit-color="r, g, b"  (default green Konami palette)
      //   data-boid-orbit-radius="78"      (default ORBIT_RADIUS)
      const orbitEls = document.querySelectorAll<HTMLElement>('[data-boid-orbit]')
      const orbits: Array<{ el: HTMLElement; x: number; y: number; radius: number; color: string }> = []
      const orbitByEl = new Map<HTMLElement, (typeof orbits)[number]>()
      orbitEls.forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.bottom < 0 || r.top > h || r.right < 0 || r.left > w) return
        const color = el.dataset.boidOrbitColor ?? '80, 255, 140'
        const radius = Number(el.dataset.boidOrbitRadius) || ORBIT_RADIUS
        const o = { el, x: r.left + r.width / 2, y: r.top + r.height / 2, radius, color }
        orbits.push(o)
        orbitByEl.set(el, o)
      })

      // Tally orbit occupants and drop stale claims (element scrolled out
      // of viewport). Used downstream to enforce ORBIT_CAPACITY.
      const orbitOccupantCount = new Map<HTMLElement, number>()
      for (const b of boids) {
        if (!b.orbit) continue
        if (!orbitByEl.has(b.orbit)) {
          b.orbit = null
          continue
        }
        orbitOccupantCount.set(b.orbit, (orbitOccupantCount.get(b.orbit) ?? 0) + 1)
      }

      // Compute new accelerations from neighbor interactions
      const next: Array<{
        ax: number
        ay: number
        alarm: number
        orbiting: number
        orbitColor: string
        shelterTint?: string
        shelterTintProx: number
        sheltered: boolean
      }> = []
      for (let i = 0; i < boids.length; i++) {
        const b = boids[i]

        if (b.cooldown > 0) b.cooldown--

        // ── SHELTERED PATH ─────────────────────────────────────────
        // Tenants ignore flocking & flee forces and instead lerp between
        // two targets based on how brave they feel:
        //   bravery 0 → hide just inside the chip, only heads peek out
        //   bravery 1 → wander calmly around the shelter on a slow random walk
        // Bravery is driven by cursor distance, with scroll/layout movement
        // forcing them back into hiding. Spring pulls the boid toward the
        // lerped target; critical damping settles motion smoothly.
        if (b.shelter) {
          const s = shelterByEl.get(b.shelter)!
          // Translate the boid by however much the shelter moved this frame
          // (scroll, magnetic pull, layout shift). This keeps them perfectly
          // glued instead of being chased by the spring with a visible lag.
          b.x += s.dx
          b.y += s.dy

          // Cursor → bravery. No cursor on page = full bravery.
          const cursorDist = mouse.active
            ? Math.hypot(mouse.x - s.x, mouse.y - s.y)
            : Infinity
          let bravery = Math.max(
            0,
            Math.min(1, (cursorDist - SHELTER_HIDE_DIST) / (SHELTER_SAFE_DIST - SHELTER_HIDE_DIST)),
          )
          // Scroll/movement → tuck back in. Bravery drops proportionally
          // to how fast the shelter is being moved this frame.
          const movement = Math.hypot(s.dx, s.dy)
          if (movement > 0) {
            bravery = Math.min(bravery, 1 - Math.min(1, movement / SHELTER_SCROLL_HIDE))
          }

          // Hide target: just inside the chip's elliptical boundary in the
          // boid's assigned direction, with peek oscillation so heads bob.
          // Ellipse boundary: r(θ) = rx*ry / √((ry cosθ)² + (rx sinθ)²)
          b.peekPhase += SHELTER_PEEK_SPEED
          const peek = s.peekAmp * Math.sin(b.peekPhase)
          const cosA = Math.cos(b.shelterAngle)
          const sinA = Math.sin(b.shelterAngle)
          const denom = Math.sqrt((s.ry * cosA) ** 2 + (s.rx * sinA) ** 2) || 1
          const ellipseR = (s.rx * s.ry) / denom
          const hideR = ellipseR + s.pad + peek
          const hideX = s.x + hideR * cosA
          const hideY = s.y + hideR * sinA

          // Wander target: each fish has a sustained orbit speed that drifts
          // slowly and very rarely reverses, so the spring tracks a continuous
          // arc around the shelter — calm directional swimming, not jitter.
          if (bravery > 0.05) {
            b.wanderTurnRate += (Math.random() - 0.5) * SHELTER_WANDER_RATE_DRIFT
            if (Math.random() < SHELTER_WANDER_REVERSE) b.wanderTurnRate *= -1
            // Keep speed within calm range, preserving sign.
            const sign = b.wanderTurnRate < 0 ? -1 : 1
            const mag = Math.abs(b.wanderTurnRate)
            const clampedMag = Math.max(SHELTER_WANDER_RATE_MIN, Math.min(SHELTER_WANDER_RATE_MAX, mag))
            b.wanderTurnRate = sign * clampedMag
            b.wanderAngle += b.wanderTurnRate
            b.wanderRadius += (Math.random() - 0.5) * SHELTER_WANDER_RADIUS_DRIFT
            if (b.wanderRadius < SHELTER_WANDER_MIN) b.wanderRadius = SHELTER_WANDER_MIN
            else if (b.wanderRadius > SHELTER_WANDER_MAX) b.wanderRadius = SHELTER_WANDER_MAX
          }
          const wanderX = s.x + b.wanderRadius * Math.cos(b.wanderAngle)
          const wanderY = s.y + b.wanderRadius * Math.sin(b.wanderAngle)

          // Lerp targets by bravery.
          const targetX = hideX + (wanderX - hideX) * bravery
          const targetY = hideY + (wanderY - hideY) * bravery
          const ax = (targetX - b.x) * SHELTER_SPRING_K - b.vx * SHELTER_SPRING_D
          const ay = (targetY - b.y) * SHELTER_SPRING_K - b.vy * SHELTER_SPRING_D
          next.push({
            ax,
            ay,
            alarm: 0,
            orbiting: 0,
            orbitColor: '80, 255, 140',
            shelterTint: s.color,
            // Glow strongest while hiding (focal eye-catcher), softer
            // while wandering (subtle hint of belonging).
            shelterTintProx: s.color ? 0.6 + (1 - bravery) * 0.4 : 0,
            sheltered: true,
          })
          continue
        }

        // Orbital influence first; orbiting boids skip cohesion (otherwise
        // the ring collapses into a knot). Two forces:
        //   - Radial spring drives them onto the orbit ring.
        //   - Tangential setpoint forces every orbiter to share the SAME
        //     angular speed → constant relative spacing forever.
        let orbiting = 0
        let orbitColor = '80, 255, 140'
        let orbitAx = 0
        let orbitAy = 0
        // Pick which orbit element this boid uses this frame:
        //   - if already committed, stick to that one
        //   - otherwise look for the nearest in-range orbit with a free slot
        let activeOrbit: (typeof orbits)[number] | null = null
        if (b.orbit) {
          activeOrbit = orbitByEl.get(b.orbit) ?? null
        } else if (orbits.length > 0) {
          let bestD = Infinity
          for (const o of orbits) {
            if ((orbitOccupantCount.get(o.el) ?? 0) >= ORBIT_CAPACITY) continue
            const dx = o.x - b.x
            const dy = o.y - b.y
            const d = Math.hypot(dx, dy)
            if (d < bestD && d < ORBIT_REACH) {
              bestD = d
              activeOrbit = o
            }
          }
          if (activeOrbit) {
            // Claim the slot so subsequent boids see updated capacity.
            b.orbit = activeOrbit.el
            orbitOccupantCount.set(
              activeOrbit.el,
              (orbitOccupantCount.get(activeOrbit.el) ?? 0) + 1,
            )
          }
        }
        if (activeOrbit) {
          const dx = activeOrbit.x - b.x
          const dy = activeOrbit.y - b.y
          const oD = Math.hypot(dx, dy)
          if (oD < ORBIT_REACH && oD > 0.5) {
            const oR = activeOrbit.radius
            // Unit vector from boid → orbit center
            const rdx = dx / oD
            const rdy = dy / oD
            // Tangent (counterclockwise) is radial rotated 90° CCW
            const tdx = -rdy
            const tdy = rdx
            // Radial: error positive when too far from center, pulls inward
            const radialErr = oD - oR
            orbitAx += rdx * radialErr * ORBIT_RADIAL_K
            orbitAy += rdy * radialErr * ORBIT_RADIAL_K
            // Tangent: drive current tangent-velocity component toward
            // MAX_SPEED. Boids at any angle end up sharing the same
            // angular velocity, which preserves spacing.
            const currentTangent = b.vx * tdx + b.vy * tdy
            const tangentDelta = MAX_SPEED - currentTangent
            orbitAx += tdx * tangentDelta * ORBIT_TANGENT_K
            orbitAy += tdy * tangentDelta * ORBIT_TANGENT_K
            orbiting = Math.max(0, 1 - oD / ORBIT_REACH)
            orbitColor = activeOrbit.color
          }
        }

        let sepX = 0, sepY = 0, sepN = 0
        let aliX = 0, aliY = 0, aliN = 0
        let cohX = 0, cohY = 0, cohN = 0

        for (let j = 0; j < boids.length; j++) {
          if (i === j) continue
          const o = boids[j]
          const dx = o.x - b.x
          const dy = o.y - b.y
          const d = Math.hypot(dx, dy)
          if (d > 0 && d < PERCEIVE) {
            // Alignment & cohesion use all perceived neighbors
            aliX += o.vx; aliY += o.vy; aliN++
            cohX += o.x; cohY += o.y; cohN++
            // Separation: weighted away from very close ones
            if (d < SEPARATE) {
              sepX -= dx / d
              sepY -= dy / d
              sepN++
            }
          }
        }

        let ax = orbitAx
        let ay = orbitAy

        // When fully orbiting, suppress cohesion (it would pull the ring
        // into a knot) and dampen alignment a touch. Separation stays full.
        const cohScale = 1 - orbiting
        const aliScale = 1 - orbiting * 0.5

        if (sepN > 0) {
          let [vx, vy] = [sepX / sepN, sepY / sepN]
          ;[vx, vy] = limit(vx * MAX_SPEED, vy * MAX_SPEED, MAX_SPEED)
          const fx = vx - b.vx
          const fy = vy - b.vy
          const [lx, ly] = limit(fx, fy, MAX_FORCE)
          ax += lx * W_SEPARATION
          ay += ly * W_SEPARATION
        }
        if (aliN > 0) {
          let vx = aliX / aliN
          let vy = aliY / aliN
          ;[vx, vy] = limit(vx, vy, MAX_SPEED)
          const fx = vx - b.vx
          const fy = vy - b.vy
          const [lx, ly] = limit(fx, fy, MAX_FORCE)
          ax += lx * W_ALIGNMENT * aliScale
          ay += ly * W_ALIGNMENT * aliScale
        }
        if (cohN > 0) {
          const cx = cohX / cohN
          const cy = cohY / cohN
          let vx = cx - b.x
          let vy = cy - b.y
          ;[vx, vy] = limit(vx, vy, MAX_SPEED)
          const fx = vx - b.vx
          const fy = vy - b.vy
          const [lx, ly] = limit(fx, fy, MAX_FORCE)
          ax += lx * W_COHESION * cohScale
          ay += ly * W_COHESION * cohScale
        }

        // Shelter attraction: soft pull toward the nearest in-viewport
        // shelter that still has an open slot. Once close enough, the boid
        // claims a slot and switches to the sheltered path next frame.
        // Boids on cooldown (just dispersed) skip this entirely.
        if (shelters.length > 0 && b.cooldown === 0) {
          let nearestS: (typeof shelters)[number] | null = null
          let nearestD = Infinity
          for (const s of shelters) {
            if ((occupantCount.get(s.el) ?? 0) >= SHELTER_CAPACITY) continue
            const dx = s.x - b.x
            const dy = s.y - b.y
            const d = Math.hypot(dx, dy)
            if (d < nearestD) {
              nearestD = d
              nearestS = s
            }
          }
          if (nearestS && nearestD < SHELTER_REACH) {
            const dx = nearestS.x - b.x
            const dy = nearestS.y - b.y
            // Pull stays active all the way to the center so the boid
            // genuinely swims into the chip rather than getting yanked by
            // the spring at the rim. Pull falls off linearly so motion
            // reads as a steady cruise, not an acceleration ramp.
            if (nearestD > 4) {
              const desiredX = (dx / nearestD) * MAX_SPEED
              const desiredY = (dy / nearestD) * MAX_SPEED
              const fx = desiredX - b.vx
              const fy = desiredY - b.vy
              const [lx, ly] = limit(fx, fy, MAX_FORCE)
              const pull = 1 - nearestD / SHELTER_REACH
              ax += lx * W_SHELTER * pull
              ay += ly * W_SHELTER * pull
            }
            // Roaming boids stay neutral. Color is reserved for actual
            // tenants of the shelter, so the tint cleanly signals "this
            // boid has joined this thing" instead of leaking onto every
            // boid that happens to drift through the proximity radius.
            // Claim only after the boid has actually swum into the chip.
            // The spring will then ease it out to its rest position with
            // critical damping, so the transition reads as "swims into
            // shelter, peeks out" rather than the previous teleport-to-rim.
            if (nearestD < 14) {
              const claimed = occupantCount.get(nearestS.el) ?? 0
              if (claimed < SHELTER_CAPACITY) {
                b.shelter = nearestS.el
                b.peekPhase = Math.random() * Math.PI * 2
                // Snap angle to the side the boid arrived from so it
                // surfaces back where it came in.
                b.shelterAngle = Math.atan2(b.y - nearestS.y, b.x - nearestS.x)
                // Seed wander state from where the boid claimed, so its
                // first brave drift starts from the natural exit angle
                // rather than teleporting to a random orbit slot.
                b.wanderAngle = b.shelterAngle
                b.wanderRadius = SHELTER_WANDER_MIN + Math.random() * (SHELTER_WANDER_MAX - SHELTER_WANDER_MIN)
                // Random orbit direction + speed → per-fish personality.
                b.wanderTurnRate =
                  (Math.random() < 0.5 ? -1 : 1) *
                  (SHELTER_WANDER_RATE_MIN + Math.random() * (SHELTER_WANDER_RATE_MAX - SHELTER_WANDER_RATE_MIN))
                occupantCount.set(nearestS.el, claimed + 1)
              }
            }
          }
        }

        // Predator flee: strong steer away from cursor.
        let alarm = 0
        if (mouse.active) {
          const dx = b.x - mouse.x
          const dy = b.y - mouse.y
          const d = Math.hypot(dx, dy)
          if (d < FLEE_RADIUS && d > 0) {
            const closeness = 1 - d / FLEE_RADIUS
            alarm = closeness
            const desiredX = (dx / d) * MAX_SPEED
            const desiredY = (dy / d) * MAX_SPEED
            const fx = desiredX - b.vx
            const fy = desiredY - b.vy
            const [lx, ly] = limit(fx, fy, MAX_FORCE * 4)
            ax += lx * W_FLEE * closeness
            ay += ly * W_FLEE * closeness
          }
        }

        next.push({ ax, ay, alarm, orbiting, orbitColor, shelterTint: undefined, shelterTintProx: 0, sheltered: false })
      }

      // Integrate physics + update headings (no drawing here so we can render
      // the same simulation onto multiple canvases below).
      for (let i = 0; i < boids.length; i++) {
        const b = boids[i]
        const n = next[i]
        b.vx += n.ax
        b.vy += n.ay
        ;[b.vx, b.vy] = limit(b.vx, b.vy, MAX_SPEED)

        // Always-alive: enforce a minimum speed. Without this, boids that
        // escape all forces near zero just float in place looking dead.
        // Sheltered boids opt out — their spring needs to settle to rest.
        const liveSpd = Math.hypot(b.vx, b.vy)
        if (!n.sheltered && liveSpd < MIN_SPEED) {
          if (liveSpd < 0.001) {
            const a = Math.random() * Math.PI * 2
            b.vx = Math.cos(a) * MIN_SPEED
            b.vy = Math.sin(a) * MIN_SPEED
          } else {
            const scale = MIN_SPEED / liveSpd
            b.vx *= scale
            b.vy *= scale
          }
        }

        b.x += b.vx
        b.y += b.vy

        // Don't wrap sheltered boids — they're glued to a chip's local
        // coordinate system and would teleport on edge cases.
        if (!n.sheltered && n.orbiting < 0.05) {
          if (b.x < -10) b.x = w + 10
          else if (b.x > w + 10) b.x = -10
          if (b.y < -10) b.y = h + 10
          else if (b.y > h + 10) b.y = -10
        }

        // Update heading with shortest-arc interpolation. Atan2 is unstable
        // near zero velocity, so only retarget when moving meaningfully.
        // Sheltered boids face outward (away from chip) so peeking reads as
        // "popping head out" instead of "drifting sideways past the chip."
        if (n.sheltered) {
          // While moving (wandering or transitioning) face the actual motion
          // direction; while stationary at a hide position face outward from
          // the shelter so the head reads as "peeking" rather than drifting.
          const speed = Math.hypot(b.vx, b.vy)
          const target = speed > 0.35 ? Math.atan2(b.vy, b.vx) : boids[i].shelterAngle
          let diff = target - b.angle
          while (diff > Math.PI) diff -= Math.PI * 2
          while (diff < -Math.PI) diff += Math.PI * 2
          b.angle += diff * 0.15
        } else {
          const speed = Math.hypot(b.vx, b.vy)
          if (speed > 0.18) {
            const target = Math.atan2(b.vy, b.vx)
            let diff = target - b.angle
            while (diff > Math.PI) diff -= Math.PI * 2
            while (diff < -Math.PI) diff += Math.PI * 2
            b.angle += diff * 0.18
          }
        }
      }

      // Per-boid draw. Position is in screen coordinates; pass an offset to
      // render into a card-local canvas's coordinate system.
      const drawBoid = (
        targetCtx: CanvasRenderingContext2D,
        b: Boid,
        n: (typeof next)[number],
        offsetX: number,
        offsetY: number,
      ) => {
        const size = 4 + n.alarm * 1.5
        targetCtx.save()
        targetCtx.translate(b.x - offsetX, b.y - offsetY)
        targetCtx.rotate(b.angle)
        if (n.orbiting > 0.15) {
          targetCtx.shadowColor = `rgba(${n.orbitColor}, 0.95)`
          targetCtx.shadowBlur = 8 + n.orbiting * 8
          targetCtx.fillStyle = `rgba(${n.orbitColor}, ${0.55 + n.orbiting * 0.4})`
        } else if (n.alarm > 0.05) {
          targetCtx.fillStyle = fleeFill
        } else if (n.shelterTint && n.shelterTintProx > 0.05) {
          targetCtx.shadowColor = `rgba(${n.shelterTint}, 0.9)`
          targetCtx.shadowBlur = 4 + n.shelterTintProx * 6
          targetCtx.fillStyle = `rgba(${n.shelterTint}, ${0.6 + n.shelterTintProx * 0.35})`
        } else {
          targetCtx.fillStyle = fill
        }
        // Fish silhouette: rounded teardrop body with a forked tail. One
        // continuous path, single fill. Oriented along +x axis (head at
        // +x, tail at -x), then rotated to match heading.
        targetCtx.beginPath()
        targetCtx.moveTo(size * 1.0, 0) // nose
        targetCtx.quadraticCurveTo(size * 0.5, size * 0.4, -size * 0.4, size * 0.28) // top body
        targetCtx.lineTo(-size * 1.15, size * 0.55) // upper tail tip
        targetCtx.lineTo(-size * 0.75, 0) // tail notch
        targetCtx.lineTo(-size * 1.15, -size * 0.55) // lower tail tip
        targetCtx.lineTo(-size * 0.4, -size * 0.28) // bottom body
        targetCtx.quadraticCurveTo(size * 0.5, -size * 0.4, size * 1.0, 0) // back to nose
        targetCtx.closePath()
        targetCtx.fill()
        targetCtx.restore()
      }

      // 1) Background canvas, full viewport, behind everything. Boids inside
      //    opaque cards are hidden by those cards' bg-card.
      for (let i = 0; i < boids.length; i++) {
        drawBoid(ctx, boids[i], next[i], 0, 0)
      }

      // 2) Per-card mirror canvases. Same simulation, but rendered INSIDE
      //    each marked card's stacking context, so chips sitting at higher
      //    z-index inside the card hide the boids passing behind them. This
      //    is what makes boids visually "fly above the card": the card body
      //    is below the local canvas, but card content is above it.
      const mirrors = document.querySelectorAll<HTMLCanvasElement>('canvas[data-boid-mirror]')
      mirrors.forEach((mc) => {
        const r = mc.getBoundingClientRect()
        if (r.bottom < 0 || r.top > h || r.right < 0 || r.left > w) return
        const mctx = mc.getContext('2d')
        if (!mctx) return
        // Resize on demand (reflows, theme switches, etc.)
        const cssW = Math.round(r.width)
        const cssH = Math.round(r.height)
        const targetW = cssW * dpr
        const targetH = cssH * dpr
        if (mc.width !== targetW || mc.height !== targetH) {
          mc.width = targetW
          mc.height = targetH
          mctx.setTransform(1, 0, 0, 1, 0, 0)
          mctx.scale(dpr, dpr)
        }
        mctx.clearRect(0, 0, cssW, cssH)
        // Only draw boids whose screen position falls inside this card.
        for (let i = 0; i < boids.length; i++) {
          const b = boids[i]
          if (b.x < r.left - 8 || b.x > r.right + 8 || b.y < r.top - 8 || b.y > r.bottom + 8) continue
          drawBoid(mctx, b, next[i], r.left, r.top)
        }
      })

      raf = requestAnimationFrame(tick)
    }

    onResize()
    seed()
    // Publish the live boids array so other systems (e.g. the seaweed
    // physics in Hero) can read positions/velocities each frame without
    // re-implementing the simulation. The array is mutated in place, so
    // sharing the reference once is enough.
    boidShare.current = boids
    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('click', onClick)
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  )
}
