import type { Metadata } from "next";
import { TopAppBar } from "@/components/v4/TopAppBar";
import { Hero } from "@/components/v4/Hero";
import { WhyUs } from "@/components/v4/WhyUs";
import { Work } from "@/components/v4/Work";
import { Pricing } from "@/components/v4/Pricing";
import { Voices } from "@/components/v4/Voices";
import { Faq } from "@/components/v4/Faq";
import { Footer } from "@/components/v4/Footer";
import { Fab } from "@/components/v4/Fab";
import { Ripple } from "@/components/v4/Ripple";

/* V4 — the Material 3 pass. Same content file, same fonts, same claim card;
   an M3 colour scheme seeded from the brand pink (light and dark), the M3
   type and shape scales, state layers and ripples, Expressive shapes and
   springs. Its sections live in components/v4, its tokens in globals.css
   (m3-* colours, the [data-site="v4"] block), so nothing here changes the
   home page, /v2 or /v3.

   Kept out of search results for the same reason /v2 and /v3 are: same
   content as the home page, and the home page is the one that should rank. */
export const metadata: Metadata = {
  title: "V4",
  robots: { index: false, follow: false },
};

export default function V4Page() {
  return (
    /* data-site="v4" scopes the page's motion tokens and dark scheme. */
    <div data-site="v4" className="bg-m3-surface font-sans text-m3-on-surface">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-full focus:bg-m3-inverse-surface focus:px-5 focus:py-3 focus:text-[0.875rem] focus:text-m3-inverse-on-surface"
      >
        Skip to content
      </a>
      <Ripple />
      <TopAppBar />

      <main id="main">
        <Hero />
        <WhyUs />
        <Work />
        <Pricing />
        <Voices />
        <Faq />
      </main>

      <Footer />
      <Fab />
    </div>
  );
}
