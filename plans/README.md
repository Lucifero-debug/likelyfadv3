# Animation plans

Written from the `imporve-animation` audit of the home page's video walls (lag in WorkCorridor, Work and ReelWallV6), against commit `e6cc2e7`.

Execute in order. Each plan is self-contained and gives exact file paths, code and verification steps.

| # | Plan | Severity | Depends on | Status |
|---|---|---|---|---|
| 001 | [Mount one work wall: keep WorkCorridor, drop Work](001-one-work-wall.md) | HIGH | — | DONE (in main tree, uncommitted); browser feel-check pending |
| 002 | [Stop off-screen walls from registering their tiles](002-gate-tile-registration.md) | HIGH | 001 | DONE (in main tree, uncommitted); browser feel-check pending |
| 003 | [Give the Corridor its own play policy, tuned from a trace](003-corridor-play-policy.md) | HIGH, conditional | 001, 002 | TODO: measure first; may close as NOT NEEDED |

## Why this order

- **001** removes about a third of the page's video tiles and fixes the duplicate `#work` id. It costs nothing to do and makes the other two cheaper to measure.
- **002** removes the per-frame IntersectionObserver work (the browser API that reports when an element enters or leaves the screen) for walls that aren't on screen. The repo's own trace (`components/sections/Work.tsx:356-386`) names this as the main-thread cost. Lenis puts scrolling on that same thread.
- **003** changes a deliberate, documented decision: the uncapped `HOT` policy. So it runs only if a trace after 001 and 002 still shows dropped frames, and it never touches `HOT` itself.

## Findings from the audit that were not planned

- `ReelWallV6.tsx:674` / `globals.css:346-362`: `mask-image` over a moving 3D wall (/v2 only).
- `HeroReel.tsx:125-127`: a full-screen `backdrop-filter` over a moving, playing wall during the scroll-driven blur.
- `WorkCorridor.tsx:217-241`: `will-change` on about 2,700px tracks inside a rotated `preserve-3d` plane. Unmeasured.
- `app/smooth-scroll.tsx`: Lenis turns any main-thread cost into scroll jank.
