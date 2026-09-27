"use client";

import { useEffect, useRef, useState } from "react";
import { Lightbox } from "@/components/ui/Lightbox";
import type { Reel } from "@/lib/reels.generated";
import { HeroCopy, HeroTwinWalls } from "./HeroTwinWalls";
import { HERO_ROWS_OF_PICKS, WorkLanes } from "./Work";

/* THE /v5 HERO — /v4's twin walls from `tab:` up (minus the inner-edge blur; the fade stays), and a stacked layout below
   it: the centred nav, then Work's three horizontal lanes filling three
   quarters of the screen, then the pitch on paper underneath.

   BOTH LAYOUTS ARE IN THE MARKUP and CSS picks one, so there is no layout
   flash on hydration. The hidden one costs nothing to play: display:none
   never intersects, so no LazyVideo in it loads or plays, and each section's
   own observer parks its marquees.

   BOTH WALLS ANSWER THE POINTER THE WAY WORK'S DO: a tile is a button that
   opens the lightbox, hovering a lane dims its other tiles and stops it, and
   every lane parks while the lightbox is open (its full-screen blur would
   otherwise re-sample moving footage on every frame). One lightbox serves
   both layouts, since only one is ever on screen. */

/* The lane block is 75svh: three rows of 9:16 tiles with two 12px row gaps
   (WorkLanes' gap at its ceiling), so tile width = (75svh - 24px) / 3 x 9/16. */
const TILE_SIZE = "w-[calc((75svh-24px)*3/16)]";

/* The same size as a number, plus the 12px lane gap — see usePitchRowLength.
   Module scope so the store does not re-read on every render. */
const TILE_PITCH = (_vw: number, vh: number) => ((vh * 0.75 - 24) * 3) / 16 + 12;

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function PhoneHero({ onOpen, paused }: { onOpen: (reel: Reel) => void; paused: boolean }) {
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
    <section ref={ref} aria-label="Introduction" className="relative bg-paper pt-[var(--nav-h)] text-ink tab:hidden">
      {/* THE LANES. */}
      <div className="flex h-[75svh] items-center overflow-hidden">
        <WorkLanes
          rows={HERO_ROWS_OF_PICKS}
          lane="hero-stack-row"
          running={inView && !paused}
          onOpen={onOpen}
          play={play && inView}
          size={TILE_SIZE}
          pitch={TILE_PITCH}
          light
          fades={false}
          className="w-full"
        />
      </div>

      {/* SECTION's bottom padding, so with the logo wall's own on top the seam
          under the pitch is the page's 64 / 96 like every other. */}
      <div className="flex justify-center px-[clamp(24px,5vw,64px)] pb-[clamp(32px,5vw,48px)] pt-[clamp(32px,8vw,48px)]">
        <HeroCopy />
      </div>
    </section>
  );
}

export function HeroStacked() {
  const [active, setActive] = useState<Reel | null>(null);
  return (
    <>
      <div className="max-tab:hidden">
        <HeroTwinWalls edgeFade topFrost={false} onOpen={setActive} paused={!!active} />
      </div>
      <PhoneHero onOpen={setActive} paused={!!active} />
      {active && <Lightbox reel={active} onClose={() => setActive(null)} />}
    </>
  );
}
