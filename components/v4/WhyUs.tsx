import { content } from "@/lib/content";
import { TEXT_STATEMENT } from "@/lib/ui";
import { reelVideos } from "@/lib/reels.generated";
import { takeReels } from "@/lib/reelOrder";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { Button as UiButton } from "@/components/ui/Button";
import { V4_SECTION, V4_WRAP, T, Chip, SectionHeader } from "./primitives";

/* WHY US — one filled card, then a list.

   The claim that carries the pitch (realism) gets the page's one
   primary-container card, beside a clip that proves it. The other five are
   an M3 list, not five more cards: a title-large headline and body text per
   item, split by outline-variant dividers, two across from expanded. No icon
   tiles, no illustrative widgets, no colour per card: the colour roles only
   mark what matters most, which is what they are for. Copy is the content
   file's, untouched.

   The claim card at the bottom is the site's own photographic card, carried
   over exactly as it is on the home page. Do not restyle it here. */

const CLAIM_BG = "bg-noir bg-cover bg-center bg-no-repeat bg-[url('/bg.png')]";
const CLAIM_SCRIM =
  "pointer-events-none absolute inset-0 " +
  "bg-[image:radial-gradient(85%_115%_at_50%_50%,rgba(14,12,17,0.82)_0%,rgba(14,12,17,0.7)_42%,rgba(14,12,17,0.4)_100%)]";

const [REALISM_REEL] = takeReels(reelVideos, 5, 1);

export function WhyUs() {
  const { why } = content;
  const [real, ...rest] = why.pillars;

  return (
    <section id="why" aria-labelledby="v4-why-title" className={`bg-m3-surface-container-low ${V4_SECTION}`}>
      <div className={V4_WRAP}>
        <SectionHeader id="v4-why-title" kicker={why.kicker} heading={why.heading} lead={why.lead} />

        <Reveal className="mt-[clamp(40px,5vw,64px)]">
          <article className="grid overflow-hidden rounded-[28px] bg-m3-primary-container text-m3-on-primary-container medium:grid-cols-[1fr_auto]">
            <div className="flex flex-col justify-center p-6 medium:p-10">
              <h3 className={T.displayS}>{real.title}</h3>
              <p className={`mt-4 max-w-[44ch] text-pretty opacity-[0.86] ${T.bodyLFluid}`}>{real.body}</p>
            </div>
            {REALISM_REEL && (
              <div className="relative mx-3 mb-3 aspect-[4/5] overflow-hidden rounded-2xl bg-m3-surface-container-high medium:m-3 medium:aspect-[9/16] medium:w-[240px]">
                <LazyVideo
                  src={REALISM_REEL.src}
                  poster={REALISM_REEL.poster}
                  lane="v4-why"
                  className="absolute inset-0 size-full object-cover"
                />
                <Chip className="absolute bottom-3 left-3 bg-m3-inverse-surface/90 text-m3-inverse-on-surface">
                  AI, not filmed
                </Chip>
              </div>
            )}
          </article>
        </Reveal>

        <ul className="mt-10 grid gap-x-10 expanded:grid-cols-2">
          {rest.map((p) => (
            <li key={p.title} className="border-t border-m3-outline-variant py-6">
              <h3 className={`text-m3-on-surface ${T.titleL}`}>{p.title}</h3>
              <p className={`mt-2 max-w-[48ch] text-pretty text-m3-on-surface-variant ${T.bodyL}`}>{p.body}</p>
            </li>
          ))}
        </ul>

        {/* THE CLAIM CARD — unchanged from the home page. */}
        <div
          data-nav-dark
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
