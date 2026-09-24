"use client";

import { useState } from "react";
import { content } from "@/lib/content";
import { takeReels } from "@/lib/reelOrder";
import { HOT } from "@/lib/useInViewPlay";
import type { Reel } from "@/lib/reels.generated";
import { Button } from "@/components/ui/Button";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Lightbox } from "@/components/ui/Lightbox";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DRIVE_LIBRARY_URL } from "@/lib/site";
import { ANCHOR, HEAD_GAP, SECTION, TEXT_META, WRAP } from "@/lib/ui";

const { work } = content;

/* THE WORK — THE WHOLE LIBRARY, LAID OUT.

   WHY THIS IS A GRID AND NOT ANOTHER MOVING WALL. Three versions before this one
   were walls: flat rows, depth rows, a rotating drum. All three had the same two
   problems. They were INERT, because 3D and clickable tiles cannot coexist —
   `preserve-3d` plus a clipping ancestor makes Chrome paint a tile in its
   projected position and hit-test it at its untransformed box, so avoiding that
   bug is what kept forcing every tile to be a div. And they were LOSSY: a
   marquee shows whatever happens to be passing, so most of the library is off
   screen at any moment and the visitor never sees the rest.

   A GRID FIXES BOTH AT ONCE. Every clip in the library is on the page, all of
   them at the same time, every one of them clickable, in an order the eye can
   actually work through. Nothing is rotated, so hit-testing is exactly where the
   pixels are.

   IT ALSO SCALES WITH THE FOLDER, WHICH IS THE PART THAT MATTERS LONG TERM. The
   wall dealt a fixed 48 tiles out of a 39-clip library and needed a whole
   column-major deal plus a half-cycle offset so its repeats did not land next to
   each other. This renders `content.reels.videos` and stops. Add ten clips to
   Drive, re-run the sync, and ten more cells appear. Nothing here has a count in
   it.

   ── WHAT IT COSTS, WHICH IS LESS THAN THE WALL ──────────────────────────────

   39 TILES, AGAINST 96. A marquee has to render its set TWICE per row to wrap
   seamlessly, so three rows of sixteen was ninety-six elements to show forty-
   eight clips. A grid renders each clip once. Fewer elements, and every one of
   them is a clip the visitor can actually reach.

   NOTHING ANIMATES CONTINUOUSLY. There is no marquee, so no lane drags a
   will-change track every frame, and `near` gating is unnecessary because there
   is nothing running to park. The section's motion is the clips themselves.

   PLAYBACK IS STILL CAPPED, and it has to be: thirty-nine cells means a tall
   section and a dozen or more visible at once. Every tile is a LazyVideo on one
   of three lanes, so lib/useInViewPlay withholds the source until a tile is near,
   caps concurrent playback per lane, and staggers the starts. Three lanes rather
   than one so the budget spreads across the grid instead of filling the first
   dozen cells and starving the rest.

   THE POSTER IS THE REAL WORKHORSE. `posterMode="element"` renders a lazy <img>
   rather than setting the poster attribute, so the browser defers every cell
   below the fold — entering the section pays for the visible rows and the rest
   arrive as you scroll. A poster attribute is never lazy and would have fetched
   all thirty-nine on mount.

   ── THE HOVER IS THE PAGE'S OWN IDIOM ───────────────────────────────────────

   Hovering a cell dims every OTHER cell rather than brightening the one under
   the pointer, which is what WorkLanes already does to its rows. `:not(:hover)`
   rather than dim-all-then-undim-one: two rules writing opacity at equal
   specificity would have their winner decided by emit order.

   OPACITY, TRANSFORM AND A CROSS-FADED SHADOW — never a transitioned box-shadow.
   A shadow in a transition repaints its blur every frame; a second shadow layer
   faded in over the resting one composites instead. Same rule Work.tsx's tile
   comment sets out, same reason. */

const LIBRARY = content.reels.videos;
/* takeReels with the full length: the spread ordering still applies, so two
   clips from one shoot do not land side by side, but nothing is dealt twice and
   nothing repeats. */
const ALL = takeReels(LIBRARY, 0, LIBRARY.length);

