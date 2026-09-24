# 003 — Give the Corridor its own play policy, tuned from a trace

- **Severity:** HIGH if the trace confirms it, otherwise close this plan without changes
- **Written against:** `e6cc2e7`
- **Depends on:** 001 and 002, both done and verified. **Measure first.** After those two, this may not be needed.
- **Files:** `lib/useInViewPlay.ts` (add one export), `components/sections/WorkCorridor.tsx` (one import, one prop)

## Problem

Every wall on the home page plays on the `HOT` policy (`lib/useInViewPlay.ts`, ~line 297):

```ts
export const HOT: PlayPolicy = {
  cap: Number.POSITIVE_INFINITY,
  dwell: 0,
  stagger: START_STAGGER_MS,
  pauseOnScroll: false,
  margin: "150px",
};
```

With no cap, every tile within 150px of the viewport decodes at once. Each playing `<video>` is its own decoder, uploading a fresh texture to the GPU 30 times a second and compositing as its own layer. The file's head comment calls **instance count** the real cost. The Corridor shows more tiles than Work did, because its back rows are shrunk by depth (`DEPTHS` in `WorkCorridor.tsx`, widths 104% / 114% / 126%), so more fit across the viewport.

**This is a settled decision, so tread carefully.** The comment above `HOT` explains why the cap was removed: a cap freezes tiles at the lane's feeding edge ("a tile sitting still next to tiles that are moving"). The same comment names what to undo first if a trace goes bad:

- `pauseOnScroll`: "This is the expensive half of the change and the one to put back first if a trace goes bad."
- `cap`: "NO CAP AT ALL, WHICH IS A DELIBERATE REVERSAL AND THE ONE TO UNDO FIRST IF A TRACE GOES BAD."

So this plan **does not modify `HOT`**. The hero still uses it. It adds a Corridor-only policy and applies the two documented levers in order, stopping as soon as the trace is clean.

## Step 0 — Measure (required; stop here if clean)

On a production build (`npm run build && npm run start`), in Chrome at 1440x900 and again at 1920x1080:

1. DevTools > Performance, CPU 4x slowdown, enable "Screenshots". Record 5s parked in the Corridor with the hero fully off screen, then 5s scrolling slowly through it.
2. Open DevTools > Rendering > **Frame Rendering Stats** and note the dropped or partially-presented frame rate.
3. Console: `[...document.querySelectorAll('#work video')].filter(v => !v.paused).length`. Note the count.

**Decision:** if frames are steady (no long bars in the Frames track, no visible hitching) while parked **and** while scrolling, mark this plan `NOT NEEDED` in `plans/README.md` and stop. Otherwise continue.

## Step 1 — Add a Corridor policy that pauses clips while scrolling

In `lib/useInViewPlay.ts`, directly **after** the closing `};` of `export const HOT`, add:

```ts
/* THE CORRIDOR'S POLICY: HOT WITH THE SCROLL PAUSE PUT BACK, which is the lever
   the note on HOT names first. The Corridor is the exhibit, so it keeps HOT's
   zero dwell, uncapped lane and 150px lead; what it gives back is the decoders
   running straight through a scroll gesture, on a page whose scroll is driven
   from the main thread by Lenis. Clips hold on playbackRate = 0 while the page
   moves (see watchScrolling), and the marquee keeps running. */
export const CORRIDOR: PlayPolicy = {
  ...HOT,
  pauseOnScroll: true,
};
```

In `components/sections/WorkCorridor.tsx`:

- change `import { HOT } from "@/lib/useInViewPlay";` to `import { CORRIDOR } from "@/lib/useInViewPlay";`
- in `Tile`, change `policy={HOT}` to `policy={CORRIDOR}`.

`CORRIDOR` is a module-level constant, so it is a stable reference. `useInViewPlay`'s effect depends on `policy`, and a fresh object per render would re-register every tile. Never inline the object in JSX.

**Re-measure (Step 0).** If the scrolling recording is now clean and the parked one was already clean, stop here and record the numbers in the README.

## Step 2 — Only if parked frames still drop: cap the two back rows

The back rows are dimmed by a scrim (`dim: 0.22` and `0.42` in `DEPTHS`) and projected smaller, so a clip held on its poster there is the least visible place to save a decoder. The front row stays uncapped.

1. Measure how many tiles each row holds as "visible". While parked at 1920x1080, run:
   ```js
   [...document.querySelectorAll('#work [class*="animate-lane-x"]')].map(
     t => [...t.querySelectorAll('video')].filter(v => !v.paused).length)
   ```
   Call the result `[f, m, b]`, the playing count per row with no cap.
2. In `lib/useInViewPlay.ts`, add below `CORRIDOR`:
   ```ts
   /* The dimmed back rows, one decoder short of full. FIFO holds the newest
      arrival, which on these lanes is at the right edge, under the 12% fade. */
   export const CORRIDOR_BACK: PlayPolicy = { ...CORRIDOR, cap: <b - 1> };
   ```
   Write the literal integer measured, not an expression. Use **one** cap for both back rows: the larger of `m - 1` and `b - 1`.
3. In `WorkCorridor.tsx`, pass the policy per row. `Tile` receives `lane={\`corridor-row-${ri}\`}`. Add a `policy` prop to `Tile` of type `PlayPolicy` (import the type from `@/lib/useInViewPlay`), and at the call site pass `policy={ri === 0 ? CORRIDOR : CORRIDOR_BACK}`.

   Lane policy is fixed at lane creation (`bucket.policy` in `useInViewPlay`), and each row is its own lane, so this is consistent.

**Re-measure.** Then do the feel-check below. If a still poster is visible **outside** the right-edge fade, raise the cap by 1 and re-check. If the cap reaches the uncapped count, revert Step 2 entirely: it buys nothing.

## Scope boundaries: do NOT

- Do not change `HOT`, `STANDARD`, `PER_LANE`, `START_STAGGER_MS`, `THRESHOLD`, or any other existing constant.
- Do not change the hero's policy, or `ReelWallV6.tsx`.
- Do not lower `margin` below `"150px"` or raise it above `"200px"` (it must not exceed LazyVideo's `ATTACH_MARGIN`; see the `margin` doc on `PlayPolicy`).
- Do not add a cap to the front row.

## Verification

1. `npx tsc --noEmit` and `npm run lint` pass.
2. Before/after numbers from Step 0 go in `plans/README.md` next to this plan's status: dropped-frame %, playing count, and `computeIntersections` / decode time from Bottom-Up.
3. Feel-checks, at 1440 and at 1920:
   - **Parked:** watch the Corridor for 15s. No tile anywhere outside the fades should sit on a still frame while its neighbours move. A still tile reads as broken, not pending; this is the failure the `HOT` comment warns about.
   - **Scrolling:** clips freeze on their current frame during a scroll and resume within about 160ms of stopping, without a hitch on resume after short nudges. Clips are held with `playbackRate = 0`, and the registry switches to a real `pause()` only after a long continuous gesture (see the constants near `SCROLL_IDLE_MS` in `lib/useInViewPlay.ts`). If short nudges hitch on every stop, report it rather than fixing it here.
   - DevTools > Rendering > "Emulate CSS prefers-reduced-motion: reduce": nothing plays (unchanged).
