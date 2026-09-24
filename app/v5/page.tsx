import type { Metadata } from "next";
import { Header } from "@/components/v5/Header";
import { Hero } from "@/components/v5/Hero";
import { WhyUs } from "@/components/v5/WhyUs";
import { Work } from "@/components/v5/Work";
import { Pricing } from "@/components/v5/Pricing";
import { Voices } from "@/components/v5/Voices";
import { Faq } from "@/components/v5/Faq";
import { Footer } from "@/components/v5/Footer";

/* V5 — the Carbon pass. Same content file, same fonts, same claim card; the
   2x Grid, the 01–13 spacing scale, Carbon's layer tokens across four themes
   (White + Gray 10 bands + a Gray 100 lead space and footer; Gray 100 / Gray 90
   in dark mode), square corners, one blue that only ever means "interactive",
   and productive motion. Its sections live in components/v5, its tokens in
   globals.css (the [data-site="v5"] block and the cds-* utilities), so nothing
   here changes the home page or the other versions.

   Kept out of search results for the same reason /v2–/v4 are: same content as
   the home page, and the home page is the one that should rank. */
export const metadata: Metadata = {
  title: "V5",
  robots: { index: false, follow: false },
};

export default function V5Page() {
  return (
    <div data-site="v5" className="bg-cds-background font-sans text-cds-text-primary">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-0 focus:top-0 focus:z-[200] focus:flex focus:h-12 focus:items-center focus:bg-cds-btn-primary focus:px-4 focus:text-sm focus:text-cds-text-on-color"
      >
        Skip to main content
      </a>
      <Header />

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
