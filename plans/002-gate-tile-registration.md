# 002 — Stop off-screen walls from registering their tiles

- **Severity:** HIGH (performance: main-thread work on every frame, felt as scroll jank under Lenis)
- **Written against:** `e6cc2e7`
- **Depends on:** 001 (the Corridor must be in Work's slot, below the hero)
- **Files:** `components/sections/WorkCorridor.tsx`, `components/sections/HeroReel.tsx`

## Problem

Every video tile is a `LazyVideo` (`components/ui/LazyVideo.tsx`). A tile with `enabled={true}` registers with two shared IntersectionObservers (the browser API that reports when an element enters or leaves the screen) **as soon as it mounts**:

- the **attach** observer in `LazyVideo.tsx`, which is one-shot: it drops each tile once that tile comes near;
- the **playback registry** in `lib/useInViewPlay.ts` (`useInViewPlay`, line ~644), which never drops a tile while `enabled` stays true.

While any lane is animating, the browser recomputes intersections for every observed target, on the main thread, every frame. `components/sections/Work.tsx:356-386` records a production profile of exactly this: 29% of the renderer main thread and 273ms of a 5s trace in `computeIntersections`, against 1.1% with the section removed. The same comment names this fix: "threading `near` down to Tile as `enabled` is the one-line way back."

The site scrolls through Lenis (`app/smooth-scroll.tsx`), which drives scrolling from `requestAnimationFrame` on the main thread. So this main-thread work shows up directly as scroll stutter.

Today both walls pass `enabled` from reduced-motion alone:

- `WorkCorridor.tsx:170-174`: `const [play] = useState(() => ... !matchMedia("(prefers-reduced-motion: reduce)").matches)`. Every tile receives `enabled={play}` (line ~251), so the Corridor's tiles register while the visitor is still on the hero.
- `HeroReel.tsx`: `const [play] = useState(...)`, passed as `<WorkLanes ... play={play} />`. `WorkLanes` (in `Work.tsx`) forwards it as `enabled` to each tile. The hero's tiles stay registered after the hero has scrolled away.

## How `enabled` toggling behaves (verified; no changes needed in these files)

- `useInViewPlay(lane, enabled, policy)`: when `enabled` goes from true to false, the effect cleanup calls `io.unobserve(el)`, clears any dwell timer, removes the tile from the lane's `visible` set, calls `el.pause()` if it was playing, and reconciles the lane. When it goes back to true, the tile re-registers.
- `LazyVideo`: when `enabled` goes false, it unobserves the attach observer. A `src` that was already attached **stays attached**, so buffered media is not thrown away and resuming is not a cold fetch.

So toggling is safe and cheap. It re-renders the tiles once per crossing, not per frame.

## Change A — `components/sections/WorkCorridor.tsx`

The existing `near` flag uses `rootMargin: "-20% 0px"`, so it only turns true once the section is a fifth of a viewport **in**. That is right for the marquees. It is **too late** for tile registration: tiles would reach the screen before registering and show still posters while the 120ms start stagger works through them. Registration needs its own, earlier flag.

Replace the whole `useNearViewport` function (currently lines ~141-160, including its leading comment) with:

```tsx
/* Work.tsx's gate, and the same negative margin for the same reason: this band
   begins where a full-height hero ends, so without it the flag reports true
   before the visitor has scrolled a pixel. It parks the three marquees while
   the section is away; content-visibility on the section covers the rest.

   `warm` IS THE SECOND, EARLIER FLAG, AND IT GATES THE TILES RATHER THAN THE
   LANES. A tile with `enabled` registers with both shared IntersectionObservers
   on mount, and those recompute every target on every frame something moves —
   see the note on useNearViewport in Work.tsx for the trace. Registering only
   within half a viewport keeps the Corridor's 96 tiles out of that work while
   the visitor is on the hero, and still early enough that the attach margin
   has fetched the first clips before they arrive. */
function useNearViewport<T extends Element>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: "-20% 0px",
    });
    const early = new IntersectionObserver(([entry]) => setWarm(entry.isIntersecting), {
      rootMargin: "50% 0px",
    });
    io.observe(el);
    early.observe(el);
    return () => {
      io.disconnect();
      early.disconnect();
    };
  }, []);

  return [ref, near, warm] as const;
}
```

Then, in `WorkCorridor()`:

1. Change `const [sectionRef, near] = useNearViewport<HTMLElement>();` to
   `const [sectionRef, near, warm] = useNearViewport<HTMLElement>();`
2. In the tile map, change `enabled={play}` to `enabled={play && warm}`.

Leave the lane's `!near ? "[animation-play-state:paused]" : ""` exactly as it is.

## Change B — `components/sections/HeroReel.tsx`

`HeroReel` already has `inView` (an IntersectionObserver on the section, default margin) that pauses the marquees. Reuse it for the tiles.

In the JSX, change

```tsx
          <WorkLanes
            rows={HERO_ROWS_OF_PICKS}
            lane="hero-row"
            running={inView}
            play={play}
```

to

```tsx
          <WorkLanes
            rows={HERO_ROWS_OF_PICKS}
            lane="hero-row"
            running={inView}
            play={play && inView}
```

Update the comment directly above that `useEffect` (currently: "The marquees park once the hero has scrolled away, so they stop competing with the Work band's own lanes for frames.") to:

```tsx
  /* The marquees park once the hero has scrolled away, and the tiles leave
     both shared observers with them, so neither competes with the Corridor's
     lanes for frames. */
```

`inView` starts as `true` (`useState(true)`), so the first paint is unchanged and the hero's tiles register on load as they do today.

## Scope boundaries: do NOT

- Do not edit `lib/useInViewPlay.ts`, `components/ui/LazyVideo.tsx`, or `components/sections/Work.tsx`.
- Do not change `play`'s reduced-motion logic, the `-20%` margin on `near`, lane durations, or any class names.
- Do not add `enabled` to any other wall or route.
- Do not set state inside an effect body outside an observer callback. `react-hooks/set-state-in-effect` is an error in this config, and observer callbacks are fine.

## Verification

1. `npx tsc --noEmit` and `npm run lint` pass.
2. `npm run dev`, open `/`, and count the registered and playing tiles in the console at each stop:
   ```js
   [...document.querySelectorAll('video')].filter(v => !v.paused).length
   ```
   - On the hero at scroll 0: only hero tiles play. Then scroll into the Corridor.
   - Parked in the Corridor with the hero fully off screen: the count equals roughly the visible Corridor tiles, and no hero tiles are playing.
3. Perf check (the reason for this plan): DevTools > Performance, CPU 4x slowdown, record 5s while parked in the Corridor and 5s scrolling hero → Corridor. In Bottom-Up, search for `IntersectionObserver` / `computeIntersections`. Its share should be clearly lower than a recording taken on the pre-change commit.
4. Feel-checks:
   - Scroll from the hero down into the Corridor at normal speed. The first Corridor row should already be moving footage as it arrives, not a row of still posters that fill in. If posters are visible on arrival, raise `"50% 0px"` to `"100% 0px"`. Nothing else should change.
   - Scroll back up to the hero. Its tiles resume, possibly after a short stagger. A beat of posters on the way back up is acceptable. A blank tile is not.
   - With OS "reduce motion" on: no clip plays anywhere (unchanged behaviour).
