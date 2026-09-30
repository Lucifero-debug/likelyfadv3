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
      { title: "Made to win", body: "Hook-first, sized for every placement, ready for your ad manager." },
      // Round 7 (Aman msg 2767; Alex, alex-steps.md section 5): the DM now lives in How it works step 1.
      { title: "Your workflow stays yours", body: "We fit into your system, timelines, style and speed. Only the output changes." },
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
    foot: "Start with one paid trial video. A person checks every frame before it ships.",
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
      { q: "What does it cost, and what if I don't like it?", a: "Priced to your brief. One paid trial video first; don't like it, we refund it." },
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
    // Round 5 (Aman msg 2682, steps variant B): what each state of the card
    // shows. Alex's lines (alex-cta-copy.md). "Done today" is HELD until Aman
    // OKs a same-day refund promise (Doom), so the reply ends at "full refund."
    screens: {
      trialTag: "First cut in 48 hours",
      refundAsk: "Not feeling this one. Can I get a refund?",
      refundReply: "Of course. Don't like it, full refund.",
      monthlyTag: "Monthly retainer, unlimited revisions.",
    },
    cta: CTA,
  },

  // Round 7 (Aman msgs 2754-2767; Alex, alex-steps.md FINAL): How it works,
  // rebuilt from the real client lifecycle. No refund in the steps; the trial
  // has no revisions (retainer only); no prices, tool names or named product.
  steps: {
    heading: "From a DM to winning ads.",
    sub: "Four steps. No forms, no calls unless you want one. Your workflow stays yours.",
    items: [
      { heading: "DM us your product.", sub: "One message. We learn your brand, your goals and what runs today." },
      { heading: "Trial brief, trial video.", sub: "Send the angle, the format and a script. Your first video is ready in 48 hours." },
      { heading: "Love it? Go monthly.", sub: "Any number of videos a month, on a customised plan built for your needs." },
      { heading: "Briefs in, ads out.", sub: "Send briefs, get plenty of ads. Unlimited revisions until they win. You run them." },
    ],
    close: "Start with the DM. The rest we do together.",
    cta: CTA,
  },

  // Round 3 (Aman msg 2633): the logo band's label (Alex).
  logos: { label: "Brands we make ads for." },

  // Round 4 (Aman msg 2659 + Alex, alex-cta-copy.md; Doom msg 2661): the end
  // CTA is a phone with a DM being sent, and the line beside it.
  closeChat: {
    typed: "Here's my product: ",
    link: "yourbrand.com/product",
    typing: "Likelyfad is typing…",
    reply: "On it. First cut in 48 hours, made to win, not just to look real.",
    contact: "Likelyfad",
  },
  // Round 4: the rotating line (Alex). Placement pending Aman.
  rotating: {
    before: "Your next winning ad:",
    words: ["AI UGC", "AI podcast", "AI drama", "AI song"],
    after: "One DM away.",
  },

  // Round 4 review stack (Aman msg 2669): the live close kept as option 4.
  closeClassic: {
    heading: "Your best ad is getting older.",
    sub: "First cut in 48 hours. Made to win, checked frame by frame.",
    cta: CTA,
  },

  close: {
    ...base.close,
    // Round 2: Alex's option C at both widths (Doom; Aman judges live).
    // Round 4 (Aman msg 2659; Alex): the phone-chat close.
    heading: "Starting takes ten seconds.",
    sub: "Send the DM, we do the rest.",
    guarantee: "One paid trial video. First cut in 48 hours, made to win, not just to look real.",
    cta: CTA,
  },

  footer: {
    ...base.footer,
    tagline: "Likelyfad is the AI ad studio of Bright Life Creations, New Delhi, India. Founded 2023. Making AI ads since 2024.",
  },
};

export type ContentV6 = typeof content;
