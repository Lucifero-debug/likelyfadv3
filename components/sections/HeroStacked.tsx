"use client";

import { useEffect, useRef, useState } from "react";
import { HeroCopy, HeroTwinWalls } from "./HeroTwinWalls";
import { HERO_ROWS_OF_PICKS, WorkLanes } from "./Work";

/* THE /v5 HERO — /v4's twin walls from `tab:` up, and a stacked layout below
   it: the centred nav, then Work's three horizontal lanes filling three
   quarters of the screen, then the pitch on white underneath.

   BOTH LAYOUTS ARE IN THE MARKUP and CSS picks one, so there is no layout
   flash on hydration. The hidden one costs nothing to play: display:none
   never intersects, so no LazyVideo in it loads or plays, and each section's
   own observer parks its marquees. */

/* The lane block is 75svh: three rows of 9:16 tiles with two 12px row gaps
   (WorkLanes' gap at its ceiling), so tile width = (75svh - 24px) / 3 x 9/16. */
const TILE_SIZE = "w-[calc((75svh-24px)*3/16)]";

/* The same size as a number, plus the 12px lane gap — see usePitchRowLength.
   Module scope so the store does not re-read on every render. */
const TILE_PITCH = (_vw: number, vh: number) => ((vh * 0.75 - 24) * 3) / 16 + 12;

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function PhoneHero() {
  const ref = useRef<HTMLElement>(null);
  const [play] = useState(() => typeof window !== "undefined" && !reduceMotion());
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} aria-label="Introduction" className="relative bg-white pt-[var(--nav-h)] text-ink tab:hidden">
      {/* THE LANES. Inert: no pointer events, every tile aria-hidden. */}
      <div aria-hidden="true" className="pointer-events-none flex h-[75svh] items-center overflow-hidden">
        <WorkLanes
          rows={HERO_ROWS_OF_PICKS}
          lane="hero-stack-row"
          running={inView}
          play={play && inView}
          size={TILE_SIZE}
          pitch={TILE_PITCH}
          light
          className="w-full"
        />
      </div>

      <div className="flex justify-center px-[clamp(24px,5vw,64px)] pb-[clamp(48px,12vw,72px)] pt-[clamp(32px,8vw,48px)]">
        <HeroCopy />
      </div>
    </section>
  );
}

export function HeroStacked() {
  return (
    <>
      <div className="max-tab:hidden">
        <HeroTwinWalls edgeBlur topFrost={false} />
      </div>
      <PhoneHero />
    </>
  );
}
