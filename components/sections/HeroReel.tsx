"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { TEXT_H1, TEXT_LEAD, TEXT_META } from "@/lib/ui";
import { HERO_ROWS_OF_PICKS, WorkLanes } from "./Work";

const { hero } = content;

/* THE HERO — THE WORK FIRST, THE PITCH SECOND.

   The page opens on the work wall and nothing else: three rows of real client
   clips filling the screen, full bleed, with no headline over them. The wall is
   a backdrop here, not the exhibit — its tiles are inert pictures, so nothing
   answers hover or click. The interactive copy of it is the Work band further
   down.

   Scrolling is what brings the pitch in. The section is a tall scroll track
   with a sticky, one-screen stage inside it, and the scroll position through
   that track drives two things:

     THE COPY RISES from the bottom of the screen to its centre, over the wall.
     At rest its top sits 8.5rem above the bottom edge, so the kicker and the
     first line of the headline peek into view: that is the only cue to
     scroll, and it is the real content rather than a "scroll" label. A short
     fade at the bottom edge swallows the line below it, so the peek ends in a
     fade rather than in a glyph sliced in half.

     THE WALL BLURS AND DIMS underneath it, and recedes a little, so by the
     time the copy lands it is reading against a soft dark field instead of
     against moving footage.

   Both are written as CSS custom properties on the section (--r for the rise,
   eased; --b for the blur, linear) from one rAF-throttled scroll handler, so a
   frame costs one style write and no React render.

   THE TRACK IS 240svh: one screen of stage plus 140svh of scroll. The blur
   runs over the first 64% of that, the rise from 10% to 80%, and the last 20%
   holds the finished frame so it does not start leaving the moment it lands.

   REDUCED MOTION gets the finished frame and no track — a one-screen section
   with the copy centred on the blurred wall, and the clips held on posters. */

const TRACK = "h-[240svh] motion-reduce:h-svh";

/* The wall fills the stage's height exactly: three rows of 9:16 tiles with two
   row gaps between them, so tile width = (100svh - gaps) / 3 x 9/16. The gap
   is WorkLanes' own clamp at its 12px ceiling. */
const TILE_SIZE = "w-[calc((100svh-24px)*3/16)]";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Before paint, so a reload that lands mid-track never shows a frame at the
   wrong progress. */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* The headline's gradient run, split out of the copy's *asterisks*. Set as one
   inline span rather than through RevealText: the rise IS this hero's
   entrance, and a word reveal playing on load would be spent off screen. */
const [HEAD_PLAIN, HEAD_GRAD = ""] = hero.headline.split("*");

export function HeroReel() {
  const ref = useRef<HTMLElement>(null);
  const [play] = useState(() => typeof window !== "undefined" && !reduceMotion());
  const [inView, setInView] = useState(true);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduceMotion()) {
      el.style.setProperty("--r", "1");
      el.style.setProperty("--b", "1");
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const run = rect.height - window.innerHeight;
      const p = run > 0 ? clamp01(-rect.top / run) : 1;
      el.style.setProperty("--b", clamp01(p / 0.64).toFixed(4));
      el.style.setProperty("--r", easeOut(clamp01((p - 0.1) / 0.7)).toFixed(4));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  /* The marquees park once the hero has scrolled away, so they stop competing
     with the Work band's own lanes for frames. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* A keyboard user tabbing into the CTAs before the copy has risen would be
     focusing buttons parked below the fold of a sticky stage. Jump the track
     to its end instead, so focus always lands on copy that is in place. */
  const onFocusCopy = () => {
    const el = ref.current;
    if (!el) return;
    const end = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight - window.innerHeight;
    if (window.scrollY < end - 1) window.scrollTo({ top: end, behavior: "instant" });
  };

  return (
    <section
      ref={ref}
      aria-label="Introduction"
      data-nav-dark
      className={`relative ${TRACK} bg-[#17141b] text-[#f5f3f0] [--b:0] [--r:0]`}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* THE WALL. Inert: pointer-events off on the whole layer, every tile
            aria-hidden. It blurs, dims and recedes by --b. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center [transform:scale(calc(1-var(--b)*0.05))] [filter:blur(calc(var(--b)*14px))]"
        >
          <WorkLanes
            rows={HERO_ROWS_OF_PICKS}
            lane="hero-row"
            running={inView}
            play={play}
            size={TILE_SIZE}
            className="w-full"
          />
        </div>

        {/* The dim that the blur comes in with, so the copy reads against a
            dark field rather than against footage. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[rgba(23,20,27,0.62)] opacity-[var(--b)]"
        />

        {/* A fixed floor under the peeking copy, so the kicker and the first
            line are legible over bright clips before the dim arrives. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[34svh] bg-[linear-gradient(to_top,#17141b_8%,rgba(23,20,27,0))]"
        />

        {/* THE COPY. Centred on the stage, then pushed down by (1 - --r) of
            (50svh - 8.5rem + half its own height) — which puts its top edge
            8.5rem above the bottom when --r is 0, and exactly centred at 1.

            The ::before is a soft dark halo that travels WITH the copy. The
            dim only reaches full strength once the copy has landed, and on the
            way up the kicker and headline cross bright, still-sharp footage;
            the halo is what keeps them legible over it. */}
        <div className="absolute inset-0 flex items-center justify-center px-[clamp(24px,5vw,64px)]">
          <div
            onFocus={onFocusCopy}
            className="relative isolate flex max-w-[60rem] flex-col items-center text-center will-change-transform [transform:translate3d(0,calc((1-var(--r))*(50svh-8.5rem+50%)),0)] before:absolute before:-inset-x-[25%] before:-inset-y-[35%] before:-z-10 before:bg-[radial-gradient(closest-side,rgba(23,20,27,0.72),rgba(23,20,27,0))] before:content-['']"
          >
            <span
              className={`inline-flex items-center gap-[0.65em] font-mono ${TEXT_META} font-medium uppercase tracking-[0.22em] text-pink before:h-px before:w-[1.7rem] before:bg-current before:opacity-55 before:content-[''] after:h-px after:w-[1.7rem] after:bg-current after:opacity-55 after:content-['']`}
            >
              {hero.eyebrow}
            </span>

            <h1
              className={`mt-3 max-w-[18ch] text-balance font-display ${TEXT_H1} font-bold leading-[1.04] tracking-[-0.022em]`}
            >
              {HEAD_PLAIN}
              <span className="bg-[image:var(--grad)] box-decoration-clone bg-clip-text text-transparent">
                {HEAD_GRAD}
              </span>
            </h1>

            <p
              className={`mt-6 max-w-[48ch] text-pretty ${TEXT_LEAD} leading-[1.45] text-[#f5f3f0]/75`}
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
        </div>

        {/* The front edge: over the copy, so the peek fades out at the bottom
            of the screen instead of cutting a line in half. Gone by the time
            the copy lands, so it can never sit over the CTAs. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[4.5rem] bg-[linear-gradient(to_top,#17141b_30%,rgba(23,20,27,0))] opacity-[calc(1-var(--r))]"
        />
      </div>
    </section>
  );
}
