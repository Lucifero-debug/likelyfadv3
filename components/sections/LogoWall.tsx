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
  heading: "Brands that\n*ship with us.*",
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

/* The strip's own breathing room, ON TOP OF the heading's HEAD_GAP above
   and the seam into Why us below — each doubled by request (Sep 2026). As
   measured: 32 above / 70 below on a phone, 64 / 122 at 1440, so the strip
   adds that much again on each side. The top is PADDING: a margin would
   collapse into HEAD_GAP's and add nothing. */
const STRIP_GAP = "pt-[clamp(32px,4.5vw,64px)] mb-[clamp(70px,50px+5vw,122px)]";

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
      /* SECTION, LIKE EVERY OTHER BAND. This used to own both of its seams
         with a bespoke 64→80 and zero Why us's top padding to match, which
         made it the one band on the page whose rhythm was authored by hand.
         Now it pads 48 a side like the rest, Why us pads its own 48 above,
         and the seam between them is the page's 96 — same as every other.

         EXCEPT ON A PHONE, where it pads 8 and each seam is 40 against the
         page's 64. A heading and one thin strip is the lightest band on the
         page, and the logo PNGs carry ~10px of empty canvas above and below
         the marks; at an equal 64 the band read as floating loose between its
         neighbours. From `tab:` up it is SECTION, spelled out because Tailwind
         scans source text and a variant cannot be prefixed onto a constant. */
      className={`py-2 tab:py-[clamp(32px,5vw,48px)] ${ANCHOR} relative overflow-hidden bg-paper text-ink`}
    >
      <div className={WRAP}>
        <div className={HEAD_GAP}>
          <SectionHeading kicker={COPY.kicker} heading={COPY.heading} />
        </div>
      </div>

      {motion ? (
        /* THE STRIP. Full bleed; the wrap's cap is deliberately not applied so
           the logos run out of the page rather than stopping at an edge. */
        <div className={`relative ${STRIP_GAP}`}>
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
          className={`${WRAP} ${STRIP_GAP} flex flex-wrap items-center justify-center gap-x-[clamp(32px,4vw,64px)] gap-y-8`}
        >
          {LOGOS.map((l) => (
            <Mark key={l.slug} logo={l} />
          ))}
        </div>
      )}
    </section>
  );
}