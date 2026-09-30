/* /v6 COPY (T-0088): Alex's final structure and copy, settled with Aman
   (Automation/council/2026-09-30-likelyfad-v6/alex-final-copy.md, incl. the
   msg 145 addendum). It overrides the shared lib/content.ts for /v6 ONLY, so
   "/" and /v4 keep their copy. Same shape as the shared object: the polish
   components import this file instead.

   Rules applied: headings <= 6 words / 36 chars, subs <= 14 words / 84 chars;
   no client names beside any ad (NDA); no dollar sign outside Numbers; every
   number is real, no example badges. */
import { CTA, content as base } from "./content";

export { CTA };

export const content = {
  ...base,

  hero: {
    ...base.hero,
    eyebrow: "AI ad studio by Bright Life Creations",
    headline: "Ads so real, nobody *asks if they're AI.*",
    subline: "AI video, UGC and static ads for brands that test creative every week.",
    primaryCta: CTA,
    secondaryCta: "See the work", // desktop only; the phone hero drops its secondary button
    secondaryHref: "#work",
    reassurance: "", // cut (Alex): the guarantee line under the CTA replaces it
  },

  why: {
    ...base.why,
    heading: "Why brands keep us.",
    // Round 2: Alex's alex-faq-cta.md section 3 (six cards, titles unchanged, bodies trimmed).
    lead: "Six reasons brands stay, each one you can check on this page.",
    pillars: [
      { title: "It looks real, or it doesn't ship", body: "A person checks every frame. If it reads AI, we cut it before you see it." },
      { title: "Days, not weeks", body: "Send a brief today, see first concepts in about 48 hours." },
      { title: "A fraction of the cost", body: "No crew, no location, no reshoots. You pay for output, not overhead." },
      { title: "Angles, not one bet", body: "20 to 40 variants a month, so you learn what wins before you spend big." },
      { title: "Built to run", body: "Hook-first, sized for every placement, ready for your ad manager." },
      { title: "One DM to start", body: "No forms. Send a product link and the angle you want. We handle the rest." },
    ],
    claim: "If your best ad is six months old, you have a volume problem.",
    claimCta: CTA,
  },

  work: {
    ...base.work,
    heading: "Every one of these is AI.",
    sub: "Different products, different sectors. Not one filmed.",
  },

  pricing: {
    ...base.pricing,
    heading: "Priced to your brief,\nnot a package.",
    body: "Tell us what you need and get a straight number the same day.",
    includes: [
      "A fixed quote before we start",
      "Every ratio your channels need",
      "Full commercial rights, yours to run anywhere",
      "Unlimited revisions on the monthly retainer",
    ],
    cta: "Get your quote",
    foot: "One paid trial video first. Don't like it? Full refund, no questions asked.",
  },

  testimonials: {
    ...base.testimonials,
    heading: "Real reactions, as sent.",
    // Round 2 (Aman msg 2626): all eight restored as they were. Aman has been
    // told five are not client-written (content.ts note); his call.
    items: base.testimonials.items.map(t => ({
      ...t,
      proof: t.reel === "doctor-in-office-ai-ugc-health-product" ? "June 2026, 507 purchases from one ad" : "",
    })),
  },

  faq: {
    ...base.faq,
    heading: "Before you reach out.",
    // Round 2: Alex's alex-faq-cta.md section 1 (five; the optional sixth needs Aman).
    items: [
      { q: "Will Meta or TikTok flag AI ads?", a: "We mark what needs the AI label. Disclosed ads run on Meta and TikTok every day." },
      { q: "Do I own the work, paid ads included?", a: "Yes. Full commercial rights for paid and organic, no watermarks, yours forever." },
      { q: "Will people be able to tell it's AI?", a: "Judge the work above. A person checks every frame; if it reads fake, it never ships." },
      { q: "What does it cost, and what if I don't like it?", a: "Priced to your brief. One paid trial video, full refund if you don't like it." },
      { q: "Who writes the script, and how fast?", a: "You send a product link and the angle. We write, you approve. First cut in 48 hours." },
    ],
  },

  // Round 3: Alex's alex-round3.md addendum (Aman msg 2634): a "How it works"
  // block between the Work wall and Pricing, so the page does not rush to price.
  how: {
    heading: "Try us before you commit.",
    sub: "Four steps from a DM to your first ad.",
    steps: [
      "DM us your product and the angle you want",
      "One paid trial video. First cut in 48 hours",
      "Don't like it? Full refund, no questions asked",
      "Like it? We go monthly, unlimited revisions",
    ],
    cta: CTA,
  },

  // Round 3 (Aman msg 2633): the logo band's label (Alex).
  logos: { label: "Brands we make ads for." },

  close: {
    ...base.close,
    // Round 2: Alex's option C at both widths (Doom; Aman judges live).
    heading: "Your best ad is getting older.",
    sub: "New ones in 48 hours. One paid trial, full refund if you don't like it.",
    cta: CTA,
  },

  footer: {
    ...base.footer,
    tagline: "Likelyfad is the AI ad studio of Bright Life Creations, New Delhi, India. Founded 2023. Making AI ads since 2024.",
  },
};

export type ContentV6 = typeof content;
