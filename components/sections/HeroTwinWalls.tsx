"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { TopFrost } from "./TopFrost";
import { Button } from "@/components/ui/Button";
import { TEXT_LEAD, TEXT_META } from "@/lib/ui";
import { TwinWalls } from "./TwinWalls";

const { hero } = content;

/* ENTRANCE: the walls slide in from their outer edges (.twin-wall-in, see
   TwinWalls) while the copy rises piece by piece in the middle (.v3-rise,
   staggered 250-720ms by inline delay). CSS only, so it plays on first paint
   without waiting for hydration; both have reduced-motion fades in
   globals.css.

   THE /v3 HERO — two walls of vertical lanes (TwinWalls) on either side, and
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
      className="relative h-svh overflow-hidden bg-white text-ink"
    >
      <TwinWalls running={inView} play={play && inView}>
        {/* ONE MEASURE FOR THE WHOLE BLOCK, from `tab:` up: the block is set in
            the reassurance line's size and is 35em wide — that line's own
            width on one line (34.6em, measured) — and the headline and subline
            are sized in em off it, so they share its width at every viewport.
            3.36em puts "Ads so real, nobody" (9.8em of it) just inside the
            measure, so the headline breaks into exactly two lines; 1.4em sets
            the subline (61.7em of it) at ~2.5 measures, so it ends in three. */}
        <div className={`flex w-full max-w-[40rem] flex-col items-center text-center tab:w-[35em] tab:max-w-none ${TEXT_META}`}>
          <span
            style={{ animationDelay: "250ms" }}
            className={`v3-rise inline-flex items-center gap-[0.65em] font-mono ${TEXT_META} font-medium uppercase tracking-[0.22em] text-pink-deep before:h-px before:w-[1.7rem] before:bg-current before:opacity-55 before:content-[''] after:h-px after:w-[1.7rem] after:bg-current after:opacity-55 after:content-['']`}
          >
            {hero.eyebrow}
          </span>

          <h1
            style={{ animationDelay: "350ms" }}
            className="v3-rise mt-3 text-balance font-display text-[clamp(1.9rem,8.4vw,2.6rem)] font-bold leading-[1.04] tracking-[-0.022em] tab:text-[3.36em]"
          >
            {HEAD_PLAIN}
            <span className="bg-[image:var(--grad)] box-decoration-clone bg-clip-text text-transparent">
              {HEAD_GRAD}
            </span>
          </h1>

          <p
            style={{ animationDelay: "480ms" }}
            className={`v3-rise mt-6 max-w-[36ch] text-pretty ${TEXT_LEAD} leading-[1.45] text-ink-soft tab:max-w-none tab:text-[1.4em]`}
          >
            {hero.subline}
          </p>

          {/* Below `tab:` the two stack, each the full width of the copy. */}
            <div
              style={{ animationDelay: "600ms" }}
              className="v3-rise mt-8 flex flex-wrap justify-center gap-2 max-tab:w-full max-tab:flex-col"
            >
            <Button contact variant="grad" withArrow className="max-tab:w-full">
              {hero.primaryCta}
            </Button>
            <Button
              href={hero.secondaryHref}
              variant="ghost"
              className="max-tab:w-full"
            >
              {hero.secondaryCta}
            </Button>
          </div>

          <p
            style={{ animationDelay: "720ms" }}
            className={`v3-rise mt-4 font-mono ${TEXT_META} tracking-[0.03em] text-ink-faint tab:whitespace-nowrap`}
          >
            {hero.reassurance}
          </p>
        </div>
      </TwinWalls>

      {/* THE TOP EDGE: the nav's frosted white band. */}
      <TopFrost />
    </section>
  );
}
