# 001 — Mount one work wall: keep WorkCorridor, drop Work

- **Severity:** HIGH (performance)
- **Written against:** `e6cc2e7` plus the uncommitted edit to `app/page.tsx` that added `<WorkCorridor/>`
- **Depends on:** nothing. Do this first; plans 002 and 003 assume it is done.
- **Estimated size:** one file, about 4 lines

## Problem

`app/page.tsx` mounts three walls of autoplaying video at once:

1. `WorkCorridor` (96 tiles), currently placed **above** the hero
2. `HeroReel`, which renders `WorkLanes` from `Work.tsx` (up to 96 tiles)
3. `Work` (96 tiles)

`WorkCorridor` was written to **replace** `Work`. Its header comment says so ("This replaces the flat three-row wall"), and it reuses Work's `id="work"`. Mounting both:

- puts about 288 `<video>` tiles on the page. Each one registers with the shared IntersectionObservers (the browser API that reports when an element enters or leaves the screen) in `lib/useInViewPlay.ts` and `components/ui/LazyVideo.tsx`, and while any lane moves those observers are re-checked on the main thread every frame;
- creates two elements with `id="work"`, so the nav's `#work` link (`lib/content.ts:25`) lands on whichever comes first;
- contradicts the page's own rule in the comment at `app/page.tsx:14-16`: "One version of each band is mounted... stacking variants on this page costs the hero's wall its frame budget."

The Corridor also sits above the hero. Its gate (`useNearViewport` with `rootMargin: "-20% 0px"`, `WorkCorridor.tsx:141-160`) is written for a band that "begins where a full-height hero ends", so at the top of the page it is live from the first frame.

## Current code — `app/page.tsx`

```tsx
import { Nav } from "@/components/sections/Nav";
import { HeroReel } from "@/components/sections/HeroReel";
import { WhyUs } from "@/components/sections/WhyUs";
import { Work } from "@/components/sections/Work";
import { PricingV4 } from "@/components/sections/PricingV4";
import { Testimonials } from "@/components/sections/Testimonials";
import { FaqV4 } from "@/components/sections/FaqV4";
import { FooterV3 } from "@/components/sections/FooterV3";
import { WorkCorridor } from "@/components/sections/WorkCorridor";
...
      <main id="main">
      <WorkCorridor/>
        <HeroReel />
        <WhyUs />
        <Work />
        <PricingV4 />
```

## Target code — `app/page.tsx`

```tsx
import { Nav } from "@/components/sections/Nav";
import { HeroReel } from "@/components/sections/HeroReel";
import { WhyUs } from "@/components/sections/WhyUs";
import { WorkCorridor } from "@/components/sections/WorkCorridor";
import { PricingV4 } from "@/components/sections/PricingV4";
import { Testimonials } from "@/components/sections/Testimonials";
import { FaqV4 } from "@/components/sections/FaqV4";
import { FooterV3 } from "@/components/sections/FooterV3";
...
      <main id="main">
        <HeroReel />
        <WhyUs />
        <WorkCorridor />
        <PricingV4 />
```

## Steps

1. In `app/page.tsx`, delete the line `import { Work } from "@/components/sections/Work";`.
2. Move `import { WorkCorridor } ...` into the slot the `Work` import occupied, so the imports stay in page order.
3. Delete the misindented `<WorkCorridor/>` line above `<HeroReel />`.
4. Replace `<Work />` with `<WorkCorridor />`, indented 8 spaces like its siblings.
5. Leave the rest of the file alone, including the comment block.

## Scope boundaries: do NOT

- **Do not delete or edit `components/sections/Work.tsx`.** `HeroReel.tsx` imports `WorkLanes` and `HERO_ROWS_OF_PICKS` from it (`import { HERO_ROWS_OF_PICKS, WorkLanes } from "./Work";`). Deleting it breaks the hero.
- Do not touch `WorkCorridor.tsx`, `HeroReel.tsx`, `components/redesign/*`, or any `app/v*` route.
- Do not change `lib/content.ts`. `#work` keeps working because WorkCorridor carries `id="work"`.

## Known behaviour change (accepted by the user)

Work's tiles were buttons that opened the `Lightbox`. The Corridor's tiles are inert `aria-hidden` divs, deliberately (see `WorkCorridor.tsx:41-52`). After this change, **clicking a clip on the home page opens nothing.** That is expected. Do not add click handlers to the Corridor; its comment explains why they would hit-test in the wrong place.

## Verification

1. `npx tsc --noEmit` and `npm run lint` pass. Nothing new may be reported for `app/page.tsx`.
2. `npm run dev`, open `/`:
   - The page order is hero → Why Us → Corridor → Pricing.
   - In the DevTools console, `document.querySelectorAll('#work').length` returns `1`.
   - `document.querySelectorAll('video').length` drops from about 288 to about 192. The exact figure depends on `useLeanRowLength` and `usePitchRowLength` trimming.
   - Clicking "Work" in the nav scrolls to the Corridor.
3. Feel-check: scroll hero → Corridor → Pricing at normal speed, then again with DevTools > Performance > CPU 4x slowdown. Scrolling should hitch less than before. If it still hitches, that's expected; plans 002 and 003 target the rest.
