"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { TopFrost } from "@/components/sections/TopFrost";
import { Button } from "@/components/ui/Button";
import { TEXT_LEAD, TEXT_META } from "@/lib/ui";
import type { Reel } from "@/lib/reels.generated";
import { TwinWalls } from "./TwinWalls";

const { hero } = content;

/* The headline split at its *gradient* run: two lines, two masks. */
const [HEAD_PLAIN, HEAD_GRAD = ""] = hero.headline.split("*");

/* ENTRANCE: the walls slide in from their outer edges (.twin-wall-in, see
   TwinWalls) while the copy arrives in the middle: the headline
   line by line (.hero-line, 300 / 430ms), the other lines rising out of a light blur
   (.hero-rise, 150 / 800 / 950 / 1100ms by inline delay). Reduced motion
   gets plain fades.

   THE /v3 HERO — two walls of vertical lanes (TwinWalls) on either side, and
   the whole pitch standing still in the column between them. No scroll track,
   no rise, no blur: the section is one screen tall and the copy is in place
   from the first frame. HeroReel on the home page still carries the scroll
   version; this one no longer shares its behaviour.

   Reduced motion holds the clips on posters, as everywhere else. */

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function HeroTwinWalls({
  edgeBlur = false,
  edgeFade = edgeBlur,
  topFrost = true,
  onOpen,
  paused = false,
}: {
  edgeBlur?: boolean;
  /** The inner-edge fade without the blur — see TwinWalls. */
  edgeFade?: boolean;
  /** Makes the walls clickable — see TwinWalls. /v5 only. */
  onOpen?: (reel: Reel) => void;
  /** Parks the walls while something covers them (the lightbox). */
  paused?: boolean;
  /** The frosted white strip across the top (TopFrost). Off on /v4. */
  topFrost?: boolean;
} = {}) {
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
         white, so the nav's links have to stay ink over it.

         SECTION'S BOTTOM HALF, UNDER A FULL SCREEN OF WALL. box-content keeps
         h-svh as the walls' height and adds the 48 below it rather than
         taking it out of them, so with the logo wall's own 48 on top the seam
         is the page's 96 like every other. */
      className="relative box-content h-svh overflow-hidden bg-white pb-[clamp(32px,5vw,48px)] text-ink"
    >
      <TwinWalls running={inView && !paused} play={play && inView} edgeBlur={edgeBlur} edgeFade={edgeFade} onOpen={onOpen}>
        <HeroCopy />
      </TwinWalls>

      {/* THE TOP EDGE: the nav's frosted white band. */}
      {topFrost && <TopFrost />}
    </section>
  );
}

/* THE PITCH — eyebrow, two-line headline, subline, CTAs, reassurance. Its own
   component so /v5's phone layout can set the same copy under its lanes. */
export function HeroCopy({ phone = false }: { phone?: boolean }) {
  const Heading = phone ? "div" : "h1";
  /* ONE MEASURE FOR THE WHOLE BLOCK, from `tab:` up: the block is set in
   the reassurance line's size and is 35em wide — that line's own
   width on one line (34.6em, measured) — and the headline and subline
   are sized in em off it, so they share its width at every viewport.
   3.36em puts "Ads so real, nobody" (9.8em of it) just inside the
   measure, so the headline breaks into exactly two lines; 1.4em sets
   the subline (61.7em of it) at ~2.5 measures, so it ends in three. */
  return (
    <div data-polish-pitch className={`flex w-full max-w-[40rem] flex-col items-center text-center tab:w-[35em] tab:max-w-none ${TEXT_META}`}>
      <span
        style={{ animationDelay: "150ms" }}
        className={`hero-rise inline-flex items-center gap-[0.65em] font-mono ${TEXT_META} font-medium uppercase tracking-[0.22em] text-pink-deep before:h-px before:w-[1.7rem] before:bg-current before:opacity-55 before:content-[''] after:h-px after:w-[1.7rem] after:bg-current after:opacity-55 after:content-['']`}
      >
        {hero.eyebrow}
      </span>

      {/* Line by line, each sliding up from behind its own mask (.hero-line).
          Pure CSS so it plays on first paint — a JS word reveal here would
          paint the server's headline, hide it on hydration, then replay.
          The two copy lines are the two lines it sets in at every width
          (measured); if one ever wraps, its block simply holds two. The
          pb/-mb pair keeps descenders inside the mask. */}
      <Heading role={phone ? "heading" : undefined} aria-level={phone ? 1 : undefined} className="mt-3 text-balance font-display text-[clamp(1.9rem,8.4vw,2.6rem)] font-bold leading-[1.04] tracking-[-0.022em] tab:text-[3.36em]">
        <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <span className="hero-line block" style={{ animationDelay: "300ms" }}>
            {HEAD_PLAIN.trim()}{" "}
          </span>
        </span>
        <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <span
            className="hero-line inline-block bg-[image:var(--grad)] bg-clip-text text-transparent"
            style={{ animationDelay: "430ms" }}
          >
            {HEAD_GRAD}
          </span>
        </span>
      </Heading>

      <p
        style={{ animationDelay: "800ms" }}
        className={`hero-rise mt-6 max-w-[36ch] text-pretty ${TEXT_LEAD} leading-[1.45] text-ink-soft tab:max-w-none tab:text-[1.4em]`}
      >
        {hero.subline}
      </p>

      {/* Below `tab:` the two stack, each the full width of the copy. */}
        <div
          style={{ animationDelay: "950ms" }}
          className="hero-rise mt-8 flex flex-wrap justify-center gap-2 max-tab:w-full max-tab:flex-col"
        >
        <Button contact variant="grad" withArrow className="max-tab:w-full">
          {hero.primaryCta}
        </Button>
        {/* Reed: on phone the guarantee sits right under the primary CTA, inside the first screen (Aman msg 2446) */}
        <p className="font-sans text-[0.875rem] leading-[1.45] text-ink-soft tab:hidden">
          One paid trial video. Don&apos;t like it? Full refund, no questions asked.
        </p>
        <Button
          href={hero.secondaryHref}
          variant="ghost"
          className="max-tab:w-full"
        >
          {hero.secondaryCta}
        </Button>
      </div>

      {/* Reed, Aman msg 2446: the guarantee line under the hero CTA (approved wording) */}
      <p
        style={{ animationDelay: "1000ms" }}
        className="hero-rise mt-4 font-sans text-[0.875rem] leading-[1.45] text-ink-soft max-tab:hidden"
      >
        One paid trial video. Don&apos;t like it? Full refund, no questions asked.
      </p>
      <p
        style={{ animationDelay: "1100ms" }}
        className={`hero-rise mt-2 font-mono ${TEXT_META} tracking-[0.03em] text-ink-faint tab:whitespace-nowrap`}
      >
        {hero.reassurance}
      </p>
    </div>
  );
}
