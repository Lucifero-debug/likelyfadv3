"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { TEXT_H1, TEXT_LEAD, TEXT_META } from "@/lib/ui";
import { HERO_ROWS_OF_PICKS, WorkLanes } from "@/components/sections/Work";
import { mountHeroField } from "./heroField";
import { Magnetic } from "./Magnetic";

const { hero } = content;

/* V7 HERO — HeroReel, plus a WebGL field under the copy (see heroField.ts).
   Everything below is HeroReel's own note and still holds; the only changes
   are the field layer, which rides the same `b` as the dim, a word-by-word
   settle on the headline as `r` completes, and a magnetic primary CTA.

   THE HERO — THE WORK FIRST, THE PITCH SECOND.

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
     first line of the headline peek into view. A short
     fade at the bottom edge swallows the line below it, so the peek ends in a
     fade rather than in a glyph sliced in half.

     THE WALL BLURS AND DIMS underneath it, and recedes a little, so by the
     time the copy lands it is reading against a soft dark field instead of
     against moving footage.

     THE SCROLL CUE, a vertical "Scroll" label over a line with a pink bead
     running down it, sits in the bottom-right corner, clear of the centred
     peek, and fades out over the first stretch of the blur, so it is gone
     long before the copy lands.

   Both come from one rAF-throttled scroll handler (r for the rise, eased; b
   for the blur, linear), and no React render.

   WRITTEN STRAIGHT ONTO THE FOUR ELEMENTS THAT USE THEM, NOT AS CUSTOM
   PROPERTIES ON THE SECTION. They used to be --r and --b on the <section>, read
   through var() below — and custom properties INHERIT, so every scroll frame
   invalidated the style of the whole subtree, all ninety-six wall tiles
   included, to change four elements. Measured on the production build, that
   was ~120ms of style recalculation per second of scrolling against ~60 with
   the wall gone. An inline transform, filter or opacity is not inherited, so
   each write now restyles one element.

   THE BLUR IS A FIXED RADIUS THAT FADES IN, NOT A RADIUS THAT GROWS. It used
   to be `filter: blur(b * 14px)` on the wall itself, and that was what made the
   rise stutter: a new radius every scroll frame, over a full-screen layer of
   moving marquees and playing video, while the wall was also being rescaled,
   forced the GPU to rebuild the whole filtered surface on every frame. Now the
   dim layer carries `backdrop-filter: blur(14px)` at one constant radius and
   only its OPACITY follows b, so the sharp wall and the blurred one crossfade.
   The wall itself carries no filter at all and only receives the scale.

   AND THE BACKDROP BLUR IS REMOVED, NOT SET TO ZERO OPACITY, UNTIL b BEGINS. A
   transparent backdrop filter is still a backdrop filter: it would re-sample
   the moving wall on every frame of the resting hero to draw nothing.

   THE TRACK IS 180svh: one screen of stage plus 80svh of scroll. The blur
   runs over the first 64% of that, the rise from 10% to 80%, and the last 20%
   holds the finished frame so it does not start leaving the moment it lands.

   REDUCED MOTION gets the finished frame and no track — a one-screen section
   with the copy centred on the blurred wall, and the clips held on posters. */

const TRACK = "h-[180svh] motion-reduce:h-svh";

/* The wall fills the stage's height exactly: three rows of 9:16 tiles with two
   row gaps between them, so tile width = (100svh - gaps) / 3 x 9/16. The gap
   is WorkLanes' own clamp at its 12px ceiling. */
const TILE_SIZE = "w-[calc((100svh-24px)*3/16)]";

/* The same size as a number, plus WorkLanes' 12px gap, so the lanes can render
   only the tiles that span the screen — see usePitchRowLength. innerHeight
   stands in for 100svh; where the two differ it overstates the tile, which
   understates the count, so the extra two tiles in that hook are the margin. */
const TILE_PITCH = (_vw: number, vh: number) => ((vh - 24) * 3) / 16 + 12;

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