const CELL =
  "group/cell relative isolate aspect-[9/16] overflow-hidden rounded-xl bg-[#1a1620] " +
  "ring-1 ring-white/10 " +
  "transition-[opacity,transform] duration-[280ms] ease-[cubic-bezier(0.22,0.7,0.2,1)] " +
  "hover:scale-[1.04] hover:z-[2] " +
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] " +
  "after:shadow-[0_22px_58px_rgba(0,0,0,0.62)] after:opacity-0 after:content-[''] " +
  "after:transition-opacity after:duration-[280ms] hover:after:opacity-100 " +
  "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white";

export function WorkGrid() {
  const [active, setActive] = useState<Reel | null>(null);

  return (
    <section
      id="work"
      aria-label={work.kicker}
      data-nav-dark
      className={`${SECTION} ${ANCHOR} relative [content-visibility:auto] [contain-intrinsic-size:auto_2400px] bg-[radial-gradient(120%_70%_at_50%_-6%,#241d2b,#17141b_68%)] text-[#f5f3f0]`}
    >
      <div className={WRAP}>
        <div className={HEAD_GAP}>
          <SectionHeading kicker={work.kicker} heading={work.heading} tone="bright" />
          <Reveal delay={100}>
            <p
              className={`mt-3 text-center font-mono ${TEXT_META} leading-1.2 tracking-[0.04em] text-ink-dim`}
            >
              {work.sub}
            </p>
          </Reveal>
        </div>

        {/* THE GRID. Column count is pure CSS at every breakpoint, so nothing
            here reads the viewport and nothing can desync between the server and
            the client — the whole class of bug useLeanWall exists to manage on
            the marquee walls simply does not arise.

            The dim-the-others rule lives on the grid rather than on a row, since
            here the whole field is one group. */}
        <div
          className={
            "grid grid-cols-2 gap-2 phone:grid-cols-3 tab:grid-cols-4 lap:grid-cols-6 lap:gap-3 " +
            "[&:hover_button:not(:hover)]:opacity-40"
          }
        >
          {ALL.map((reel, i) => (
            /* The stagger runs across the ROW, not the whole grid — six cells at
               55ms each, then it resets. Over thirty-nine cells a running
               stagger would still be arriving long after the reader got there,
               which is the same call the pillars in WhyUs make. */
            <Reveal key={reel.id ?? i} delay={(i % 6) * 55}>
              <button
                type="button"
                onClick={() => setActive(reel)}
                aria-label={`Play reel ${i + 1} full size`}
                className={`${CELL} w-full`}
              >
                <LazyVideo
                  lane={`grid-${i % 3}`}
                  src={reel.src}
                  poster={reel.poster}
                  posterMode="element"
                  policy={HOT}
                  className="absolute inset-0 size-full object-cover"
                />

                {/* The foot and the index, always on: a cell this size needs
                    something anchoring it as one of a numbered set, and a
                    gradient keeps the digits legible over a bright frame
                    without putting a solid bar across the shot. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-[linear-gradient(to_top,rgba(14,12,17,0.8),rgba(14,12,17,0))]"
                />
                <span
                  aria-hidden
                  className={`pointer-events-none absolute bottom-2 left-2.5 font-mono ${TEXT_META} tabular-nums tracking-[0.04em] text-white/70`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* The prompt, only on the cell under the pointer. Opacity and
                    transform, nothing that repaints. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-2 right-2.5 translate-y-1 rounded-full bg-white/12 px-2.5 py-1 text-[0.7rem] font-medium text-white opacity-0 transition-[opacity,transform] duration-300 group-hover/cell:translate-y-0 group-hover/cell:opacity-100 group-focus-visible/cell:translate-y-0 group-focus-visible/cell:opacity-100"
                >
                  View
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <div className={`${WRAP} mt-[clamp(32px,4.5vw,64px)] flex flex-col items-center gap-4`}>
        <Reveal>
          <Button
            href={DRIVE_LIBRARY_URL}
            external
            variant="light"
            withArrow
            ariaLabel={work.ctaAria}
          >
            {work.cta}
          </Button>
        </Reveal>
      </div>

      <p className="sr-only">{work.description}</p>

      {active && <Lightbox reel={active} onClose={() => setActive(null)} />}
    </section>
  );
}