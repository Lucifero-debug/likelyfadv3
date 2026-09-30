/* T-0088 HOW IT WORKS (round 3; Alex's alex-round3.md addendum, Aman msg 2634).
   Between the Work wall and Pricing, so the page explains before it prices:
   heading, sub, four numbered steps (cards in one row on desktop, one per row
   on phone), and the one big CTA. /v6 only. */
import { content } from "@/lib/content-v6";
import { Button } from "@/components/ui/Button";
import { SECTION, WRAP } from "@/lib/ui";

export function HowItWorks() {
  const { how } = content;
  return (
    <section id="how" aria-label="How it works" className={`${SECTION} bg-paper text-ink`}>
      <div className={`${WRAP} flex flex-col items-center text-center`}>
        <h2 className="max-w-[16em] text-balance font-display font-bold leading-[1.1] tracking-[-0.022em]">{how.heading}</h2>
        <p className="v6-how-sub mt-4 max-w-[34ch] font-sans text-ink-soft">{how.sub}</p>
        <ol className="v6-how-steps">
          {how.steps.map((step, i) => (
            <li key={step} className="v6-how-step">
              <span className="v6-how-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
        <Button contact variant="grad" withArrow className="v6-cta-lg">{how.cta}</Button>
      </div>
    </section>
  );
}
