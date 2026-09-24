import { content } from "@/lib/content";
import { TEXT_STATEMENT } from "@/lib/ui";
import { reelVideos } from "@/lib/reels.generated";
import { takeReels } from "@/lib/reelOrder";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { Button as UiButton } from "@/components/ui/Button";
import { PAGE, BAND, T, Badge, Card, SectionHeader, title } from "./primitives";

/* WHY US — the admin's standard two-column Layout.

   The main card is a list, not a grid of feature tiles: one row per pillar,
   the claim and its explanation on the left and the plain fact it comes down
   to on the right, the way a settings or order page reads. No icon tiles, no
   illustrative widgets; the fact column does the work those were faking.
   Every fact is a restatement of the pillar's own copy, never a new claim.

   The secondary card is one clip from the library, because "it looks real"
   is the one claim a sentence can't prove.

   The claim card at the bottom is the site's own photographic card, carried
   over exactly as it is on the home page (see memory: never restyle it). */

const CLAIM_BG = "bg-noir bg-cover bg-center bg-no-repeat bg-[url('/bg.png')]";
const CLAIM_SCRIM =
  "pointer-events-none absolute inset-0 " +
  "bg-[image:radial-gradient(85%_115%_at_50%_50%,rgba(14,12,17,0.82)_0%,rgba(14,12,17,0.7)_42%,rgba(14,12,17,0.4)_100%)]";

const [REALISM_REEL] = takeReels(reelVideos, 5, 1);

/* The fact each pillar comes down to, in pillar order. */
const FACTS = [
  "Checked by a person",
  "About 48 hours",
  "No crew or location",
  "20 to 40 a month",
  "9:16, 4:5, 1:1, 16:9",
  "A product link",
];

export function WhyUs() {
  const { why } = content;

  return (
    <section id="why" aria-labelledby="v6-why-title" className={BAND}>
      <div className={PAGE}>
        <SectionHeader id="v6-why-title" heading={why.heading} lead={why.lead} />

        <div className="mt-6 grid items-start gap-4 p-lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card padded={false}>
            <h3 className={`px-4 pt-4 text-p-text p-sm:px-5 ${T.headingMd}`}>What you get</h3>
            <dl className="mt-2">
              {why.pillars.map((p, i) => (
                <div
                  key={p.title}
                  className="grid gap-x-6 gap-y-1 border-t border-p-border-secondary px-4 py-3.5 p-sm:px-5 p-md:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <dt className={`text-p-text ${T.headingMd}`}>{title(p.title)}</dt>
                  <dd className={`max-w-[56ch] text-pretty text-p-text-secondary ${T.bodyMd}`}>{p.body}</dd>
                  <dd
                    className={`mt-1 font-medium text-p-text p-md:col-start-2 p-md:row-span-2 p-md:row-start-1 p-md:mt-0 p-md:text-right p-md:font-normal ${T.bodyMd}`}
                  >
                    {FACTS[i]}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          {REALISM_REEL && (
            <Card as="figure" padded={false}>
              <div className="flex items-center justify-between gap-2 px-4 pt-4">
                <h3 className={`text-p-text ${T.headingMd}`}>From the library</h3>
                <Badge>AI, not filmed</Badge>
              </div>
              <div className="relative m-4 mb-0 aspect-[4/5] overflow-hidden rounded-lg bg-p-bg-fill-secondary p-lg:aspect-[9/16]">
                <LazyVideo
                  src={REALISM_REEL.src}
                  poster={REALISM_REEL.poster}
                  lane="v6-why"
                  placeholderClassName="bg-p-bg-fill-secondary"
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
              <figcaption className={`px-4 py-3 text-p-text-secondary ${T.bodySm}`}>
                No crew, no location. A person checked every frame before it shipped.
              </figcaption>
            </Card>
          )}
        </div>

        {/* THE CLAIM CARD — unchanged from the home page. */}
        <div
          data-nav-dark
          data-keep
          className={`relative isolate mt-[clamp(32px,3.5vw,48px)] overflow-hidden rounded-3xl border border-white/10 p-[clamp(32px,3.5vw,48px)] text-center text-paper ${CLAIM_BG}`}
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
