import { content } from "@/lib/content";
import { reelVideos } from "@/lib/reels.generated";
import { takeReels } from "@/lib/reelOrder";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { V4_WRAP, T, Button, Chip, Highlight, Icon } from "./primitives";

/* THE HERO — one display headline, a filled and an outlined button, and the
   work itself.

   THE COMPOSITION IS THREE CLIPS ON A GRID, not a collage. The lead clip
   takes the ARCH, the one Expressive shape the page uses, because a single
   shape reads as a decision where five read as decoration; the other two sit
   stacked beside it at the extra-large (28dp) corner. All three share edges,
   so the group reads as one object at every width.

   No stat row under it: the two facts that matter are already in the
   reassurance line, and the Why us section makes the rest of the case. */

const [LEAD, SIDE_A, SIDE_B] = takeReels(reelVideos, 0, 3);

export function Hero() {
  const { hero } = content;

  return (
    <section
      id="top"
      aria-labelledby="v4-hero-title"
      className="overflow-x-clip pb-[clamp(56px,4rem+2vw,96px)] pt-[calc(var(--v4-bar)+clamp(32px,5vw,80px))]"
    >
      <div className={`${V4_WRAP} grid items-center gap-12 expanded:grid-cols-[1.1fr_0.9fr] expanded:gap-10`}>
        <div className="flex flex-col items-start">
          <p className={`m3-enter text-m3-primary ${T.titleM}`}>{hero.eyebrow}</p>
          <h1
            id="v4-hero-title"
            className={`m3-enter mt-4 max-w-[13ch] text-m3-on-surface ${T.displayL}`}
            style={{ animationDelay: "50ms" }}
          >
            <Highlight text={hero.headline} />
          </h1>
          <p
            className={`m3-enter mt-6 max-w-[46ch] text-pretty text-m3-on-surface-variant ${T.bodyLFluid}`}
            style={{ animationDelay: "100ms" }}
          >
            {hero.subline}
          </p>
          <div className="m3-enter mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "150ms" }}>
            <Button contact variant="filled" size="m">
              {hero.primaryCta}
            </Button>
            <Button href={hero.secondaryHref} variant="outlined" size="m">
              {hero.secondaryCta}
            </Button>
          </div>
          <ul
            className={`m3-enter mt-8 flex flex-col gap-2 text-m3-on-surface-variant medium:flex-row medium:gap-6 ${T.bodyM}`}
            style={{ animationDelay: "200ms" }}
          >
            {hero.reassurance.split(" · ").map((line) => (
              <li key={line} className="flex items-center gap-2">
                <Icon name="check" size={18} className="text-m3-primary" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <figure className="m3-enter mx-auto w-full max-w-[520px] expanded:max-w-none" style={{ animationDelay: "120ms" }}>
          <div role="img" aria-label={content.reels.caption} className="grid grid-cols-[1.3fr_1fr] gap-2">
            {LEAD && (
              <div className="m3-shape-arch relative aspect-[9/16] overflow-hidden bg-m3-surface-container-high">
                <LazyVideo
                  src={LEAD.src}
                  poster={LEAD.poster}
                  lane="v4-hero"
                  immediate
                  preload="auto"
                  className="absolute inset-0 size-full object-cover"
                />
                <Chip className="absolute bottom-4 left-4 bg-m3-inverse-surface/90 text-m3-inverse-on-surface">
                  AI, not filmed
                </Chip>
              </div>
            )}
            <div className="grid grid-rows-2 gap-2">
              {[SIDE_A, SIDE_B].map(
                (reel) =>
                  reel && (
                    <div key={reel.id} className="relative overflow-hidden rounded-[28px] bg-m3-surface-container-high">
                      <LazyVideo
                        src={reel.src}
                        poster={reel.poster}
                        lane="v4-hero"
                        immediate
                        preload="metadata"
                        className="absolute inset-0 size-full object-cover"
                      />
                    </div>
                  )
              )}
            </div>
          </div>
          <figcaption className={`mt-4 text-m3-on-surface-variant ${T.bodyM}`}>{content.reels.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
