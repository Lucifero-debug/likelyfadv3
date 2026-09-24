import type { Metadata } from "next";
import { Nav } from "@/components/sections/Nav";
import { HeroV7 } from "@/components/v7/HeroV7";
import { WhyUsV7 } from "@/components/v7/WhyUsV7";
import { WorkReelV7 } from "@/components/v7/WorkReelV7";
import { PricingV7 } from "@/components/v7/PricingV7";
import { FooterV7 } from "@/components/v7/FooterV7";
import { ScrollProgress } from "@/components/v7/ScrollProgress";
import { TestimonialsV7 } from "@/components/v7/TestimonialsV7";
import { FaqV7 } from "@/components/v7/FaqV7";
import { NavSpy } from "@/components/v7/NavSpy";
import { Cursor } from "@/components/v7/Cursor";
import { WorkCorridor } from "@/components/sections/WorkCorridor";
import { WorkGrid } from "@/components/sections/WorkGate";

/* V7 — the home page, animated end to end. Same sections, order, copy, fonts
   and claim card as app/page.tsx; every band gains motion of its own:

     NAV           drops in on load; a gradient marker slides under the link
                   of the section being read (NavSpy)
     HERO          WebGL aurora + sparks under the rising copy, words settle
                   as the headline lands, magnetic CTA
     WHY US        a Three.js noise orb beside the heading; pillars flip up in
                   3D, sweep their gradient bar, and tilt toward the pointer
     WORK          the band opens from an inset panel to full bleed; a
                   screening room with a real player and a picker
     PRICING       hairlines draw themselves, ticks pop and ink in
     TESTIMONIALS  drag-to-scroll with momentum; the row curves in depth
     FAQ           a highlight glides between questions and grows as they open
     FOOTER        a Three.js point-field horizon with a pointer ripple
     PAGE          scroll-progress bar and a cursor follower that labels media

   Everything drops to still frames under prefers-reduced-motion, and the
   pointer-only pieces (tilt, magnet, cursor, drag) never run on touch.

   `data-v7` scopes this page's rules in globals.css. Kept out of search
   results for the same reason /v2-/v6 are. */
export const metadata: Metadata = {
  title: "V7",
  robots: { index: false, follow: false },
};

export default function V7Page() {
  return (
    <div data-v7>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-3 focus:text-[0.85rem] focus:text-paper"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Nav />

      <main id="main">
        <HeroV7 />
        <WhyUsV7 />
        <WorkReelV7 />
        <WorkGrid/>
        <WorkCorridor/>
        <PricingV7 />
        <TestimonialsV7 />
        <FaqV7 />
      </main>

      <FooterV7 />
      <NavSpy />
      <Cursor />
    </div>
  );
}
