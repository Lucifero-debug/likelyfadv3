"use client";

import { useEffect, useRef } from "react";
import { content } from "@/lib/content";
import { TEXT_STATEMENT } from "@/lib/ui";
import { Reveal } from "@/components/anim/Reveal";
import { RevealText } from "@/components/anim/RevealText";
import { Reveal as UiReveal } from "@/components/ui/Reveal";
import { RevealText as UiRevealText } from "@/components/ui/RevealText";
import { Button } from "@/components/ui/Button";
import { WhyOrb } from "./WhyOrb";

/* V7 — WhyUs, with a Three.js orb beside the heading, the pillars flipping
   up into place (globals.css, [data-v7] block), and the pillars answering the pointer: each card tilts toward
   it in 3D and carries a soft pink spotlight at the pointer's position. The
   claim card below is untouched, character for character.

   Why us. The heading and the pillars are replicated from the original
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

export function WhyUsV7() {
  const { why } = content;
  const gridRef = useRef<HTMLDivElement>(null);

  /* THE TILT. One delegated listener on the grid; the transform goes on the
     card under the pointer only, and is cleared on leave so the stylesheet's
     own 0.5s transition carries it home. */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let current: HTMLElement | null = null;
    const reset = (el: HTMLElement) => {
      el.style.transition = "";
      el.style.transform = "";
    };
    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(".pillar");
      if (current && current !== card) reset(current);
      current = card;
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.transition = "transform 160ms cubic-bezier(0.22,0.7,0.2,1), box-shadow 0.5s, border-color 0.5s";
      card.style.transform = `perspective(900px) translateY(-6px) rotateX(${((0.5 - y) * 7).toFixed(2)}deg) rotateY(${((x - 0.5) * 9).toFixed(2)}deg)`;
      card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    };
    const onLeave = () => {
      if (current) reset(current);
      current = null;
    };
    grid.addEventListener("pointermove", onMove);
    grid.addEventListener("pointerleave", onLeave);
    return () => {
      grid.removeEventListener("pointermove", onMove);
      grid.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return (
    <section className="section why relative" id="why" aria-label="Why us">
      {/* The orb fills the empty half beside the capped heading (WhyOrb.tsx). */}
      <WhyOrb className="absolute right-[clamp(24px,7vw,160px)] top-[clamp(48px,5vw,96px)] hidden size-[clamp(280px,26vw,440px)] lap:block" />
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

        <div ref={gridRef}>
        <Reveal stagger className="why-grid" start="top 80%">
          {why.pillars.map((p, i) => (
            <article className="pillar group isolate" key={p.title} data-reveal-item>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(340px_circle_at_var(--mx,50%)_var(--my,50%),rgba(240,64,127,0.11),rgba(240,64,127,0)_62%)]"
              />
              <span className="pillar-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </Reveal>
        </div>

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
