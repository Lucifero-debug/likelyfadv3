import { content } from "@/lib/content";
import { reelVideos } from "@/lib/reels.generated";
import { takeReels } from "@/lib/reelOrder";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { PAGE, T, Badge, Button, Card, title } from "./primitives";

/* THE PAGE HEADER, then a two-column Layout.

   The header is Polaris's Page header at landing scale: a magic-tone badge
   (Polaris's tone for AI features, which is exactly what this is), the title,
   one line of subtitle, and the page's ONE primary action beside a secondary.

   Under it, the admin's standard layout: the main card (the work) and a
   narrower secondary card (a summary, like the order summary beside an
   order). The summary is a description list, not big-number stat tiles —
   Polaris doesn't do display figures. */

const REELS = takeReels(reelVideos, 0, 3);

const SUMMARY = [
  { term: "First concepts", value: "In about 48 hours" },
  { term: "Variants", value: "20 to 40 a month" },
  { term: "Revisions", value: "Until you sign off" },
];

export function Hero() {
  const { hero, reels } = content;

  return (
    <section id="top" aria-labelledby="v6-hero-title" className="pb-10 pt-8 p-lg:pb-16 p-lg:pt-12">
      <div className={PAGE}>
        <p className={`text-p-text-secondary ${T.bodyMd} font-medium`}>{hero.eyebrow}</p>
        <h1 id="v6-hero-title" className={`mt-2 max-w-[20ch] text-p-text ${T.pageTitle}`}>
          {title(hero.headline)}
        </h1>
        <p className={`mt-3 max-w-[60ch] text-pretty text-p-text-secondary ${T.bodyLg}`}>{hero.subline}</p>
        <div className="mt-6 flex flex-col gap-2 p-sm:flex-row">
          <Button contact variant="primary">
            {hero.primaryCta}
          </Button>
          <Button href={hero.secondaryHref} variant="secondary">
            See why brands stay
          </Button>
        </div>

        <div className="mt-8 grid gap-4 p-lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card as="figure">
            <div className="flex items-center justify-between gap-2">
              <h2 className={`text-p-text ${T.headingMd}`}>Recent work</h2>
              <Badge>AI, not filmed</Badge>
            </div>
            <div role="img" aria-label={reels.caption} className="mt-4 grid grid-cols-3 gap-2 p-sm:gap-3">
              {REELS.map((reel, i) => (
                <div key={reel.id} className="relative aspect-[9/16] overflow-hidden rounded-lg bg-p-bg-fill-secondary">
                  <LazyVideo
                    src={reel.src}
                    poster={reel.poster}
                    lane="v6-hero"
                    immediate
                    preload={i === 0 ? "auto" : "metadata"}
                    placeholderClassName="bg-p-bg-fill-secondary"
                    className="absolute inset-0 size-full object-cover"
                  />
                </div>
              ))}
            </div>
            <figcaption className={`mt-3 text-p-text-secondary ${T.bodySm}`}>{reels.caption}</figcaption>
          </Card>

          <Card className="self-start">
            <h2 className={`text-p-text ${T.headingMd}`}>At a glance</h2>
            <dl className={`mt-2 ${T.bodyMd}`}>
              {SUMMARY.map((s) => (
                <div key={s.term} className="flex items-center justify-between gap-4 border-b border-p-border-secondary py-2.5">
                  <dt className="text-p-text-secondary">{s.term}</dt>
                  <dd className="text-right text-p-text">{s.value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-p-text-secondary">Human review</dt>
                <dd>
                  <Badge tone="success" icon="check">
                    Every frame
                  </Badge>
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </section>
  );
}
