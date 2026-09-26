import type { Metadata } from "next";
import { Nav } from "@/components/sections/Nav";
import { HeroTwinWalls } from "@/components/sections/HeroTwinWalls";
import { WhyUs } from "@/components/sections/WhyUs";
import { Work } from "@/components/sections/Work";
import { PricingV4 } from "@/components/sections/PricingV4";
import { Testimonials } from "@/components/sections/Testimonials";
import { FaqV4 } from "@/components/sections/FaqV4";
import { FooterV3 } from "@/components/sections/FooterV3";

/* V4 — the home page with /v3's hero: two walls of vertical lanes and the
   pitch standing still in the white column between them (HeroTwinWalls),
   and /v3's centred nav (logo + menu button in that column, floating pill
   on scroll), plus a blur band on each wall's inner edge (edgeBlur) that
   makes the copy column read as a frosted layer over the walls. No blur
   across the top: the hero's TopFrost and the nav's frost band are off.
   Every other band is the home page's own component. (It was a blur-strength
   comparison page; the scroll blur went with HeroReel.) */
export const metadata: Metadata = {
  title: "V4",
  robots: { index: false, follow: false },
};

export default function V4Page() {
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
        <HeroTwinWalls edgeBlur topFrost={false} />
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
