import type { Metadata } from "next";
import { Nav } from "@/components/sections/Nav";
import { HeroReel } from "@/components/sections/HeroReel";
import { WhyUs } from "@/components/sections/WhyUs";
import { Work } from "@/components/sections/Work";
import { PricingV4 } from "@/components/sections/PricingV4";
import { Testimonials } from "@/components/sections/Testimonials";
import { FaqV4 } from "@/components/sections/FaqV4";
import { FooterV3 } from "@/components/sections/FooterV3";

/* V6 — the home page with one change: the hero's scroll blur is 8px
   instead of the home page's 14px. A blur-strength comparison page. */
export const metadata: Metadata = {
  title: "V6",
  robots: { index: false, follow: false },
};

export default function V6Page() {
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
        <HeroReel blurPx={8} />
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
