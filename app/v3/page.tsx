import type { Metadata } from "next";
import { Nav } from "@/components/sections/Nav";
import { HeroTwinWalls } from "@/components/sections/HeroTwinWalls";
import { WhyUs } from "@/components/sections/WhyUs";
import { Work } from "@/components/sections/Work";
import { PricingV4 } from "@/components/sections/PricingV4";
import { Testimonials } from "@/components/sections/Testimonials";
import { FaqV4 } from "@/components/sections/FaqV4";
import { FooterV3 } from "@/components/sections/FooterV3";

/* V3 — the home page with one change: the hero's backdrop is two walls of four
   vertical lanes (HeroTwinWalls) instead of three horizontal rows. Every other
   band is the home page's own component, so it tracks the home page. */
export const metadata: Metadata = {
  title: "V3",
  robots: { index: false, follow: false },
};

export default function V3Page() {
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
        <HeroTwinWalls />
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
