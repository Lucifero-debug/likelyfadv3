"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LOGOS, logoSrc, logoWidth, type Logo } from "@/lib/logos";
import { ANCHOR, SECTION, WRAP } from "@/lib/ui";

/* LOGO WALL 08 — THE ORBIT.  (v8)

   THE CLIENTS GO ROUND THE STUDIO. A numeral at the centre, two rings of
   marks around it turning in opposite directions — four on the inner, five on
   the outer — so the field is never still but never scrolls away either:
   every brand is on screen the whole time, which a marquee cannot say.

   TWO ROTATIONS PER MARK, AND THEY CANCEL. The ring spins; each mark inside
   it spins the other way at the same rate, so the ring carries it round while
   it stays upright. Both are the built-in `spin` keyframe on the compositor —
   no JS drives a frame, and eleven animated layers is all there is.

   PLACED IN PERCENT, SIZED IN `cqw`. The orbit is a square container; ring
   positions are percentages of it and mark widths are capped in container
   units, so the whole figure scales as one object from a phone to a desktop
   instead of the marks overlapping as the rings shrink.

   WHITE ON NOIR, like the arc on /v7 — it is the same dark family of page.
   Marks sit at 70% and the hovered one comes to full; the whole orbit pauses
   under the pointer so a mark can be read, and parks off screen. Reduced
   motion is handled by globals.css, which collapses every animation to one
   iteration — a full turn, which ends exactly where it began. */

const COPY = {
  kicker: "Clients",
  heading: "Brands in our orbit.",
};

/* Radius of each ring as a percent of the orbit's width, and its period. The
   outer ring runs slower: equal angular speed would move its marks faster in
   px/s, and the eye reads that as the outer ring being the busier one. */
/* THE RINGS COUNTER-ROTATE, so sooner or later every inner mark passes every
   outer one side by side, on the horizontal where the radial gap is the whole
   clearance. Capping every mark at MAX_W keeps any two half-widths inside the
   22-point gap between the rings, so they can pass but never touch. The same
   cap keeps inner marks 14.5 points off centre, clear of the two-line label. */
const MAX_W = 19;

const RINGS = [
  { logos: LOGOS.slice(0, 4), r: 24, seconds: 70, reverse: false, offset: 45 },
  { logos: LOGOS.slice(4), r: 46, seconds: 110, reverse: true, offset: -90 },
];

/* Tailwind's `animate-spin` supplies the keyframe (v4 only emits it when the
   class is used); these longhands retime and redirect it. */
const spin = (seconds: number, reverse: boolean): CSSProperties => ({
  animationDuration: `${seconds}s`,
  animationDirection: reverse ? "reverse" : "normal",
});

function Mark({ logo }: { logo: Logo }) {
  const src = logoSrc(logo);
  const w = Math.round(logoWidth(logo) * 1.1);
  return (
    <span
      role="img"
      aria-label={logo.name}
      className="block bg-white opacity-70 transition-opacity duration-300 [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] hover:opacity-100"
      style={{
        width: `min(${w}px, ${MAX_W}cqw)`,
        aspectRatio: String(logo.aspect),
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
      }}
    />
  );
}

export function LogoWallOrbit() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), {
      rootMargin: "20% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Inline only when parked: an inline `running` would outrank the hover
     pause below, which is a class. */
  const park: CSSProperties | undefined = near
    ? undefined
    : { animationPlayState: "paused" };
  const ANIMATED =
    "animate-spin group-hover/orbit:[animation-play-state:paused]";

  return (
    <section
      id="clients"
      aria-label={COPY.kicker}
      data-nav-dark
      className={`${SECTION} ${ANCHOR} relative overflow-hidden bg-noir text-paper`}
    >
      <div className={WRAP}>
        <SectionHeading
          kicker={COPY.kicker}
          heading={COPY.heading}
          tone="bright"
        />
        {/* Below `tab:` the label leaves the centre for here: at its 0.62rem
            floor it is wider than the inner ring's clearance, and the marks
            would sweep across it. */}
        <p className="mt-3 text-center font-mono text-[0.72rem] uppercase tracking-[0.16em] text-ink-dim tab:hidden">
          {LOGOS.length} brands, one studio
        </p>

        <div
          ref={ref}
          className="group/orbit @container relative mx-auto mt-[clamp(24px,3vw,32px)] aspect-square w-[min(100%,640px)]"
        >
          {/* The rings themselves, drawn once and still. */}
          {RINGS.map(({ r }) => (
            <span
              key={r}
              aria-hidden
              className="absolute rounded-full border border-white/10"
              style={{ inset: `${50 - r}%` }}
            />
          ))}

          {/* The centre. */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[15cqw] font-bold leading-none tracking-[-0.04em]">
              {LOGOS.length}
            </span>
            <span className="mt-[1.5cqw] text-center font-mono max-tab:hidden text-[max(0.62rem,1.9cqw)] uppercase tracking-[0.16em] text-ink-dim">
              brands,
              <br />
              one studio
            </span>
          </div>

          {RINGS.map((ring) => (
            <div
              key={ring.r}
              className={`absolute inset-0 ${ANIMATED}`}
              style={{ ...spin(ring.seconds, ring.reverse), ...park }}
            >
              {ring.logos.map((l, i) => {
                const a =
                  ((ring.offset + (360 / ring.logos.length) * i) * Math.PI) /
                  180;
                return (
                  <div
                    key={l.slug}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${50 + ring.r * Math.cos(a)}%`,
                      top: `${50 + ring.r * Math.sin(a)}%`,
                    }}
                  >
                    {/* The counter-spin: same period, other way. */}
                    <div
                      className={ANIMATED}
                      style={{ ...spin(ring.seconds, !ring.reverse), ...park }}
                    >
                      <Mark logo={l} />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
