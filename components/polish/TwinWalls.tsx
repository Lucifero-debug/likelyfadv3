"use client";

import type { ReactNode } from "react";
import { content } from "@/lib/content-v6";
import { takeReels } from "@/lib/reelOrder";
import { HOT } from "@/lib/useInViewPlay";
import type { Reel } from "@/lib/reels.generated";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { TILE_HOVER, TILE_LIGHT } from "./Work";

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

   Inert by default: aria-hidden, no pointer events, and every tile is a
   LazyVideo on a lane of its own column so lib/useInViewPlay gates playback on
   visibility exactly as it does for the home hero's wall. Pass `onOpen` and
   the walls answer the pointer the way Work's rows do instead (/v5). */

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
   rotateY(-22deg), without its rotateX so the walls tilt from the sides only;
   the left is its mirror image.

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
  "tab:[transform:rotateY(22deg)]";
const RIGHT_STAGE =
  "tab:absolute tab:-inset-y-[20%] tab:-left-[12%] tab:right-[6%] tab:h-auto " +
  "tab:[transform:rotateY(-22deg)]";

/* THE MIDDLE: `children` stand in their own column between the two walls from
   `tab:` up. Below it there is no room for a column, so they lie over the
   walls on a dim of their own. Each wall is inert (aria-hidden, no pointer
   events); the middle is not, since it holds the hero's copy and CTAs. */
/* THE EDGE BLUR (opt-in, /v4). A vertical band (28% of the wall) on each
   wall's INNER edge —
   the side facing the copy column — that blurs progressively harder toward
   the column while the wall fades out under it (WALL_FADE), so the column reads as a frosted layer
   lying over the walls with the copy on it. Built like the nav's frost: a
   stack of backdrop blurs, each masked to fade out away from the seam, so the
   strength ramps instead of stepping. `to` is the direction of the seam. From
   `tab:` only; on a phone the copy already sits on its own full overlay. */
const EDGE_RAMP = [
  { blur: 1, solid: 60, reach: 100 },
  { blur: 2, solid: 45, reach: 85 },
  { blur: 4, solid: 30, reach: 68 },
  { blur: 8, solid: 15, reach: 50 },
  { blur: 16, solid: 0, reach: 34 },
] as const;

/* The wall itself dissolves into the column: an EASED mask (ease-in-out
   stops, so there is no visible start or end to the fade) from clear at the
   seam to solid 54% in. This is what removes the hard vertical cut where the
   wall's overflow clips the innermost tiles; with the blur ramp over it the
   footage softens, then fades, as if it runs on in behind the column. */
const WALL_FADE = {
  right:
    "tab:[mask-image:linear-gradient(to_left,rgb(0_0_0/0)_0%,rgb(0_0_0/0.04)_6%,rgb(0_0_0/0.14)_12%,rgb(0_0_0/0.3)_19%,rgb(0_0_0/0.5)_26%,rgb(0_0_0/0.7)_33%,rgb(0_0_0/0.86)_40%,rgb(0_0_0/0.96)_47%,#000_54%)]",
  left:
    "tab:[mask-image:linear-gradient(to_right,rgb(0_0_0/0)_0%,rgb(0_0_0/0.04)_6%,rgb(0_0_0/0.14)_12%,rgb(0_0_0/0.3)_19%,rgb(0_0_0/0.5)_26%,rgb(0_0_0/0.7)_33%,rgb(0_0_0/0.86)_40%,rgb(0_0_0/0.96)_47%,#000_54%)]",
} as const;

