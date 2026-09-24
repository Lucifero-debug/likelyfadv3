"use client";

import type { ReactNode } from "react";
import { content } from "@/lib/content";
import { TEXT_STATEMENT } from "@/lib/ui";
import { contactUrl } from "@/lib/site";
import { reelVideos } from "@/lib/reels.generated";
import { takeReels } from "@/lib/reelOrder";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Reveal as UiReveal } from "@/components/ui/Reveal";
import { RevealText as UiRevealText } from "@/components/ui/RevealText";
import { Button } from "@/components/ui/Button";
import { V3_H2, V3_LEAD, V3_SECTION, V3_WRAP, Eyebrow, Highlight, TextLink } from "./primitives";

/* WHY US, as a bento — the way Apple's product pages set a list of reasons.

   Tiles carry a headline and a line of copy. Where a claim IS a number, the
   number is the tile's visual, set large in ink the way Apple sets "Up to 22
   hours": the speed tile and the angles tile. Where it is a claim a sentence
   can't prove, the tile plays a reel. Everything else is words, because
   words are what those claims are. No illustrative widgets, no gradients.

   The last pillar is the action, so its tile runs the full width and ends on
   a text link to it. The copy is the content file's, untouched.

   The claim card at the bottom is the site's own photographic card, carried
   over exactly as it is on the home page — same ground, same scrim, same
   gradient CTA. Do not restyle it here. */

const CLAIM_BG = "bg-noir bg-cover bg-center bg-no-repeat bg-[url('/bg.png')]";
const CLAIM_SCRIM =
  "pointer-events-none absolute inset-0 " +
  "bg-[image:radial-gradient(85%_115%_at_50%_50%,rgba(14,12,17,0.82)_0%,rgba(14,12,17,0.7)_42%,rgba(14,12,17,0.4)_100%)]";

const [REALISM_REEL] = takeReels(reelVideos, 5, 1);

const TILE = "rounded-[28px] bg-white p-[clamp(24px,2.4vw,36px)]";
const TILE_H3 =
  "font-display text-[clamp(1.35rem,1.2rem+0.5vw,1.75rem)] font-bold leading-[1.12] tracking-[-0.026em] text-v3-ink";
const TILE_P = "mt-3 max-w-[42ch] text-pretty text-[1rem] leading-[1.5] text-v3-ink-2";

function Tile({ title, body, children, className = "", delay }: {
  title: string;
  body: string;
  children?: ReactNode;
  className?: string;
  delay: number;
}) {
  return (
    <UiReveal delay={delay} className={`h-full ${className}`}>
      <article className={`flex h-full flex-col ${TILE}`}>
        {children && <div className="mb-8">{children}</div>}
        <h3 className={`${children ? "mt-auto" : ""} ${TILE_H3}`}>{title}</h3>
        <p className={TILE_P}>{body}</p>
      </article>
    </UiReveal>
  );
}

/** A tile's figure: the claim's own number, in ink, at display size. */
function Figure({ children }: { children: ReactNode }) {
  return (
    <p className="whitespace-nowrap font-display text-[clamp(3.5rem,2.5rem+3.5vw,6rem)] font-extrabold leading-[0.9] tracking-[-0.05em] text-v3-ink">
      {children}
    </p>
  );
}

export function WhyUs() {
  const { why } = content;
  const [real, fast, cost, angles, built, dm] = why.pillars;

  return (
    <section id="why" aria-labelledby="v3-why-title" className={`bg-v3-band ${V3_SECTION}`}>
      <div className={V3_WRAP}>
        <div className="mx-auto max-w-[760px] text-center">
          <Eyebrow>{why.kicker}</Eyebrow>
          <h2 id="v3-why-title" className={`mt-3 text-v3-ink ${V3_H2}`}>
            <Highlight text={why.heading} />
          </h2>
          <p className={`mx-auto mt-5 max-w-[52ch] ${V3_LEAD}`}>{why.lead}</p>
        </div>

        {/* lap: [real real fast] [angles cost built] [dm dm dm].
            tab: [real real] [fast angles] [cost built] [dm dm]. */}
        <div className="mt-[clamp(40px,5vw,72px)] grid grid-cols-1 gap-4 tab:grid-cols-2 lap:grid-cols-3 lap:gap-5">
          <UiReveal delay={0} className="tab:col-span-2">
            <article className="grid h-full overflow-hidden rounded-[28px] bg-white phone:grid-cols-[1fr_auto]">
              <div className="flex flex-col justify-end p-[clamp(24px,2.4vw,36px)]">
                <h3 className="font-display text-[clamp(1.6rem,1.3rem+1vw,2.25rem)] font-bold leading-[1.08] tracking-[-0.03em] text-v3-ink">
                  {real.title}
                </h3>
                <p className={`${TILE_P} max-w-[38ch]`}>{real.body}</p>
              </div>
              {REALISM_REEL && (
                <div className="relative mx-[clamp(24px,2.4vw,36px)] mb-[clamp(24px,2.4vw,36px)] aspect-[9/16] w-[min(46vw,190px)] overflow-hidden rounded-[18px] bg-v3-band phone:ml-0 phone:mt-[clamp(24px,2.4vw,36px)] lap:w-[200px]">
                  <LazyVideo
                    src={REALISM_REEL.src}
                    poster={REALISM_REEL.poster}
                    lane="v3-why"
                    className="absolute inset-0 size-full object-cover"
                  />
                  <span className="v3-material-dark absolute bottom-2.5 left-2.5 rounded-full px-2.5 py-1 text-[0.75rem] font-medium tracking-[0.01em] text-white">
                    AI, not filmed
                  </span>
                </div>
              )}
            </article>
          </UiReveal>

          <Tile {...fast} delay={80}>
            <Figure>48h</Figure>
          </Tile>

          <Tile {...angles} delay={0}>
            <Figure>20–40</Figure>
          </Tile>

          <Tile {...cost} delay={80} />

          <Tile {...built} delay={0} />

          <UiReveal delay={80} className="tab:col-span-2 lap:col-span-3">
            <article className={`flex flex-col gap-6 tab:flex-row tab:items-end tab:justify-between ${TILE}`}>
              <div>
                <h3 className={TILE_H3}>{dm.title}</h3>
                <p className={TILE_P}>{dm.body}</p>
              </div>
              <TextLink href={contactUrl()} external ariaLabel="Send us a DM on X" className="shrink-0">
                {content.nav.cta}
              </TextLink>
            </article>
          </UiReveal>
        </div>

        {/* THE CLAIM CARD — unchanged from the home page. */}
        <div
          data-nav-dark
          className={`relative isolate mt-[clamp(32px,3.5vw,48px)] overflow-hidden rounded-3xl border border-white/10 p-[clamp(32px,3.5vw,48px)] text-center text-paper ${CLAIM_BG}`}
        >
          <div aria-hidden className={CLAIM_SCRIM} />

          <div className="relative flex flex-col items-center gap-6">
            <UiRevealText
              as="p"
              text={why.claim}
              stagger={30}
              className={`max-w-[26ch] text-pretty font-sans ${TEXT_STATEMENT} font-bold leading-[1.2] lap:leading-[1.1] tracking-[-0.022em]`}
            />
            <UiReveal delay={100}>
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
