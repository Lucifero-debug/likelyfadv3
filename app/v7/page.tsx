import { AdWall } from "@/components/v7/AdWall";
import { Questions } from "@/components/v7/Questions";
import { StepIcon } from "@/components/v7/StepIcon";
import { StoryVideo } from "@/components/v7/StoryVideo";
import { CTA } from "@/lib/content";
import { contentV7 as copy } from "@/lib/content-v7";
import { spreadReels } from "@/lib/reelOrder";
import { reelVideos } from "@/lib/reels.generated";
import { contactUrl } from "@/lib/site";

function Contact({ small = false }: { small?: boolean }) {
  return <a className={`v7-cta${small ? " v7-cta-small" : ""}`} href={contactUrl()} target="_blank" rel="noopener noreferrer">{CTA}</a>;
}

export default function V7Page() {
  const ordered = spreadReels(reelVideos.filter((reel) => reel.poster));
  const perRow = Math.ceil(ordered.length / 3);
  const rows = [0, 1, 2].map((index) => ordered.slice(index * perRow, (index + 1) * perRow));
  const storyReel = reelVideos.find((reel) => reel.id === copy.story.reel)!;

  return (
    <>
      <header className="v7-product-bar">
        <div className="v7-bar-inner">
          <span className="v7-wordmark">Likelyfad</span>
          <Contact small />
        </div>
      </header>
      <main>
        <section id="hero" className="v7-hero" aria-labelledby="v7-hero-title">
          <p className="v7-eyebrow">{copy.hero.label}</p>
          <h1 id="v7-hero-title" className="v7-display">{copy.hero.lines[0]}<br />{copy.hero.lines[1]}</h1>
          <p className="v7-sub v7-hero-sub">{copy.hero.sub}</p>
          <Contact />
        </section>

        <AdWall rows={rows} />

        <section id="numbers" className="v7-numbers v7-container" aria-label="The numbers">
          {copy.numbers.map((number) => (
            <div className="v7-stat" key={number.value}>
              <p className="v7-stat-statement"><span>{number.value}</span><br />{number.line}</p>
              <p className="v7-source">{number.source}</p>
            </div>
          ))}
        </section>

        <section id="story" className="v7-story v7-container" aria-label="Client result">
          <figure>
            <StoryVideo reel={storyReel} />
            <figcaption>
              <strong>{copy.story.label}</strong>{" "}
              <span className="v7-caption-long">{copy.story.caption}</span>
              <span className="v7-caption-short">{copy.story.shortCaption}</span>
            </figcaption>
          </figure>
        </section>

        <section id="how" className="v7-section v7-how" aria-labelledby="v7-how-title">
          <div className="v7-section-heading">
            <h2 id="v7-how-title">{copy.how.heading}</h2>
            <p className="v7-sub">{copy.how.sub}</p>
          </div>
          <div className="v7-steps">
            {copy.how.steps.map((step) => (
              <article className="v7-step" key={step.icon}>
                <StepIcon icon={step.icon} />
                <h3>{step.title}</h3>
                <p>{step.line}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="v7-section v7-pricing" aria-labelledby="v7-pricing-title">
          <div className="v7-section-heading">
            <h2 id="v7-pricing-title">{copy.pricing.heading}</h2>
            <p className="v7-sub">{copy.pricing.sub}</p>
          </div>
          <div className="v7-pricing-card">
            <h3>{copy.pricing.title}</h3>
            <div className="v7-pricing-lines">{copy.pricing.lines.map((line) => <p key={line}>{line}</p>)}</div>
            <Contact />
            <p className="v7-pricing-small">{copy.pricing.small}</p>
          </div>
        </section>

        <section id="faq" className="v7-section v7-faq" aria-labelledby="v7-faq-title">
          <div className="v7-section-heading"><h2 id="v7-faq-title">{copy.faq.heading}</h2></div>
          <Questions items={copy.faq.items} />
        </section>

        <section id="close" className="v7-section v7-close" aria-labelledby="v7-close-title">
          <h2 id="v7-close-title" className="v7-display">{copy.close.lines[0]}<br />{copy.close.lines[1]}</h2>
          <p className="v7-sub">{copy.close.sub}</p>
          <Contact />
        </section>
      </main>
      <footer className="v7-footer"><p>{copy.footer}</p></footer>
    </>
  );
}