function EdgeBlur({ side }: { side: "left" | "right" }) {
  const to = side === "right" ? "to left" : "to right";
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 hidden w-[28%] tab:block ${side === "right" ? "right-0" : "left-0"}`}
    >
      {EDGE_RAMP.map(({ blur, solid, reach }) => {
        const mask = `linear-gradient(${to}, #000 0%, #000 ${solid}%, rgb(0 0 0 / 0) ${reach}%)`;
        return (
          <div
            key={blur}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
    </div>
  );
}

export function TwinWalls({
  running,
  play,
  children,
  edgeBlur = false,
  edgeFade = edgeBlur,
  onOpen,
}: {
  running: boolean;
  play: boolean;
  children?: ReactNode;
  /** The inner-edge blur band on each wall (see EdgeBlur). /v4 only. */
  edgeBlur?: boolean;
  /** The fade-out on each wall's inner edge (WALL_FADE). On with edgeBlur by
      default; /v5 keeps it without the blur so the walls still dissolve
      into the copy column instead of ending in a hard cut. */
  edgeFade?: boolean;
  /** Work's interaction on these walls: tiles become buttons that open the
      lightbox, hovering a column dims its other tiles and stops that column.
      Absent, the walls stay inert (/v3, /v4). */
  onOpen?: (reel: Reel) => void;
}) {
  return (
    <div className="relative flex h-full w-full">
      {Array.from({ length: WALLS }, (_, w) => [
        w === 1 && children ? (
          /* BELOW `tab:` THE COPY SITS OVER THE WALLS, and a flat 95% white
             over the whole panel hid the footage entirely. So the scrim is two
             layers: a 60% wash over the panel, which lets the wall read
             through above and below the copy, and a solid white plate behind
             the copy block alone (the wrapper's ::before). It was 40% and 95%;
             the 5% of footage left under the text read as a grey cast on
             phones, and the 12px pink and grey lines need 4.5:1 regardless.
             The plate rides on the copy rather than the panel, so it tracks
             the block at any phone height, runs out to the screen edges
             through the panel's padding, and fades over 64px top and bottom. */
          <div
            key="middle"
            className="absolute inset-0 z-10 flex items-center justify-center bg-paper/60 px-[clamp(24px,5vw,64px)] tab:static tab:w-auto tab:flex-none tab:bg-transparent tab:px-[clamp(20px,2.5vw,48px)]"
          >
            <div className="relative isolate w-full before:absolute before:-inset-x-[clamp(24px,5vw,64px)] before:-inset-y-16 before:-z-10 before:bg-[linear-gradient(to_bottom,rgb(251_249_246/0)_0%,rgb(251_249_246/1)_64px,rgb(251_249_246/1)_calc(100%-64px),rgb(251_249_246/0)_100%)] before:content-[''] tab:w-auto tab:before:hidden">
              {children}
            </div>
          </div>
        ) : null,
        /* THE BOX: perspective lives here because the thing that rotates is
           its direct child, the stage. 900px, as on ReelWallV6. */
        <div
          key={w}
          aria-hidden={onOpen ? undefined : "true"}
          className={`twin-wall-in ${onOpen ? "" : "pointer-events-none"} relative h-full min-w-0 flex-1 overflow-hidden tab:[perspective:900px] ${
            w === 0 ? "[--wall-from:-12%]" : "[--wall-from:12%]"
          } ${edgeFade ? WALL_FADE[w === 0 ? "right" : "left"] : ""}`}
        >
          <div className={`flex h-full ${GAP} ${w === 0 ? LEFT_STAGE : RIGHT_STAGE}`}>
          {Array.from({ length: COLS }, (_, c) => {
            const ci = w * COLS + c;
            return (
              <div
                key={c}
                /* `contain` scopes each marquee's invalidation to its column.

                   Interactive, a column gets Work's row treatment turned on its
                   side. -mx-3 px-3 is the room for the 1.05 hover scale:
                   overflow and paint containment clip at the padding box, so
                   without it a magnified tile loses its left and right edges.
                   The negative margin hands the padding straight back, so the
                   column's width and the gaps between columns do not move. */
                className={`h-full min-w-0 flex-1 overflow-hidden [contain:layout_paint_style] ${
                  c >= 2 ? "hidden tab:block" : ""
                } ${onOpen ? "-mx-3 px-3 hover:z-[3] [&:hover_button:not(:hover)]:opacity-45" : ""}`}
              >
                <div
                  /* Spaced by a margin under every tile, not a flex gap: a gap
                     leaves the doubled track half a gap short of two sets, and
                     the -50% loop would jump by that much. */
                  className={`flex animate-lane-y flex-col will-change-transform [&:has(button:hover)]:[animation-play-state:paused] ${
                    w === 1 ? "[animation-direction:reverse]" : ""
                  } ${!running ? "[animation-play-state:paused]" : ""}`}
                  style={{ animationDuration: `${SECONDS[ci]}s` }}
                >
                  {[...COLUMNS[ci], ...COLUMNS[ci]].map((reel, i) => {
                    const Frame = onOpen ? "button" : "div";
                    return (
                      <Frame
                        key={i}
                        tabIndex={-1}
                        aria-hidden={i >= PER_COL || undefined}
                        data-polish-reel
                        {...(onOpen
                          ? {
                              type: "button" as const,
                              onClick: () => onOpen(reel),
                              "aria-label": `Play reel ${ci * PER_COL + (i % PER_COL) + 1} full size`,
                            }
                          : null)}
                        className={`relative mb-[clamp(6px,0.9vw,12px)] block aspect-[9/16] w-full flex-none rounded-lg bg-[#1a1620] tab:rounded-xl ${
                          onOpen ? `${TILE_HOVER} ${TILE_LIGHT}` : ""
                        }`}
                      >
                      {/* Clipped on its own box, as in Work's Tile, so the
                          hover shadow (the ::after) can paint outside it. */}
                      <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
                      <LazyVideo
                        lane={`v3-hero-col-${ci}`}
                        src={reel.src}
                        poster={reel.poster}
                        posterMode="element"
                        enabled={play}
                        policy={HOT}
                        className="relative size-full object-cover"
                      />
                      </span>
                      </Frame>
                    );
                  })}
                </div>
              </div>
            );
          })}
          </div>
          {edgeBlur && <EdgeBlur side={w === 0 ? "right" : "left"} />}
        </div>,
      ])}
    </div>
  );
}
