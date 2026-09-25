"use client";

import { content } from "@/lib/content";
import { takeReels } from "@/lib/reelOrder";
import { HOT } from "@/lib/useInViewPlay";
import type { Reel } from "@/lib/reels.generated";
import { LazyVideo } from "@/components/ui/LazyVideo";

/* TWO WALLS OF FOUR VERTICAL LANES, side by side with a narrow seam between
   them — the /v3 hero's backdrop.

   Each wall fills its half of the screen with four columns of 9:16 tiles. The
   LEFT wall runs up and the RIGHT wall runs down: the seam between them is
   what lets the two travel opposite ways without the shear line that counter-
   running lanes inside one wall would cut (see the note on Work's rows). Within
   a wall every column runs the same way, on durations that share no common
   multiple, so the columns drift against each other and never lock step.

   Every column renders its set TWICE and slides by half its own length
   (lane-y), so the loop is seamless with no JS. SIX tiles per set is what
   keeps one set taller than the viewport at every shape that matters: a phone
   (two columns a wall, ~88px wide, 6 x ~170 = ~1020 against 844) and a
   2560x1080 monitor (~305px wide, 6 x ~555 against 1080) both clear it.

   Below `tab:` each wall drops to two columns; four would be ~40px tiles.

   Inert throughout: aria-hidden, no pointer events, and every tile is a
   LazyVideo on a lane of its own column so lib/useInViewPlay gates playback on
   visibility exactly as it does for the home hero's wall. */

const COLS = 4;
const WALLS = 2;
const PER_COL = 6;

/* Seconds for one full set to pass — distinct per column, no shared multiple
   worth reaching. */
const SECONDS = [58, 66, 61, 70, 64, 57, 69, 62];

/* Dealt once, column-major, across all eight columns, so no clip appears in
   two columns at once while the library holds enough to go round. A column
   short of PER_COL repeats its own clips, half a set away from the original. */
const LIBRARY = content.reels.videos;
const TOTAL = WALLS * COLS;
const COLUMNS: Reel[][] = (() => {
  const picks = takeReels(LIBRARY, 0, Math.min(LIBRARY.length, TOTAL * PER_COL));
  return Array.from({ length: TOTAL }, (_, c) => {
    const own = picks.filter((_, i) => i % TOTAL === c);
    return Array.from({ length: PER_COL }, (_, i) =>
      i < own.length ? own[i] : own[(i - Math.floor(PER_COL / 2) + own.length * PER_COL) % own.length]
    );
  });
})();

const GAP = "gap-[clamp(6px,0.9vw,12px)]";

/* THE TILT — ReelWallV6's, one flat plane per wall, mirrored so the two read
   as the walls of a corridor: each OUTER edge swings toward the viewer and the
   seam between them recedes. The right wall is the old wall's own transform,
   rotateY(-22deg) rotateX(4deg); the left is its mirror image.

   THE OVERHANG IS ReelWallV6's TOO, and for the same reasons. Vertically the
   stage runs 20% past the box at both ends so nothing bare shows as it tilts
   away; the lanes never stop, so that crop costs nothing. Horizontally the
   NEAR (outer) side magnifies and would overshoot the frame, so it is pulled
   in 6%. The FAR side, at the seam, projects small: left flush it fell ~65px
   short of the box at 1536 and ~90px at 1920, opening the seam into a wide
   wedge. So it runs 12% PAST its box and the box's overflow-hidden crops it,
   which keeps the seam at the boxes' own narrow gap. Measured at 820, 1024,
   1536 and 1920; retune both numbers together if the angle changes.

   From `tab:` up only, as on the old wall: below it each wall is two columns
   and the plain grid carries it. Written as literals because Tailwind scans
   source text. */
const LEFT_STAGE =
  "tab:absolute tab:-inset-y-[20%] tab:left-[6%] tab:-right-[12%] tab:h-auto " +
  "tab:[transform:rotateY(22deg)_rotateX(4deg)]";
const RIGHT_STAGE =
  "tab:absolute tab:-inset-y-[20%] tab:-left-[12%] tab:right-[6%] tab:h-auto " +
  "tab:[transform:rotateY(-22deg)_rotateX(4deg)]";

export function TwinWalls({ running, play }: { running: boolean; play: boolean }) {
  return (
    <div className="flex h-full w-full gap-[clamp(24px,4.5vw,88px)]">
      {Array.from({ length: WALLS }, (_, w) => (
        /* THE BOX: perspective lives here because the thing that rotates is
           its direct child, the stage. 900px, as on ReelWallV6. */
        <div key={w} className="relative h-full min-w-0 flex-1 overflow-hidden tab:[perspective:900px]">
          <div className={`flex h-full ${GAP} ${w === 0 ? LEFT_STAGE : RIGHT_STAGE}`}>
          {Array.from({ length: COLS }, (_, c) => {
            const ci = w * COLS + c;
            return (
              <div
                key={c}
                /* `contain` scopes each marquee's invalidation to its column. */
                className={`h-full min-w-0 flex-1 overflow-hidden [contain:layout_paint_style] ${
                  c >= 2 ? "hidden tab:block" : ""
                }`}
              >
                <div
                  /* Spaced by a margin under every tile, not a flex gap: a gap
                     leaves the doubled track half a gap short of two sets, and
                     the -50% loop would jump by that much. */
                  className={`flex animate-lane-y flex-col will-change-transform ${
                    w === 1 ? "[animation-direction:reverse]" : ""
                  } ${!running ? "[animation-play-state:paused]" : ""}`}
                  style={{ animationDuration: `${SECONDS[ci]}s` }}
                >
                  {[...COLUMNS[ci], ...COLUMNS[ci]].map((reel, i) => (
                    <div
                      key={i}
                      className="relative mb-[clamp(6px,0.9vw,12px)] aspect-[9/16] w-full flex-none overflow-hidden rounded-lg bg-[#1a1620] tab:rounded-xl"
                    >
                      <LazyVideo
                        lane={`v3-hero-col-${ci}`}
                        src={reel.src}
                        poster={reel.poster}
                        posterMode="element"
                        enabled={play}
                        policy={HOT}
                        className="relative size-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      ))}
    </div>
  );
}
