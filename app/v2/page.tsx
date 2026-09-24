import type { Metadata } from "next";
import { Nav } from "@/components/redesign/Nav";
import { HeroV6 } from "@/components/redesign/HeroV6";
import { SpotTheReal } from "@/components/redesign/SpotTheReal";
import { WhyUs } from "@/components/redesign/WhyUs";
import { Work } from "@/components/redesign/Work";
import { PricingV4 } from "@/components/redesign/PricingV4";
import { Testimonials } from "@/components/redesign/Testimonials";
import { FaqV4 } from "@/components/redesign/FaqV4";
import { FooterV3 } from "@/components/redesign/FooterV3";
import { WALL_COLUMNS } from "@/lib/v8/data";

/* THE REDESIGN — one Archivo family, the "spot the real one" game, caption-box
   headings and pink as the DM colour. Its sections are copies in
   components/redesign reading lib/redesign/{content,ui}.ts, so nothing here
   changes the home page, and nothing on the home page changes this.

   Kept out of search results: it is the same content as the home page, and
   the home page is the one that should rank. */
export const metadata: Metadata = {
  title: "Redesign",
  robots: { index: false, follow: false },
};

export default function RedesignPage() {
  return (
    /* data-site="redesign" repoints the font tokens to Archivo for everything
       inside (globals.css). font-sans here, because the body's own font was
       resolved above this wrapper and plain text would otherwise inherit it. */
    <div data-site="redesign" className="font-sans">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-3 focus:text-[0.85rem] focus:text-paper"
      >
        Skip to content
      </a>
      <Nav />

      <main id="main">
        <HeroV6 columns={WALL_COLUMNS} />
        <SpotTheReal />
        <WhyUs />
        <Work />
        <PricingV4 />
        <Testimonials />
        <FaqV4 />
      </main>

      <FooterV3 />
    </div>
  );
}
