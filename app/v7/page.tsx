import { AdWall } from "@/components/v7a/AdWall";
import { Closer } from "@/components/v7a/Closer";
import { Highlights } from "@/components/v7a/Highlights";
import { MediaProvider, ReelVideo } from "@/components/v7a/Media";
import { ProductBar, ResultReveal } from "@/components/v7a/PageMotion";
import { Questions } from "@/components/v7a/Questions";
import { CTA } from "@/lib/content";
import { contentV7 as copy, HERO } from "@/lib/content-v7";
import { spreadReels } from "@/lib/reelOrder";
import { reelVideos } from "@/lib/reels.generated";
import { contactUrl } from "@/lib/site";

function Contact({ small = false }: { small?: boolean }) {
  return <a className={`v7-cta${small ? " v7-cta-small" : ""}`} href={contactUrl()} target="_blank" rel="noopener noreferrer">{CTA}</a>;
}

export default function V7Page() {
  const reel = (id: string) => reelVideos.find((item) => item.id === id)!;
  const ordered = spreadReels(reelVideos.filter((item) => item.poster));
  const heroIds = HERO.variant === "chip" ? ["0616", HERO.reel, "ai-podcast"] : ["ai-podcast", "0616", "boyfriend-angle-ai"];
  const used = new Set(heroIds);
  used.add(copy.results.reel);
  used.add(copy.closer.reel);
  const closeId = "v3057";
  used.add(closeId);
  const highlights: string[] = [];
  for (const item of ordered) {
    if (highlights.length === 4) break;
    if (used.has(item.id)) continue;
    highlights.push(item.id);
    used.add(item.id);
  }
  const wall = ordered.filter((item) => !used.has(item.id));
  const midpoint = Math.ceil(wall.length / 2);

  return (
    <MediaProvider>
      <ProductBar><span className="v7-wordmark">{copy.hero.name}</span><Contact small /></ProductBar>
      <main>
        <section id="hero" className="v7-hero" data-variant={HERO.variant} aria-labelledby="v7-name">
          <div className="v7-hero-inner">
            <div className="v7-hero-copy">
              <h1 id="v7-name" className="v7-wordmark">{copy.hero.name}</h1>
              <p className="v7-hero-claim" data-hero-claim>{copy.hero.lines[0]}<br />{copy.hero.lines[1]}</p>
              <p className="v7-sub">{HERO.variant === "chip" ? copy.hero.sub : copy.hero.threeSub}</p>
              <Contact />
            </div>
            <div className="v7-hero-stage">
              <div className="v7-hero-back v7-hero-back-left"><ReelVideo reel={reel(heroIds[0])} priority={1} /></div>
              <figure className="v7-hero-main">
                <ReelVideo reel={reel(heroIds[1])} priority={10} soundControl eager
                  segment={HERO.variant === "chip" ? HERO.segment : undefined}
                  poster={HERO.variant === "chip" ? "/v7/hero-boyfriend-angle-ai.jpg" : undefined} />
                {HERO.variant === "chip" && <figcaption>{copy.hero.ad}</figcaption>}
              </figure>
              <div className="v7-hero-back v7-hero-back-right"><ReelVideo reel={reel(heroIds[2])} priority={1} /></div>
              {HERO.variant === "chip" && <>
                <div className="v7-chip-connector" aria-hidden="true" />
                <figure className="v7-product-chip" data-chip-seconds={HERO.chipAtSeconds}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/v7/chip-${HERO.chipReel}.jpg`} alt="" width={480} height={854} fetchPriority="high" />
                  <figcaption>{copy.hero.product}</figcaption>
                </figure>
              </>}
            </div>
          </div>
        </section>
        <Highlights reels={highlights.map(reel)} lines={copy.highlights.lines} heading={copy.highlights.heading} />
        <AdWall rows={[wall.slice(0, midpoint), wall.slice(midpoint)]} heading={copy.work.heading} line={copy.work.line} pauseLabel={copy.work.pause} />
        <section id="results" className="v7-section v7-results" aria-labelledby="v7-results-title">
          <div className="v7-container">
            <h2 id="v7-results-title" className="v7-chapter-title">{copy.results.heading}</h2>
            <div className="v7-results-grid">
              <ResultReveal><p className="v7-result-number">{copy.results.number}</p><p className="v7-result-label">{copy.results.label}</p></ResultReveal>
              <figure className="v7-result-film"><ReelVideo reel={reel(copy.results.reel)} priority={8} soundControl /><figcaption>{copy.results.caption}</figcaption></figure>
            </div>
          </div>
        </section>
        <Closer reel={reel(copy.closer.reel)} heading={copy.closer.heading} steps={copy.closer.steps} meta={copy.closer.meta} />
        <section id="plan" className="v7-section v7-plan" aria-labelledby="v7-plan-title">
          <div className="v7-container">
            <h2 id="v7-plan-title" className="v7-chapter-title">{copy.plan.heading}</h2>
            <p className="v7-plan-question">{copy.plan.question}</p>
            <div className="v7-plan-columns">{copy.plan.columns.map((column) => <article key={column.title}><h3>{column.title}</h3><ul>{column.lines.map((line) => <li key={line}>{line}</li>)}</ul></article>)}</div>
            <Contact /><p className="v7-plan-small">{copy.plan.small}</p>
          </div>
        </section>
        <section id="faq" className="v7-section v7-faq" aria-labelledby="v7-faq-title">
          <div className="v7-container"><h2 id="v7-faq-title" className="v7-chapter-title">{copy.faq.heading}</h2><Questions items={copy.faq.items} /></div>
        </section>
        <section id="close" className="v7-section v7-close" aria-labelledby="v7-close-title">
          <div className="v7-container v7-close-inner">
            <div className="v7-close-film"><ReelVideo reel={reel(closeId)} priority={5} /></div>
            <div><h2 id="v7-close-title">{copy.close.lines[0]}<br />{copy.close.lines[1]}</h2><p className="v7-sub">{copy.close.sub}</p><Contact /></div>
          </div>
        </section>
      </main>
    </MediaProvider>
  );
}
