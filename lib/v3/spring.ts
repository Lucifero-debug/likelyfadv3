/* ============================================================================
   A SPRING, IN APPLE'S TWO PARAMETERS — damping ratio and response.

   The /v3 page has no animation library, and it only needs one thing from
   one: a value that can be retargeted mid-flight without a jump and without
   losing its velocity. That is a spring, and it is forty lines.

   damping   1.0 = critically damped, settles with no overshoot. Below 1 it
             overshoots; 0.8 is Apple's "this was thrown" value.
   response  roughly how long, in seconds, the value takes to get there. It is
             NOT a duration — the settle time falls out of the physics.

   Mass is 1, so stiffness = (2π / response)² and damping coefficient =
   4π·ζ / response. Integrated with semi-implicit Euler in fixed substeps, so
   the motion is identical at 60Hz and 120Hz.

   INTERRUPTIBLE BY CONSTRUCTION. `value` is always the on-screen value, so a
   drag that grabs the element mid-flight reads it straight off here, and `to()`
   keeps the current velocity unless it is handed a new one.
   ========================================================================== */

export type SpringConfig = { damping: number; response: number };

/** Apple's defaults: move/reposition, and the momentum variant. */
export const SPRING_SETTLE: SpringConfig = { damping: 1, response: 0.4 };
export const SPRING_FLICK: SpringConfig = { damping: 0.82, response: 0.45 };

const STEP = 1 / 240;

export class Spring {
  value: number;
  velocity = 0;
  target: number;
  private config: SpringConfig;
  private frame = 0;
  private last = 0;
  private readonly onUpdate: (v: number) => void;

  constructor(value: number, onUpdate: (v: number) => void, config: SpringConfig = SPRING_SETTLE) {
    this.value = value;
    this.target = value;
    this.onUpdate = onUpdate;
    this.config = config;
  }

  /** Retarget. Motion continues from the current value; `velocity` (units/s)
      replaces the current one only when given — the gesture handoff. */
  to(target: number, opts: { velocity?: number; config?: SpringConfig } = {}) {
    this.target = target;
    if (opts.velocity !== undefined) this.velocity = opts.velocity;
    if (opts.config) this.config = opts.config;
    if (!this.frame) {
      this.last = performance.now();
      this.frame = requestAnimationFrame(this.tick);
    }
  }

  /** Jump, no animation — 1:1 drag tracking, and reduced motion. */
  set(value: number) {
    this.stop();
    this.value = this.target = value;
    this.velocity = 0;
    this.onUpdate(value);
  }

  stop() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private tick = (now: number) => {
    const { damping, response } = this.config;
    const k = (2 * Math.PI / response) ** 2;
    const c = (4 * Math.PI * damping) / response;
    // A tab coming back from the background must not integrate a 10s step.
    let dt = Math.min((now - this.last) / 1000, 1 / 20);
    this.last = now;

    while (dt > 0) {
      const h = Math.min(dt, STEP);
      const a = -k * (this.value - this.target) - c * this.velocity;
      this.velocity += a * h;
      this.value += this.velocity * h;
      dt -= h;
    }

    if (Math.abs(this.value - this.target) < 0.1 && Math.abs(this.velocity) < 4) {
      this.value = this.target;
      this.velocity = 0;
      this.frame = 0;
      this.onUpdate(this.value);
      return;
    }
    this.onUpdate(this.value);
    this.frame = requestAnimationFrame(this.tick);
  };
}

/** Where a flick comes to rest — Apple's projection, from the sample code of
    Designing Fluid Interfaces. `velocity` in px/s. 0.998 is scroll-view feel. */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Soft boundary: the further past the edge, the less the content follows. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  const sign = Math.sign(overshoot);
  const o = Math.abs(overshoot);
  return (sign * (o * dimension * constant)) / (dimension + constant * o);
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
