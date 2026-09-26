"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { TopFrost } from "./TopFrost";
import { Button } from "@/components/ui/Button";
import { TEXT_LEAD, TEXT_META } from "@/lib/ui";
import { TwinWalls } from "./TwinWalls";

const { hero } = content;

/* THE /v3 HERO — two walls of vertical lanes (TwinWalls) on either side, and
   the whole pitch standing still in the column between them. No scroll track,
   no rise, no blur: the section is one screen tall and the copy is in place
   from the first frame. HeroReel on the home page still carries the scroll
   version; this one no longer shares its behaviour.

   Reduced motion holds the clips on posters, as everywhere else. */

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* The headline's gradient run, split out of the copy's *asterisks*. */
const [HEAD_PLAIN, HEAD_GRAD = ""] = hero.headline.split("*");

export function HeroTwinWalls() {
  const ref = useRef<HTMLElement>(null);
  const [play] = useState(() => typeof window !== "undefined" && !reduceMotion());
  const [inView, setInView] = useState(true);

  /* The marquees park once the hero has scrolled away, and the tiles leave
     both shared observers with them, so neither competes with the Corridor's
     lanes for frames. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      aria-label="Introduction"
      /* Not marked as a dark band for the nav: the top edge is frosted
         white, so the nav's links have to stay ink over it. */
      className="relative h-svh overflow-hidden bg-[#17141b] text-[#f5f3f0]"
    >
      <TwinWalls running={inView} play={play && inView}>
        <div className="flex max-w-[40rem] flex-col items-center text-center">
          <span
            className={`inline-flex items-center gap-[0.65em] font-mono ${TEXT_META} font-medium uppercase tracking-[0.22em] text-pink before:h-px before:w-[1.7rem] before:bg-current before:opacity-55 before:content-[''] after:h-px after:w-[1.7rem] after:bg-current after:opacity-55 after:content-['']`}
          >
            {hero.eyebrow}
          </span>

          <h1
            className="mt-3 text-balance font-display text-[clamp(2.4rem,1.4rem+4vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.022em] tab:text-[clamp(1.7rem,0.45rem+2.75vw,3.5rem)]"
          >
            {HEAD_PLAIN}
            <span className="bg-[image:var(--grad)] box-decoration-clone bg-clip-text text-transparent">
              {HEAD_GRAD}
            </span>
          </h1>

          <p
            className={`mt-6 max-w-[36ch] text-pretty ${TEXT_LEAD} leading-[1.45] text-[#f5f3f0]/75`}
          >
            {hero.subline}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Button contact variant="grad" withArrow>
              {hero.primaryCta}
            </Button>
            <Button
              href={hero.secondaryHref}
              variant="ghost"
              className="!border-white/60 !text-white hover:!border-pink hover:!text-pink"
            >
              {hero.secondaryCta}
            </Button>
          </div>

          <p className={`mt-4 font-mono ${TEXT_META} tracking-[0.03em] text-ink-dim`}>
            {hero.reassurance}
          </p>
        </div>
      </TwinWalls>

      {/* THE TOP EDGE: the nav's frosted white band. */}
      <TopFrost />
    </section>
  );
}
