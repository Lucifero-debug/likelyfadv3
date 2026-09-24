import type { Metadata } from "next";
import { Nav } from "@/components/v3/Nav";
import { Hero } from "@/components/v3/Hero";
import { WhyUs } from "@/components/v3/WhyUs";
import { Work } from "@/components/v3/Work";
import { Pricing } from "@/components/v3/Pricing";
import { Voices } from "@/components/v3/Voices";
import { Faq } from "@/components/v3/Faq";
import { Footer } from "@/components/v3/Footer";

/* V3 — the Apple-style pass. Same content file, same fonts, same claim card;
   different material, type tuning and motion. Its sections live in
   components/v3 and its spring in lib/v3/spring.ts, so nothing here changes
   the home page or /v2.

   Kept out of search results for the same reason /v2 is: same content as the
   home page, and the home page is the one that should rank. */
export const metadata: Metadata = {
  title: "V3",
  robots: { index: false, follow: false },
};

export default function V3Page() {
  return (
    /* data-site="v3" scopes the page's tokens and materials in globals.css. */
    <div data-site="v3" className="bg-white text-v3-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-v3-ink focus:px-4 focus:py-3 focus:text-[0.85rem] focus:text-white"
      >
        Skip to content
      </a>
      <Nav />

      <main id="main">
        <Hero />
        <WhyUs />
        <Work />
        <Pricing />
        <Voices />
        <Faq />
      </main>

      <Footer />
    </div>
  );
}
