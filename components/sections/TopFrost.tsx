import { BLUR_RAMP, TINT_MASK, maskFor } from "./Nav";

/* THE FROSTED TOP EDGE — the nav's own progressive blur and white wash (see
   BLUR_RAMP and the wash note in Nav.tsx), stood at the top of a hero so the
   wall under it frosts to white the way the bar does over a light band on /v7.
   Same ramp, same wash, same masks, imported rather than copied, so the two
   can never drift apart.

   Its own strip, not the nav's: the nav hides on scroll and this edge should
   not. Exactly as tall as the bar — `--nav-h` is the header's measured height,
   set by Nav; the clamp is only the first-paint fallback. */
export function TopFrost({ className = "h-[var(--nav-h,clamp(64px,4.5vw,90px))]" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 ${className}`}>
      {BLUR_RAMP.map(({ blur, solid, reach }) => {
        const mask = maskFor(solid, reach);
        return (
          <div
            key={blur}
            className="absolute inset-x-0 top-0"
            style={{
              height: `${reach}%`,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
      <div
        className="absolute inset-0 bg-white/45"
        style={{ maskImage: TINT_MASK, WebkitMaskImage: TINT_MASK }}
      />
    </div>
  );
}
