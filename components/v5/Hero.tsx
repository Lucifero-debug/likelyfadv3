import { content } from "@/lib/content";
import { reelVideos } from "@/lib/reels.generated";
import { takeReels } from "@/lib/reelOrder";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { GRID, T, Button, Eyebrow, Icon, Tag, TwoTone } from "./primitives";

/* THE LEAD SPACE — Carbon's expressive moment, on Gray 100.

   Text on lg columns 1–8, the work on 10–16. The reels are a CONDENSED tile
   set: three 9:16 tiles with 1px gutters, all
   square, all snapped to the same edges. No offsets, no tilt, no overlap,
   no invented labels on them — the grid is the composition.

   Under it the three claims run as a stat row: each one a 4-column cell with
   a 1px rule on its top edge, which is how IBM lays figures out. */

const REELS = takeReels(reelVideos, 0, 3);

const STATS = [
  { big: "48h", small: "To your first concepts" },
  { big: "20–40", small: "Distinct variants a month" },
  { big: "1 DM", small: "To start. No forms, no onboarding" },
];

export function Hero() {
  const { hero, reels } = content;

  return (
    <section
      id="top"
      aria-labelledby="v5-hero-title"
      className="cds-g100 border-b border-cds-border-subtle bg-cds-background pb-16 pt-[calc(var(--v5-header)+64px)] text-cds-text-primary cds-lg:pb-24 cds-lg:pt-[calc(var(--v5-header)+96px)]"
    >
      <div className={`${GRID} gap-y-16`}>
        <div className="col-span-4 flex flex-col items-start cds-md:col-span-8 cds-lg:col-span-8">
          <Eyebrow className="cds-enter">
            {hero.eyebrow}
          </Eyebrow>
          <h1
            id="v5-hero-title"
            className={`cds-enter mt-6 max-w-[14ch] ${T.display}`}
            style={{ animationDelay: "70ms" }}
          >
            <TwoTone text={hero.headline} />
          </h1>
          <p
            className={`cds-enter mt-8 max-w-[44ch] text-pretty text-cds-text-secondary ${T.paragraph}`}
            style={{ animationDelay: "140ms" }}
          >
            {hero.subline}
          </p>

          {/* A Carbon button set: flush, no gap, stacked full width on sm. */}
          <div
            className="cds-enter mt-12 flex w-full flex-col gap-px cds-md:w-auto cds-md:flex-row"
            style={{ animationDelay: "210ms" }}
          >
            <Button contact kind="primary" size="lg" icon="arrowRight" className="cds-md:min-w-[256px]">
              {hero.primaryCta}
            </Button>
            <Button href={hero.secondaryHref} kind="secondary" size="lg" className="cds-md:min-w-[192px]">
              {hero.secondaryCta}
            </Button>
          </div>

          <ul
            className={`cds-enter mt-8 flex flex-col gap-2 text-cds-text-secondary cds-md:flex-row cds-md:gap-8 ${T.bodyCompact01}`}
            style={{ animationDelay: "280ms" }}
          >
            {hero.reassurance.split(" · ").map((line) => (
              <li key={line} className="flex items-center gap-2">
                <Icon name="checkmark" size={16} className="text-cds-icon-secondary" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <figure
          className="cds-enter col-span-4 cds-md:col-span-6 cds-md:col-start-2 cds-lg:col-span-7 cds-lg:col-start-10 cds-lg:self-end"
          style={{ animationDelay: "140ms" }}
        >
          <div role="img" aria-label={reels.caption} className="grid grid-cols-3 gap-px bg-cds-border-subtle p-px">
            {REELS.map((reel, i) => (
              <div key={reel.id} className="cds-skeleton aspect-[9/16]">
                  <LazyVideo
                    src={reel.src}
                    poster={reel.poster}
                    lane="v5-hero"
                    immediate
                    preload={i === 0 ? "auto" : "metadata"}
                    placeholderClassName=""
                    className="absolute inset-0 size-full object-cover"
                  />
              </div>
            ))}
          </div>
          <figcaption className={`mt-4 flex items-center gap-3 text-cds-text-helper ${T.label01}`}>
            <Tag>AI, not filmed</Tag>
            {reels.caption}
          </figcaption>
        </figure>
      </div>

      {/* THE STAT ROW. */}
      <dl className={`${GRID} mt-24 gap-y-8 cds-lg:mt-32`}>
        {STATS.map((s) => (
          <div
            key={s.big}
            className="col-span-4 flex flex-col border-t border-cds-border-strong pt-4 cds-md:col-span-8 cds-lg:col-span-4"
          >
            <dt className={`order-2 mt-2 text-cds-text-secondary ${T.bodyCompact01}`}>{s.small}</dt>
            <dd className={`order-1 ${T.fluidH4} tabular-nums`}>{s.big}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
