"use client";

import { content } from "@/lib/redesign/content";
import { HEADING, SECTION, TEXT_LEAD, WRAP } from "@/lib/redesign/ui";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { Button } from "@/components/ui/Button";

/* Why us: the heading and intro hold still on the left while the six reasons
   scroll past on the right.

   NOT CARDS, NOT NUMBERED, NOT RULED. The six points are a set, not a
   sequence, so an index would claim an order that is not there; boxes or rules
   around each would repeat the structure Pricing and the FAQ already use.
   Whitespace between them is the only separator.

   The photographic claim card closes the band. */

/* The claim card's ground: /bg.png (stored pre-mirrored), cover/center. noir
   underneath keeps the paper-coloured claim legible while the image loads. */
const CLAIM_BG = "bg-noir bg-cover bg-center bg-no-repeat bg-[url('/bg.png')]";

/* The scrim carries the contrast on its own — 7.46:1 worst case against
   text-paper over the untoned photograph. Written as one literal: Tailwind
   scans source text, so a class assembled from a variable never generates. */
const CLAIM_SCRIM =
  "pointer-events-none absolute inset-0 " +
  "bg-[image:radial-gradient(85%_115%_at_50%_50%,rgba(14,12,17,0.82)_0%,rgba(14,12,17,0.7)_42%,rgba(14,12,17,0.4)_100%)]";

export function WhyUs() {
  const { why } = content;
  return (
    <section id="why" className={SECTION} aria-label={why.kicker}>
      <div className={WRAP}>
        <div className="grid gap-[clamp(40px,5vw,80px)] lap:grid-cols-[5fr_7fr] lap:items-start">
          <div className="lap:sticky lap:top-28">
            <h2 className={`max-w-[10ch] ${HEADING}`}>{why.heading}</h2>
            <p className={`mt-6 max-w-[34ch] text-pretty font-sans ${TEXT_LEAD} leading-normal text-ink-soft`}>
              {why.lead}
            </p>
          </div>

          <ul className="grid gap-y-[clamp(36px,4.5vw,64px)] tab:grid-cols-2 tab:gap-x-12 lap:grid-cols-1 lap:pt-3">
            {why.pillars.map((p) => (
              <li key={p.title}>
                <h3 className="text-balance font-display text-[clamp(1.6rem,1.2rem+1.2vw,2.5rem)] font-extrabold leading-[1.05]">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-[48ch] text-pretty font-sans text-[clamp(1rem,0.95rem+0.2vw,1.125rem)] leading-[1.55] text-ink-soft">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* data-nav-dark: the card is a dark photograph wider than the nav's
            wrap, so the nav flips its links when it passes under — see Nav.tsx.
            `isolate` scopes the scrim's stacking to this card, and
            `overflow-hidden` rounds the scrim with the card's corners. */}
        <div
          data-nav-dark
          className={`relative isolate mt-[clamp(56px,7vw,112px)] overflow-hidden rounded-3xl border border-white/10 p-[clamp(32px,3.5vw,48px)] text-center text-paper ${CLAIM_BG}`}
        >
          <div aria-hidden className={CLAIM_SCRIM} />

          <div className="relative flex flex-col items-center gap-6">
            {/* A direct flex child, so the inline RevealText root blockifies and
                the 26ch measure applies. */}
            <RevealText
              as="p"
              text={why.claim}
              stagger={30}
              className={`max-w-[22ch] text-balance font-display text-[clamp(2rem,1rem+3.2vw,4.25rem)] font-extrabold leading-[1]`}
            />
            <Reveal delay={100}>
              {/* The DM colour, like every other DM button on the page. */}
              <Button contact variant="pink">
                {why.claimCta}
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
