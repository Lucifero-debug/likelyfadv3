// Alex's approved copy. The switch changes media and the approved sub only.
export type ReelSegment = { start: number; end: number };

export const HERO: {
  variant: "three" | "chip";
  reel: string;
  chipReel: string;
  chipAtSeconds: number;
  segment?: ReelSegment;
} = {
  variant: "chip",
  reel: "boyfriend-angle-ai",
  chipReel: "boyfriend-angle-ai",
  chipAtSeconds: 26,
  segment: { start: 21.5, end: 26.5 },
};

export const contentV7 = {
  hero: {
    name: "Likelyfad",
    lines: ["AI ads.", "Real."],
    sub: "Video, UGC and static ads that look shot, delivered in 48 hours.",
    threeSub: "Video, UGC and static ads for your product, delivered in 48 hours.",
    product: "Your product.",
    ad: "Your ad.",
  },
  highlights: {
    heading: "Get the highlights.",
    lines: [
      "48 hours to the first cut. Brief today, review the day after tomorrow.",
      "Every frame checked by a person. If it reads AI, it never ships.",
      "1,000+ ads shipped since 2024. Not one of them filmed.",
      "$1M+ in ad spend behind our creatives. Made to win, not just to look real.",
    ],
  },
  work: { heading: "Work.", line: "Every one of these is AI.", pause: "Pause" },
  results: {
    heading: "Results.",
    number: "507",
    label: "purchases from one ad.",
    reel: "doctor-in-office-ai-ugc-health-product",
    caption: "Health brand, June 2026. Still running in September.",
  },
  closer: {
    heading: "Take a closer look.",
    reel: "hoodie-ad-podcast-style",
    meta: "Running on Meta",
    steps: [
      { title: "DM us your product.", line: "One message. We learn your brand and what runs now." },
      { title: "Trial brief, trial video.", line: "Angle, format, script. First cut in 48 hours." },
      { title: "Love it? Go monthly.", line: "Any volume, on a plan built for your needs." },
      { title: "Briefs in, ads out.", line: "Unlimited revisions until they win. You run them." },
    ],
  },
  plan: {
    heading: "Plan.",
    question: "Which is right for you?",
    columns: [
      { title: "Trial video.", lines: ["One paid video.", "First cut in 48 hours.", "Made to win."] },
      { title: "Monthly plan.", lines: ["Any volume.", "Unlimited revisions.", "A plan built for your needs."] },
    ],
    small: "A number back the same day.",
  },
  faq: {
    heading: "Questions. Answers.",
    items: [
      { q: "Will people tell it's AI?", a: "Judge the work. A person checks every frame; if it reads fake, it never ships." },
      { q: "Do I own the work?", a: "Yes. Full commercial rights for paid and organic, no watermarks." },
      { q: "Will Meta or TikTok flag it?", a: "We mark what needs the AI label. Disclosed ads run every day." },
      { q: "What does it cost?", a: "Priced to your brief. One paid trial video first; don't like it, we refund it." },
      { q: "Who writes the script?", a: "You send the angle. We write, you approve. First cut in 48 hours." },
    ],
  },
  close: {
    lines: ["Your next ad.", "Today."],
    sub: "Send the product. First cut in 48 hours. Made to win.",
  },
} as const;
