"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { takeReels } from "@/lib/reelOrder";
import { HOT } from "@/lib/useInViewPlay";
import type { Reel } from "@/lib/reels.generated";
import { Button } from "@/components/ui/Button";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Lightbox } from "@/components/ui/Lightbox";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DRIVE_LIBRARY_URL } from "@/lib/site";
import { ANCHOR, TEXT_META, WRAP } from "@/lib/ui";

const { work } = content;

/* THE WORK — THE LIBRARY RUNS THROUGH A GATE, AND THE SCROLL IS THE HANDLE.

   FOUR VERSIONS BEFORE THIS ONE WERE WALLS — flat rows, depth rows, a rotating
   drum, a grid — and each failed the same two tests in its own way. A marquee
   MOVES ON ITS OWN, so the visitor watches rather than does; and it shows
   whatever happens to be passing, so most of the library is never seen. The grid
   fixed the second and not the first: thirty-nine cells is a complete showcase
   and it is still a page you scroll past.

   SO THE SCROLL DRIVES THE STRIP DIRECTLY. The section is a tall track with a
   sticky, one-screen stage inside it — the same shape HeroReel already proves on
   this site. Scrolling does not move past the work; it pulls the entire library
   sideways through a fixed frame at the centre of the screen. Stop scrolling and
   the strip stops. Scroll back and it runs backwards. Every clip in the folder
   passes through the gate exactly once, in order, at full size.

   That is the thing none of the walls could be: the visitor is operating it.

   ── ONE CLIP PLAYS. THE OTHER THIRTY-EIGHT ARE POSTERS. ─────────────────────

   This is the cheapest version of this section that has ever existed, by a wide
   margin, and it is also the one that shows the work largest.

   The active index is derived from scroll position, and `enabled` is true only
   for it and its two immediate neighbours — the neighbours so the source is
   already attached by the time the gate reaches them and a clip is never caught
   still loading. Three <video> elements at their busiest, against ninety-six on
   the flat wall.

   Everything else in the strip is a lazy poster. `posterMode="element"` renders
   a real <img loading="lazy">, so the browser never fetches a frame for a clip
   the gate has not approached.

   ── WHAT RUNS PER FRAME ─────────────────────────────────────────────────────

   ONE TRANSFORM. The strip's translateX, written inline from a rAF-throttled
   scroll handler. No React render happens on a normal frame: `active` is state,
   but it is only set when the rounded index actually CHANGES, which is once
   every few hundred pixels of scroll rather than once a frame.

   WRITTEN STRAIGHT ONTO THE STRIP, NOT AS A CUSTOM PROPERTY ON THE SECTION.
   HeroReel's comments record what that costs: custom properties INHERIT, so a
   variable on the section invalidates the style of the whole subtree — every
   tile included — to move one element. An inline transform is not inherited.

   THE PITCH IS MEASURED, NOT ASSUMED. Travel is (N - 1) x the distance between
   two adjacent items, read once from the DOM on mount and again on resize, so
   the clamp on the item width can change without a number here changing with it.

   ── REDUCED MOTION GETS A REAL ALTERNATIVE ──────────────────────────────────

   Not a frozen strip. The track collapses to a single screen and the strip
   becomes a native snap-scrolling rail — same markup, same clips, driven by the
   browser's own scrolling instead of by a handler. Nothing is hijacked. */

const LIBRARY = content.reels.videos;
/* The whole folder, in the spread order, dealt once. No count, no repeats: add
   clips to Drive and the strip gets longer. */
const ALL = takeReels(LIBRARY, 0, LIBRARY.length);

/* How much scroll buys the whole strip. Roughly a screen and a half per ten
   clips: long enough that a clip is readable as it crosses, short enough that
   the section does not become the page. */
const TRACK_SVH = Math.round(120 + ALL.length * 14);

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* The gate is 9:16 and sized off the stage height, so the clip is as large as a
   screen allows and the neighbours either side are what tell you it is a strip. */
const ITEM = "h-[min(62svh,calc(78vw*16/9))] aspect-[9/16] flex-none";

