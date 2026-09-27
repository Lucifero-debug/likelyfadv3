import type { Metadata } from "next";
import { Nav } from "@/components/sections/Nav";
import { LogoWallGrid } from "@/components/sections/LogoWallGrid";
import { HeroStacked } from "@/components/sections/HeroStacked";
import { WhyUs } from "@/components/sections/WhyUs";
import { Work } from "@/components/sections/Work";
import { PricingV4 } from "@/components/sections/PricingV4";
import { Testimonials } from "@/components/sections/Testimonials";
import { FaqV4 } from "@/components/sections/FaqV4";
import { FooterV3 } from "@/components/sections/FooterV3";

/* V5 — /v4 exactly, except on phones (below `tab:`): there the hero is the
   centred nav, then three horizontal lanes of clips like the Work wall
   filling three quarters of the screen, then the pitch underneath
   (HeroStacked). From `tab:` up it is /v4's HeroTwinWalls unchanged. */
export const metadata: Metadata = {
  title: "V5",
  robots: { index: false, follow: false },
};

export default function V5Page() {
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
        <LogoWallGrid />
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
