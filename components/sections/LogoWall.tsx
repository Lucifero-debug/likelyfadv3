"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LOGOS, logoSrc, logoWidth, type Logo } from "@/lib/logos";
import { ANCHOR, HEAD_GAP, WRAP } from "@/lib/ui";

/* THE LOGO WALL.

   THE PATTERN IS MOTION-PRIMITIVES' INFINITE SLIDER, WITHOUT THE RUNTIME. Two
   copies of the set on one track, the track slides by exactly half its own
   length, edge fades hide the join. That library does it with framer-motion and
   a measure hook; this site already does it with `animate-lane-x` in
   globals.css for the reel walls, and a logo strip is the simplest possible
   case of the same mechanism. No dependency, no JS on the animation.

   TRUE COLOUR, ALWAYS. Each mark is the delivered PNG from lib/logos.ts as-is
   — no tint, no fade, no hover recolour. The brands' own colours are never
   altered.

   `near` PARKS THE LANE OFF SCREEN, same as the reel walls. A marquee animating
   in a section nobody can see is a composited frame paid for nothing.

   REDUCED MOTION gets a wrapped grid rather than a stopped marquee — a strip
   that only shows its first screen of logos is a client list with most of the
   clients hidden. */

const COPY = {
  kicker: "Clients",
  heading: "Brands that *ship with us.*",
};

/* Seconds for one full loop. The lane slides half its length per cycle, so this
   is the time for one copy of the set to pass a fixed point. */
const SECONDS = 38;

const FADE = "pointer-events-none absolute inset-y-0 z-[2] w-[14%]";

function useNearViewport<T extends Element>() {
  const ref = useRef<T>(null);
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
  return [ref, near] as const;
}

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMotion() {
  return !window.matchMedia(REDUCED).matches;
}

function Mark({ logo }: { logo: Logo }) {
  return (
    <img
      src={logoSrc(logo)}
      alt={logo.name}
      title={logo.name}
      width={logoWidth(logo)}
      height={logo.h}
      loading="lazy"
      decoding="async"
      className="block max-w-none shrink-0 object-contain"
    />
  );
}

export function LogoWall() {
  const [sectionRef, near] = useNearViewport<HTMLElement>();
  /* useSyncExternalStore, not a useState initializer: the server has no window,
     so reading matchMedia during render gives server and client different trees
     and React throws a hydration mismatch. The server snapshot is the strip. */
  const motion = useSyncExternalStore(subscribeMotion, getMotion, () => true);

  return (
    <section
      ref={sectionRef}
      id="clients"
      aria-label={COPY.kicker}
      /* NOT SECTION'S SYMMETRIC PADDING. The band under this is Why us, whose
         own `.section` padding (72→152, vh-keyed) already opens the seam below
         the logos; SECTION's 48 on top of it put 147px under the strip and 54
         over the kicker at 1440, so the band hung off the hero. This side owns
         the gap above, Why us owns the gap below, and the two land within a few
         px of each other: 96 over 99 at 1440×900, 80 over 93 on a phone. */
      className={`pt-[clamp(80px,7vw,96px)] ${ANCHOR} relative overflow-hidden bg-paper text-ink`}
    >
      <div className={WRAP}>
        <div className={HEAD_GAP}>
          <SectionHeading kicker={COPY.kicker} heading={COPY.heading} />
        </div>
      </div>

      {motion ? (
        /* THE STRIP. Full bleed; the wrap's cap is deliberately not applied so
           the logos run out of the page rather than stopping at an edge. */
        <div className="relative">
          <div
            className={`flex w-max animate-lane-x items-center gap-[clamp(40px,5vw,88px)] will-change-transform ${
              near ? "" : "[animation-play-state:paused]"
            } hover:[animation-play-state:paused]`}
            style={{ animationDuration: `${SECONDS}s` }}
          >
            {/* Two copies, and the second is hidden from assistive tech — read
                aloud, one client list is a list and two is a stutter. */}
            {LOGOS.map((l) => (
              <Mark key={l.slug} logo={l} />
            ))}
            <div aria-hidden className="contents">
              {LOGOS.map((l) => (
                <Mark key={`dup-${l.slug}`} logo={l} />
              ))}
            </div>
          </div>

          {/* The fades name paper's own channels at alpha 0 so the ramp never
              passes through black — the same rule every fade on this site keeps. */}
          <div
            aria-hidden
            className={`${FADE} left-0 bg-[linear-gradient(to_right,var(--color-paper),rgb(from_var(--color-paper)_r_g_b_/_0))]`}
          />
          <div
            aria-hidden
            className={`${FADE} right-0 bg-[linear-gradient(to_left,var(--color-paper),rgb(from_var(--color-paper)_r_g_b_/_0))]`}
          />
        </div>
      ) : (
        <div
          className={`${WRAP} flex flex-wrap items-center justify-center gap-x-[clamp(32px,4vw,64px)] gap-y-8`}
        >
          {LOGOS.map((l) => (
            <Mark key={l.slug} logo={l} />
          ))}
        </div>
      )}
    </section>
  );
}