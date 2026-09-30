import { Nav } from "@/components/polish/Nav";
import { LogoWall } from "@/components/sections/LogoWall";
import { HeroStacked } from "@/components/polish/HeroStacked";
import { WhyUs } from "@/components/polish/WhyUs";
import { Work } from "@/components/polish/Work";
import { PricingV4 } from "@/components/polish/PricingV4";
import { Testimonials } from "@/components/polish/Testimonials";
import { FaqV4 } from "@/components/sections/FaqV4";
import { FooterV3 } from "@/components/polish/FooterV3";
import { FeaturedAd } from "@/components/polish/FeaturedAd";
import { GradualBlur } from "@/components/polish/reactbits/GradualBlur";
import { Numbers } from "@/components/polish/Numbers";
import { ScrollLinkedReveals } from "@/components/polish/ScrollLinkedReveals";

/* The home page — the /v5 layout: centred nav, HeroStacked (three lanes of
   clips over the pitch on phones, /v4's twin walls from `tab:` up), then the
   LogoWall.

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
      <Nav centered frost={false} />

      <main id="main">
        <HeroStacked />
        <LogoWall />
        <WhyUs />
        <FeaturedAd />
        <Numbers />
        <Work />
        <PricingV4 />
        <Testimonials />
        <FaqV4 />
      </main>

      <FooterV3 />
      <GradualBlur />
      <ScrollLinkedReveals />
    </>
  );
}