export function WorkCorridor() {
  const trackRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<Reel | null>(null);
  const [motion] = useState(() => typeof window !== "undefined" && !reduceMotion());

  useIsoLayoutEffect(() => {
    const track = trackRef.current;
    const strip = stripRef.current;
    if (!track || !strip || !motion) return;

    /* Measured rather than computed from the clamp: item + gap, taken from the
       first two children. Re-read on resize, which is the only thing that can
       change it. */
    let travel = 0;
    const measure = () => {
      const a = strip.children[0] as HTMLElement | undefined;
      const b = strip.children[1] as HTMLElement | undefined;
      const pitch = a && b ? b.offsetLeft - a.offsetLeft : 0;
      travel = pitch * (ALL.length - 1);
    };

    let lastX = -1;
    let lastI = -1;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const run = rect.height - window.innerHeight;
      const p = run > 0 ? clamp01(-rect.top / run) : 0;

      const x = -(p * travel);
      if (x !== lastX) {
        lastX = x;
        strip.style.transform = `translate3d(${x}px,0,0)`;
      }

      /* State only when the gate actually changes clip — a few times per
         section, not sixty times a second. */
      const i = Math.round(p * (ALL.length - 1));
      if (i !== lastI) {
        lastI = i;
        setActive(i);
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      lastX = -1;
      schedule();
    };

    measure();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, [motion]);

  return (
    <section
      ref={trackRef}
      id="work"
      aria-label={work.kicker}
      data-nav-dark
      className={`${ANCHOR} relative bg-[radial-gradient(120%_80%_at_50%_0%,#241d2b,#17141b_70%)] text-[#f5f3f0] ${
        motion ? "" : "py-[clamp(72px,9vw,128px)]"
      }`}
      style={motion ? { height: `${TRACK_SVH}svh` } : undefined}
    >
      <div
        className={
          motion
            ? "sticky top-0 flex h-svh flex-col justify-center overflow-hidden"
            : "flex flex-col overflow-hidden"
        }
      >
        <div className={`${WRAP} mb-[clamp(20px,3vw,36px)]`}>
          <SectionHeading kicker={work.kicker} heading={work.heading} tone="bright" />
        </div>

        {/* THE STRIP. Padded by half a screen at each end so the FIRST clip
            starts centred in the gate and the LAST one finishes there — without
            it the strip would begin flush left and the gate would open on empty
            space. Under reduced motion the same padding makes a snap rail that
            centres properly at both ends. */}
        <div
          className={
            motion
              ? "relative"
              : "relative snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
          }
        >
          <div
            ref={stripRef}
            className={`flex w-max items-center gap-[clamp(10px,1.4vw,20px)] px-[calc(50vw-min(31svh,39vw))] ${
              motion ? "will-change-transform" : ""
            }`}
          >
            {ALL.map((reel, i) => {
              const near = Math.abs(i - active) <= 1;
              const isActive = motion && i === active;
              return (
                <button
                  key={reel.id ?? i}
                  type="button"
                  onClick={() => setOpen(reel)}
                  aria-label={`Play reel ${i + 1} of ${ALL.length} full size`}
                  className={`${ITEM} group relative isolate snap-center overflow-hidden rounded-2xl bg-[#1a1620] ring-1 ring-white/10 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,0.7,0.2,1)] focus-visible:outline-2 focus-visible:outline-offset-[4px] focus-visible:outline-white ${
                    motion
                      ? isActive
                        ? "scale-100 opacity-100"
                        : "scale-[0.88] opacity-40"
                      : "opacity-100"
                  }`}
                >
                  <LazyVideo
                    lane="gate"
                    src={reel.src}
                    poster={reel.poster}
                    posterMode="element"
                    /* Only the gate and its two neighbours attach a source —
                       the neighbours so the clip is never caught loading as it
                       arrives. Under reduced motion nothing plays at all. */
                    enabled={motion && near}
                    policy={HOT}
                    className="absolute inset-0 size-full object-cover"
                  />
                </button>
              );
            })}
          </div>

          {/* THE GATE. Two scrims that darken everything outside the centre
              column, so the clip in the frame is the only one at full strength.
              Painted, not masked: a mask forces the strip beneath it through an
              extra compositing pass on every frame of the scrub. */}
          {motion && (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 z-[3] w-[calc(50vw-min(31svh,39vw))] bg-[linear-gradient(to_right,#17141b_35%,rgba(23,20,27,0))]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 z-[3] w-[calc(50vw-min(31svh,39vw))] bg-[linear-gradient(to_left,#17141b_35%,rgba(23,20,27,0))]"
              />
            </>
          )}
        </div>

        {/* THE COUNTER AND THE RAIL — the only things that tell you how far
            through the folder you are, and the reason the strip does not need a
            scrollbar. The rail's fill is a transform-scaled bar rather than a
            width, so it animates on the compositor. */}
        {motion && (
          <div className={`${WRAP} mt-[clamp(18px,2.4vw,32px)] flex items-center gap-4`}>
            <span className={`font-mono ${TEXT_META} tabular-nums tracking-[0.06em] text-white/70`}>
              {String(active + 1).padStart(2, "0")}
              <span className="text-white/35"> / {String(ALL.length).padStart(2, "0")}</span>
            </span>
            <span className="relative h-px flex-1 bg-white/15">
              <span
                aria-hidden
                className="absolute inset-0 origin-left bg-[image:var(--grad)]"
                style={{
                  transform: `scaleX(${ALL.length > 1 ? active / (ALL.length - 1) : 1})`,
                }}
              />
            </span>
            <Button
              href={DRIVE_LIBRARY_URL}
              external
              variant="light"
              withArrow
              ariaLabel={work.ctaAria}
            >
              {work.cta}
            </Button>
          </div>
        )}

        {!motion && (
          <div className={`${WRAP} mt-[clamp(24px,3vw,40px)] flex justify-center`}>
            <Button
              href={DRIVE_LIBRARY_URL}
              external
              variant="light"
              withArrow
              ariaLabel={work.ctaAria}
            >
              {work.cta}
            </Button>
          </div>
        )}
      </div>

      <p className="sr-only">{work.description}</p>

      {open && <Lightbox reel={open} onClose={() => setOpen(null)} />}
    </section>
  );
}