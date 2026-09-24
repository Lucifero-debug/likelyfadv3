import { Nav } from "@/components/sections/Nav";
import { HeroReel } from "@/components/sections/HeroReel";
import { WhyUs } from "@/components/sections/WhyUs";
import { Work } from "@/components/sections/Work";
import { PricingV4 } from "@/components/sections/PricingV4";
import { Testimonials } from "@/components/sections/Testimonials";
import { FaqV4 } from "@/components/sections/FaqV4";
import { FooterV3 } from "@/components/sections/FooterV3";

/* The home page. The redesigned version of this page lives at /v2
   (app/v2/page.tsx), built from its own copies in components/redesign.

   One version of each band is mounted. Keep it that way: every reel wall below
   the fold decodes and composites video continuously, so stacking variants on
   this page costs the hero's wall its frame budget. */
export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-3 focus:text-[0.85rem] focus:text-paper"
      >
        Skip to content
      </a>
      <Nav />

      <main id="main">
        <HeroReel />
        <WhyUs />
        <Work />
        <PricingV4 />
        <Testimonials />
        <FaqV4 />
      </main>

      <FooterV3 />
    </>
  );
}
