// Alex's final plan 2b copy, with Aman's selected headline, story and small line.
export const contentV7 = {
  hero: {
    label: "Likelyfad. AI ad studio.",
    lines: ["AI ads.", "Real."],
    sub: "Video, UGC and static ads that look shot, delivered in 48 hours.",
  },
  numbers: [
    { value: "48 hours", line: "to the first cut.", source: "measured on the first trial video." },
    { value: "1,000+", line: "ads shipped.", source: "since 2024, across every client." },
    { value: "$1M+", line: "in ad spend behind our creatives.", source: "client ad accounts, 2024 to 2026." },
    { value: "507", line: "purchases from one ad.", source: "health brand, June 2026." },
  ],
  story: {
    reel: "doctor-in-office-ai-ugc-health-product",
    label: "Health brand.",
    caption: "One ad, 507 purchases, still running three months later.",
    shortCaption: "507 purchases from one ad.",
  },
  how: {
    heading: "From DM to ads.",
    sub: "Four steps. No forms. A call if you want one.",
    steps: [
      { icon: "chat", title: "DM us your product.", line: "One message. We learn your brand and what runs now." },
      { icon: "clapperboard", title: "Trial brief, trial video.", line: "Angle, format, script. First cut in 48 hours." },
      { icon: "calendar", title: "Love it? Go monthly.", line: "Any volume, on a plan built for your needs." },
      { icon: "frames", title: "Briefs in, ads out.", line: "Unlimited revisions until they win. You run them." },
    ],
  },
  pricing: {
    heading: "Priced to your brief.",
    sub: "No packages. A plan shaped around how much you test.",
    title: "Start with one.",
    lines: [
      "One paid trial video, first cut in 48 hours.",
      "Then a monthly plan, any volume, unlimited revisions.",
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
  footer: "© 2026 Likelyfad",
} as const;
