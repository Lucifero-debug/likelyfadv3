"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LOGOS, logoSrc, logoWidth, type Logo } from "@/lib/logos";
import { ANCHOR, HEAD_GAP, SECTION, WRAP } from "@/lib/ui";

/* LOGO WALL 01 — THE MARQUEE.  (v3)

   THE PATTERN IS MOTION-PRIMITIVES' INFINITE SLIDER WITHOUT THE RUNTIME. Two
   copies of the set on one track, the track slides half its own length, edge
   fades hide the join. That library ships it on framer-motion and a measure
   hook; this site already runs the same mechanism as `animate-lane-x` for the
   reel walls, and a logo strip is its simplest case. No dependency, no JS on
   the animation.

   INK AT REST, COLOUR ON HOVER. Nine brands in nine colour systems on one line
   is noise; the same nine tinted to ink at 40% read as one client list. Each
   mark is two stacked layers — the colour PNG, and the same PNG's alpha painted
   in currentColor through `mask-image` on top. Hovering fades the tinted layer
   out and the colour underneath comes through. An <img> cannot be recoloured
   by CSS; a mask can, which is why the tint is a mask.

   THE STRIP PAUSES ON HOVER, so a logo can be looked at, and parks entirely
   while the section is off screen. Reduced motion gets a wrapped grid rather
   than a stopped strip — a strip that only shows its first screen is a client
   list with most of the clients hidden. */

const COPY = {
  kicker: "Clients",
  heading: "Brands that ship with us.",
  sub: "From DTC launches to enterprise campaigns.",
};

const SECONDS = 42;
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

function Mark({ logo }: { logo: Logo }) {
  const src = logoSrc(logo);
  return (
    <div
      className="group/mark relative shrink-0 text-ink"
      style={{ width: logoWidth(logo), height: logo.h }}
      title={logo.name}
    >
      <img
        src={src}
        alt={logo.name}
        width={logoWidth(logo)}
        height={logo.h}
        loading="lazy"
        decoding="async"
        className="block size-full object-contain"
      />
      {/* The tint. Sits over the colour mark and fades on hover. */}
      <span
        aria-hidden
        className="absolute inset-0 bg-current opacity-40 transition-opacity duration-300 [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] group-hover/mark:opacity-0"
        style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
      />
      {/* Paper behind the tint, so the colour does not bleed through at 40%. */}
      <span
        aria-hidden
        className="absolute inset-0 -z-[1] bg-paper transition-opacity duration-300 [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] group-hover/mark:opacity-0"
        style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
      />
    </div>
  );
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

export function LogoWallMarquee() {
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
        <div className="relative">
          <div
            className={`flex w-max animate-lane-x items-center gap-[clamp(44px,5.5vw,96px)] will-change-transform hover:[animation-play-state:paused] ${
              near ? "" : "[animation-play-state:paused]"
            }`}
            style={{ animationDuration: `${SECONDS}s` }}
          >
            {LOGOS.map((l) => (
              <Mark key={l.slug} logo={l} />
            ))}
            {/* The second copy exists for the wrap and is hidden from assistive
                tech — read aloud, one client list is a list and two is a stutter. */}
            <div aria-hidden className="contents">
              {LOGOS.map((l) => (
                <Mark key={`dup-${l.slug}`} logo={l} />
              ))}
            </div>
          </div>
          {/* Paper's own channels at alpha 0, so the ramp never passes through
              black — the rule every fade on this site keeps. */}
          <div aria-hidden className={`${FADE} left-0 bg-[linear-gradient(to_right,#fbf9f6,rgba(251,249,246,0))]`} />
          <div aria-hidden className={`${FADE} right-0 bg-[linear-gradient(to_left,#fbf9f6,rgba(251,249,246,0))]`} />
        </div>
      ) : (
        <div className={`${WRAP} flex flex-wrap items-center justify-center gap-x-[clamp(36px,4.5vw,72px)] gap-y-8`}>
          {LOGOS.map((l) => (
            <Mark key={l.slug} logo={l} />
          ))}
        </div>
      )}
    </section>
  );
}
