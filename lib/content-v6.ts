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
    lead: "Three reasons, each with a number you can check.",
    pillars: [
      { title: "It looks real, or it doesn't ship", body: "A person checks every frame. If it reads AI, it never leaves us." },
      { title: "Days, not weeks", body: "First concepts in 48 hours, then 20 to 40 variants a month." },
      { title: "Pay for output, not overhead", body: "No crew, no location, no reshoots. A fixed quote before we start." },
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
    items: [
      { quote: "Looks great. Let's do the next one in German.", who: "Founder, EU fashion brand", reel: "boyfriend-angle-ai", label: "Fashion · UGC", proof: "" },
      { quote: "You cooked on this edit. Very convincing.", who: "DTC brand owner", reel: "ai-podcast", label: "Podcast-style", proof: "" },
      { quote: "Insane realism and all tha ads looks human made.", who: "Creative lead, health brand", reel: "doctor-in-office-ai-ugc-health-product", label: "Health · UGC", proof: "June 2026, 507 purchases from one ad" },
    ],
  },

  faq: {
    ...base.faq,
    heading: "Before you reach out.",
    items: [
      { q: "Will people be able to tell it's AI?", a: "Judge the work yourself. A person checks every frame; if it reads fake, it doesn't ship." },
      { q: "How fast is the first video?", a: "First concepts in about 48 hours, then we iterate until you'd run it." },
      { q: "What do you need from us?", a: "A product link and a rough idea of the angle. Footage helps, not required." },
      { q: "What if I don't like it?", a: "Full refund on the trial, no questions asked. Like it? We go monthly, unlimited revisions." },
      { q: "Who owns the work?", a: "You do. Full commercial rights, no watermarks, yours to run anywhere." },
    ],
  },

  close: {
    ...base.close,
    heading: "Your next winning ad is a DM away.",
    sub: "Most brands get a number the same day.",
    cta: CTA,
  },

  footer: {
    ...base.footer,
    tagline: "Likelyfad is the AI ad studio of Bright Life Creations, New Delhi, India. Founded 2023. Making AI ads since 2024.",
  },
};

export type ContentV6 = typeof content;