export function HeroV7() {
  const ref = useRef<HTMLElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const [play] = useState(() => typeof window !== "undefined" && !reduceMotion());
  const [inView, setInView] = useState(true);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    const wall = wallRef.current;
    const dim = dimRef.current;
    const copy = copyRef.current;
    const edge = edgeRef.current;
    const cue = cueRef.current;
    const fieldHost = fieldRef.current;
    const head = headRef.current;
    if (!el || !wall || !dim || !copy || !edge || !cue || !fieldHost || !head) return;

    const field = mountHeroField(fieldHost);

    /* The last values written, so a frame whose progress rounds to the same
       numbers writes nothing at all. */
    let lastB = -1;
    let lastR = -1;
    const apply = (b: number, r: number) => {
      if (b !== lastB) {
        lastB = b;
        wall.style.transform = b > 0 ? `scale(${1 - b * 0.05})` : "";
        const blur = b > 0 ? "blur(14px)" : "";
        dim.style.backdropFilter = blur;
        dim.style.setProperty("-webkit-backdrop-filter", blur);
        dim.style.opacity = String(b);
        cue.style.opacity = String(clamp01(1 - b * 4));
        field?.setLevel(b);
      }
      if (r !== lastR) {
        lastR = r;
        copy.style.transform = `translate3d(0,calc(${1 - r} * (50svh - 8.5rem + 50%)),0)`;
        edge.style.opacity = String(1 - r);
        /* The words settle once the copy is nearly home: tracked out and
           lifted while it travels, locked tight as it lands. */
        if (r > 0.92) head.dataset.landed = "";
        else delete head.dataset.landed;
      }
    };

    if (reduceMotion()) {
      apply(1, 1);
      return () => field?.dispose();
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const run = rect.height - window.innerHeight;
      const p = run > 0 ? clamp01(-rect.top / run) : 1;
      apply(+clamp01(p / 0.64).toFixed(4), +easeOut(clamp01((p - 0.1) / 0.7)).toFixed(4));
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
      field?.dispose();
    };
  }, []);

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
      className={`relative ${TRACK} bg-[#17141b] text-[#f5f3f0]`}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* THE WALL. Inert: pointer-events off on the whole layer, every tile
            aria-hidden. It recedes by b, written inline. */}
        <div
          ref={wallRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center"
        >
          <WorkLanes
            rows={HERO_ROWS_OF_PICKS}
            lane="hero-row"
            running={inView}
            play={play && inView}
            size={TILE_SIZE}
            pitch={TILE_PITCH}
            className="w-full"
          />
        </div>

        {/* The dim, and the fixed-radius backdrop blur that fades in with it
            (see the head of the file), so the copy reads against a
            dark field rather than against footage. */}
        <div
          ref={dimRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[rgba(23,20,27,0.62)] opacity-0"
        />

        {/* THE FIELD — WebGL, mounted by heroField.ts, faded in by b. */}
        <div
          ref={fieldRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0"
        />

        {/* A fixed floor under the peeking copy, so the kicker and the first
            line are legible over bright clips before the dim arrives. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[34svh] bg-[linear-gradient(to_top,#17141b_8%,rgba(23,20,27,0))]"
        />

        {/* THE COPY. Centred on the stage, then pushed down by (1 - r) of
            (50svh - 8.5rem + half its own height) — which puts its top edge
            8.5rem above the bottom when r is 0, and exactly centred at 1. The
            class is that r = 0 frame, so the server and a script-less page
            render the peek; the scroll handler takes over inline.

            The ::before is a soft dark halo that travels WITH the copy. The
            dim only reaches full strength once the copy has landed, and on the
            way up the kicker and headline cross bright, still-sharp footage;
            the halo is what keeps them legible over it. */}
        <div className="absolute inset-0 flex items-center justify-center px-[clamp(24px,5vw,64px)]">
          <div
            ref={copyRef}
            onFocus={onFocusCopy}
            className="relative isolate flex max-w-[60rem] flex-col items-center text-center will-change-transform [transform:translate3d(0,calc(50svh-8.5rem+50%),0)] before:absolute before:-inset-x-[25%] before:-inset-y-[35%] before:-z-10 before:bg-[radial-gradient(closest-side,rgba(23,20,27,0.72),rgba(23,20,27,0))] before:content-['']"
          >
            <span
              className={`inline-flex items-center gap-[0.65em] font-mono ${TEXT_META} font-medium uppercase tracking-[0.22em] text-pink before:h-px before:w-[1.7rem] before:bg-current before:opacity-55 before:content-[''] after:h-px after:w-[1.7rem] after:bg-current after:opacity-55 after:content-['']`}
            >
              {hero.eyebrow}
            </span>

            <h1
              ref={headRef}
              className={`group/head mt-3 max-w-[18ch] text-balance font-display ${TEXT_H1} font-bold leading-[1.04] tracking-[-0.022em]`}
            >
              <HeadWords text={HEAD_PLAIN} from={0} />
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
              <Magnetic>
                <Button contact variant="grad" withArrow>
                  {hero.primaryCta}
                </Button>
              </Magnetic>
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
          ref={edgeRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[4.5rem] bg-[linear-gradient(to_top,#17141b_30%,rgba(23,20,27,0))]"
        />

        {/* THE SCROLL CUE. Faded out by b, written inline; absent under
            reduced motion, where there is no track to scroll through. */}
        <div
          ref={cueRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 right-[clamp(24px,5vw,64px)] flex flex-col items-center gap-3 motion-reduce:hidden"
        >
          <span
            className={`font-mono ${TEXT_META} font-medium uppercase tracking-[0.22em] text-[#f5f3f0]/75 [writing-mode:vertical-rl]`}
          >
            Scroll
          </span>
          <span className="relative h-12 w-px overflow-hidden bg-white/25">
            <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-pink" />
          </span>
        </div>
      </div>
    </section>
  );
}

/* The plain run of the headline, one span per word. While the copy travels
   each word sits slightly lifted and faded in sequence; when the h1 carries
   data-landed they drop into place one after another. The gradient run is
   left whole — splitting it would restart the gradient on every word. */
function HeadWords({ text, from }: { text: string; from: number }) {
  const words = text.split(/(\s+)/);
  let n = from;
  return (
    <>
      {words.map((w, i) => {
        if (/^\s+$/.test(w) || !w) return w;
        const k = n++;
        return (
          <span
            key={i}
            style={{ transitionDelay: `${k * 45}ms` }}
            className="inline-block translate-y-[0.12em] opacity-70 transition-[transform,opacity] duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[landed]/head:translate-y-0 group-data-[landed]/head:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            {w}
          </span>
        );
      })}
    </>
  );
}
