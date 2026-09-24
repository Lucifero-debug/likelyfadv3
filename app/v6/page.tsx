import type { Metadata } from "next";
import { Frame } from "@/components/v6/Frame";
import { Hero } from "@/components/v6/Hero";
import { WhyUs } from "@/components/v6/WhyUs";
import { Work } from "@/components/v6/Work";
import { Pricing } from "@/components/v6/Pricing";
import { Voices } from "@/components/v6/Voices";
import { Faq } from "@/components/v6/Faq";
import { Footer } from "@/components/v6/Footer";
import { Toast } from "@/components/v6/Toast";

/* V6 — the Polaris pass. Same content file, same fonts, same claim card; the
   landing page set inside the Shopify admin's frame (top bar, navigation
   column, grey page, white bevelled cards), Polaris's space and radius
   scales, badges for status, AnnotatedSections, an empty-state close,
   FooterHelp and a toast. Headings follow Polaris's content rules (sentence
   case, no terminal punctuation) by reading the content file's copy through
   title() rather than editing it. Tokens live in globals.css (p-* colours,
   the [data-site="v6"] block), so nothing here changes the other versions.

   Kept out of search results for the same reason /v2–/v5 are. */
export const metadata: Metadata = {
  title: "V6",
  robots: { index: false, follow: false },
};

export default function V6Page() {
  return (
    <div data-site="v6" className="min-h-dvh bg-p-bg font-sans text-p-text">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-p-bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-p-text focus:shadow-[var(--p-shadow-popover)]"
      >
        Skip to content
      </a>
      <Frame />

      <div className="pt-[var(--v6-topbar)] p-md:pl-[240px]">
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

      <Toast />
    </div>
  );
}
