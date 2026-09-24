import { content } from "@/lib/content";
import { TEXT_STATEMENT } from "@/lib/ui";
import { reelVideos } from "@/lib/reels.generated";
import { takeReels } from "@/lib/reelOrder";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { Button as UiButton } from "@/components/ui/Button";
import { Enter } from "./Enter";
import { GRID, SECTION, T, SectionHead, Tag } from "./primitives";

/* WHY US — a content group, the way ibm.com sets a list of reasons.

   The header holds the left rail (lg columns 1–4); the content takes 5–16.
   The first pillar is the FEATURE: the one claim a sentence can't prove, so it
   sits beside a clip that proves it. The other five follow it in the same
   column as plain content items — a 1px top rule, a heading-03, body-01 in
   text-secondary — two across from xlg.
   No icons, no indices, no illustrative widgets: the copy is the content, and
   the grid is what makes it read as a system. Copy is the content file's.

   The claim card at the bottom is the site's own photographic card, carried
   over exactly as it is on the home page (see memory: never restyle it). It
   is the one rounded, gradient thing on the page, on purpose. */

const CLAIM_BG = "bg-noir bg-cover bg-center bg-no-repeat bg-[url('/bg.png')]";
const CLAIM_SCRIM =
  "pointer-events-none absolute inset-0 " +
  "bg-[image:radial-gradient(85%_115%_at_50%_50%,rgba(14,12,17,0.82)_0%,rgba(14,12,17,0.7)_42%,rgba(14,12,17,0.4)_100%)]";

const [REALISM_REEL] = takeReels(reelVideos, 5, 1);

export function WhyUs() {
  const { why } = content;
  const [real, ...rest] = why.pillars;

  return (
    <section id="why" aria-labelledby="v5-why-title" className={`bg-cds-background ${SECTION}`}>
      <div className={`${GRID} gap-y-12`}>
        <SectionHead id="v5-why-title" kicker={why.kicker} heading={why.heading} lead={why.lead} />

        <Enter className="col-span-4 cds-md:col-span-8 cds-lg:col-span-12">
          {/* The clip holds lg columns 5–8 of the page, and the column
              beside it (9–16) carries the claims: the feature first,
              at fluid-heading-04, then the other five as a content group. */}
          <div className="grid grid-cols-4 gap-x-8 gap-y-8 cds-md:grid-cols-8 cds-lg:grid-cols-12">
            {REALISM_REEL && (
              <div className="col-span-4 cds-md:col-span-3 cds-lg:col-span-4">
                <div className="cds-skeleton aspect-[4/5] cds-md:aspect-[9/16]">
                  <LazyVideo
                    src={REALISM_REEL.src}
                    poster={REALISM_REEL.poster}
                    lane="v5-why"
                    placeholderClassName=""
                    className="absolute inset-0 size-full object-cover"
                  />
                  <Tag className="absolute bottom-3 left-3">AI, not filmed</Tag>
                </div>
              </div>
            )}

            <div className="col-span-4 cds-md:col-span-5 cds-lg:col-span-8">
              <div className="border-t border-cds-border-subtle pt-4">
                <h3 className={`text-cds-text-primary ${T.fluidH4}`}>{real.title}</h3>
                <p className={`mt-4 max-w-[48ch] text-pretty text-cds-text-secondary ${T.body02}`}>{real.body}</p>
              </div>

              <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 cds-xlg:grid-cols-2">
                {rest.map((p) => (
                  <li key={p.title} className="border-t border-cds-border-subtle pt-4">
                    <h3 className={`text-cds-text-primary ${T.heading03}`}>{p.title}</h3>
                    <p className={`mt-2 max-w-[40ch] text-pretty text-cds-text-secondary ${T.body01}`}>{p.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Enter>

        {/* THE CLAIM CARD — unchanged from the home page. */}
        <div
          data-nav-dark
          data-keep
          className={`relative isolate col-span-full overflow-hidden rounded-3xl border border-white/10 p-[clamp(32px,3.5vw,48px)] text-center text-paper ${CLAIM_BG}`}
        >
          <div aria-hidden className={CLAIM_SCRIM} />

          <div className="relative flex flex-col items-center gap-6">
            <RevealText
              as="p"
              text={why.claim}
              stagger={30}
              className={`max-w-[26ch] text-pretty font-sans ${TEXT_STATEMENT} font-bold leading-[1.2] lap:leading-[1.1] tracking-[-0.022em]`}
            />
            <Reveal delay={100}>
              <UiButton contact variant="grad" withArrow>
                {why.claimCta}
              </UiButton>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
