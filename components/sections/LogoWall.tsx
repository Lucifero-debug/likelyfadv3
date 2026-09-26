"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ANCHOR, HEAD_GAP, SECTION, WRAP } from "@/lib/ui";

/* THE LOGO WALL.

   THE PATTERN IS MOTION-PRIMITIVES' INFINITE SLIDER, WITHOUT THE RUNTIME. Two
   copies of the set on one track, the track slides by exactly half its own
   length, edge fades hide the join. That library does it with framer-motion and
   a measure hook; this site already does it with `animate-lane-x` in
   globals.css for the reel walls, and a logo strip is the simplest possible
   case of the same mechanism. No dependency, no JS on the animation.

   THE LOGOS ARE MONOCHROME UNTIL HOVERED. Fourteen brands in fourteen colour
   systems on one line is noise; the same fourteen as ink at low opacity reads
   as one client list. Colour arrives on hover, per logo, which is also the only
   feedback the row gives — it is not clickable and does not pretend to be.

   THE LOGO FILES ARE SVGs WITH `currentColor` FILLS. That is what lets one CSS
   colour rule tint all of them: the file's own colours are stripped once, at
   export, and the component decides the colour. A raster logo or an SVG with
   hard-coded fills will ignore the tint and sit there in full colour.

   `near` PARKS THE LANE OFF SCREEN, same as the reel walls. A marquee animating
   in a section nobody can see is a composited frame paid for nothing.

   REDUCED MOTION gets a wrapped grid rather than a stopped marquee — a strip
   that only shows its first screen of logos is a client list with most of the
   clients hidden. */

/* Move this to lib/content.ts once the list settles. `name` is the alt text and
   the hover label; `src` is a monochrome SVG in /public/logos/. `width` lets a
   wide wordmark and a square emblem sit at the same optical weight, since equal
   HEIGHT makes a wordmark look tiny next to a monogram. */
type Logo = { name: string; src: string; width?: number };

const LOGOS: Logo[] = [
  { name: "Brand One", src: "/logos/brand-one.svg", width: 120 },
  { name: "Brand Two", src: "/logos/brand-two.svg", width: 96 },
  { name: "Brand Three", src: "/logos/brand-three.svg", width: 132 },
  { name: "Brand Four", src: "/logos/brand-four.svg", width: 88 },
  { name: "Brand Five", src: "/logos/brand-five.svg", width: 110 },
  { name: "Brand Six", src: "/logos/brand-six.svg", width: 124 },
  { name: "Brand Seven", src: "/logos/brand-seven.svg", width: 100 },
  { name: "Brand Eight", src: "/logos/brand-eight.svg", width: 116 },
];

const COPY = {
  kicker: "Clients",
  heading: "Brands that ship with us.",
  sub: "From DTC launches to enterprise campaigns.",
};

/* Seconds for one full loop. The lane slides half its length per cycle, so this
   is the time for one copy of the set to pass a fixed point. */
const SECONDS = 38;

const LOGO =
  "group/logo relative flex h-14 shrink-0 items-center justify-center " +
  "text-ink/40 transition-colors duration-300 hover:text-ink";

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
    <div className={LOGO} style={{ width: logo.width ?? 110 }} title={logo.name}>
      {/* `mask-image` rather than <img>, so the SVG's shape is painted in the
          element's own currentColor and one colour rule tints every logo. An
          <img> cannot be recoloured by CSS. */}
      <span
        role="img"
        aria-label={logo.name}
        className="block size-full bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
        style={{
          WebkitMaskImage: `url(${logo.src})`,
          maskImage: `url(${logo.src})`,
        }}
      />
    </div>
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
      className={`${SECTION} ${ANCHOR} relative overflow-hidden bg-paper text-ink`}
    >
      <div className={WRAP}>
        <div className={HEAD_GAP}>
          <SectionHeading kicker={COPY.kicker} heading={COPY.heading} />
          <Reveal delay={100}>
            <p className="mt-3 text-center font-mono text-[0.8rem] tracking-[0.04em] text-ink-soft">
              {COPY.sub}
            </p>
          </Reveal>
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
              <Mark key={l.name} logo={l} />
            ))}
            <div aria-hidden className="contents">
              {LOGOS.map((l) => (
                <Mark key={`dup-${l.name}`} logo={l} />
              ))}
            </div>
          </div>

          {/* The fades name paper's own channels at alpha 0 so the ramp never
              passes through black — the same rule every fade on this site keeps. */}
          <div
            aria-hidden
            className={`${FADE} left-0 bg-[linear-gradient(to_right,#fbf9f6,rgba(251,249,246,0))]`}
          />
          <div
            aria-hidden
            className={`${FADE} right-0 bg-[linear-gradient(to_left,#fbf9f6,rgba(251,249,246,0))]`}
          />
        </div>
      ) : (
        <div
          className={`${WRAP} flex flex-wrap items-center justify-center gap-x-[clamp(32px,4vw,64px)] gap-y-8`}
        >
          {LOGOS.map((l) => (
            <Mark key={l.name} logo={l} />
          ))}
        </div>
      )}
    </section>
  );
}