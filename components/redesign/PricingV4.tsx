import { content } from "@/lib/redesign/content";
import { Button } from "@/components/ui/Button";
import { ANCHOR, SECTION, TEXT_LEAD, TEXT_META, WRAP } from "@/lib/redesign/ui";

const { pricing } = content;

/* Pricing: one oversized line, then how a quote works, what it includes, and
   the ask, side by side.

   THE PAGE'S ONE BAND OF COLOUR. Pink means "message us" everywhere else on
   the page, so this is that colour grown into a field, and its button flips to
   ink to stay visible on it. Ink on #f0407f is 5:1, so every line here is
   full-strength ink, never ink-soft. data-band="pink" swaps the focus ring to
   ink (globals.css).

   There is no price to show, so it does not pretend to be a pricing table, and
   it uses no rules: those are the FAQ's. */
export function PricingV4() {
  return (
    <section
      id="pricing"
      data-band="pink"
      className={`${ANCHOR} ${SECTION} bg-pink text-ink`}
      aria-label={pricing.kicker}
    >
      <div className={WRAP}>
        <h2 className="text-balance font-display text-[clamp(3rem,0.9rem+6.6vw,8rem)] font-extrabold leading-[0.9]">
          {pricing.heading}
        </h2>

        <div className="mt-[clamp(32px,4.5vw,64px)] grid gap-10 lap:grid-cols-3 lap:gap-12">
          <p className={`max-w-[38ch] text-pretty font-sans ${TEXT_LEAD} leading-normal`}>
            {pricing.body}
          </p>

          <ul className="flex flex-col gap-3">
            {pricing.includes.map((item) => (
              <li
                key={item}
                className="flex items-baseline gap-3 font-sans text-[clamp(1rem,0.95rem+0.25vw,1.2rem)] font-semibold leading-snug"
              >
                <span aria-hidden="true">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-start gap-3 lap:items-end lap:text-right">
            <Button contact variant="dark">
              {pricing.cta}
            </Button>
            <p className={`font-sans ${TEXT_META}`}>{pricing.foot}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
