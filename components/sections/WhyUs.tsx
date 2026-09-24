"use client";

import { content } from "@/lib/content";
import { TEXT_STATEMENT } from "@/lib/ui";
import { Reveal } from "@/components/anim/Reveal";
import { RevealText } from "@/components/anim/RevealText";
import { Reveal as UiReveal } from "@/components/ui/Reveal";
import { RevealText as UiRevealText } from "@/components/ui/RevealText";
import { Button } from "@/components/ui/Button";

/* Why us. The heading and the pillars are replicated from the original
   likelyfad build — its SectionHeading markup is written out here rather than
   using this site's shared one, which is centred and utility-styled. Their
   styles are in globals.css under WHY US.

   The claim card under the pillars is NOT from that build. It is this site's
   own photographic card, kept exactly as it was. */

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
    <section className="section why" id="why" aria-label="Why us">
      <div className="wrap">
        <div className="why-head">
          <div className="section-head">
            <Reveal>
              <span className="kicker">{why.kicker}</span>
            </Reveal>
            <RevealText as="h2" className="display-lg section-head-title" text={why.heading} />
          </div>
          <Reveal delay={0.1}>
            <p className="why-lead lead">{why.lead}</p>
          </Reveal>
        </div>

        <Reveal stagger className="why-grid" start="top 80%">
          {why.pillars.map((p, i) => (
            <article className="pillar" key={p.title} data-reveal-item>
              <span className="pillar-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </Reveal>

        {/* data-nav-dark: the card is a dark photograph wider than the nav's
            wrap, so the nav flips its links when it passes under — see Nav.tsx.
            `isolate` scopes the scrim's stacking to this card, and
            `overflow-hidden` rounds the scrim with the card's corners. */}
        <div
          data-nav-dark
          className={`relative isolate mt-[clamp(32px,3.5vw,48px)] overflow-hidden rounded-3xl border border-white/10 p-[clamp(32px,3.5vw,48px)] text-center text-paper ${CLAIM_BG}`}
        >
          <div aria-hidden className={CLAIM_SCRIM} />

          <div className="relative flex flex-col items-center gap-6">
            {/* A direct flex child, so the inline RevealText root blockifies and
                the 26ch measure applies. */}
            <UiRevealText
              as="p"
              text={why.claim}
              stagger={30}
              className={`max-w-[26ch] text-pretty font-sans ${TEXT_STATEMENT} font-bold leading-[1.2] lap:leading-[1.1] tracking-[-0.022em]`}
            />
            <UiReveal delay={100}>
              {/* `grad`, not `dark` — an ink pill would vanish on this ground,
                  and it matches the hero's identical DM CTA. */}
              <Button contact variant="grad" withArrow>
                {why.claimCta}
              </Button>
            </UiReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
