import { content } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { V3_H2, V3_LEAD, V3_SECTION, V3_WRAP, Eyebrow, Highlight, Pill } from "./primitives";

/* PRICING — one card, because there is one offer. The pitch on the left, what
   every quote includes on the right, the action under the list it answers. */
export function Pricing() {
  const { pricing } = content;
  return (
    <section id="pricing" aria-labelledby="v3-pricing-title" className={`bg-v3-band ${V3_SECTION}`}>
      <div className={V3_WRAP}>
        <Reveal>
          <div className="grid overflow-hidden rounded-[32px] bg-white lap:grid-cols-[1.15fr_1fr]">
            <div className="p-[clamp(28px,4vw,64px)]">
              <Eyebrow>{pricing.kicker}</Eyebrow>
              <h2 id="v3-pricing-title" className={`mt-3 text-v3-ink ${V3_H2}`}>
                <Highlight text={pricing.heading} />
              </h2>
              <p className={`mt-5 max-w-[46ch] ${V3_LEAD}`}>{pricing.body}</p>
            </div>

            <div className="flex flex-col justify-center gap-8 border-t border-v3-line p-[clamp(28px,4vw,64px)] lap:border-l lap:border-t-0">
              <ul className="flex flex-col gap-4">
                {pricing.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[1.0625rem] leading-[1.4] text-v3-ink">
                    <span
                      aria-hidden="true"
                      className="mt-[3px] grid size-5 shrink-0 place-items-center text-v3-ink"
                    >
                      <svg viewBox="0 0 12 12" width="16" height="16">
                        <path
                          d="m2.5 6.2 2.3 2.3L9.5 3.8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col items-start gap-3">
                <Pill contact tone="ink">
                  {pricing.cta}
                </Pill>
                <p className="text-[0.9rem] text-v3-ink-2">{pricing.foot}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
