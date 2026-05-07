// Live snapshot of the boid simulation, shared with anything that wants to
// react to boids without coupling to <AmbientParticles>. Set once on mount;
// the boids array is mutated in place each frame, so consumers always see
// current positions/velocities by reading boidShare.current.

export interface SharedBoid {
  x: number
  y: number
  vx: number
  vy: number
}

export const boidShare: { current: SharedBoid[] } = { current: [] }
