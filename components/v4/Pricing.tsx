import { content } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { V4_SECTION, V4_WRAP, T, Button, Icon, SectionHeader } from "./primitives";

/* PRICING — one offer, so one card. The pitch sits on the band; what every
   quote includes sits in an ELEVATED card (the one place on the page a card
   gets a shadow, because it is the one the page wants you to act in), as an
   M3 list with leading icons, with the filled button closing it. */
export function Pricing() {
  const { pricing } = content;
  return (
    <section id="pricing" aria-labelledby="v4-pricing-title" className={`bg-m3-surface-container-low ${V4_SECTION}`}>
      <div className={`${V4_WRAP} grid items-center gap-10 expanded:grid-cols-[1fr_1fr] expanded:gap-16`}>
        <div>
          <SectionHeader id="v4-pricing-title" kicker={pricing.kicker} heading={pricing.heading} lead={pricing.body} />
        </div>

        <Reveal>
          <div className="rounded-[28px] bg-m3-surface-container-lowest p-3 shadow-[var(--m3-elev-1)]">
            <ul className="flex flex-col">
              {pricing.includes.map((item, i) => (
                <li
                  key={item}
                  className={`flex min-h-[72px] items-center gap-4 px-4 py-3 text-m3-on-surface ${T.bodyL} ${
                    i > 0 ? "border-t border-m3-outline-variant" : ""
                  }`}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-m3-primary-container text-m3-on-primary-container">
                    <Icon name="check" size={20} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-col gap-3 rounded-[20px] bg-m3-surface-container p-5 medium:flex-row medium:items-center medium:justify-between">
              <p className={`text-m3-on-surface-variant ${T.bodyM}`}>{pricing.foot}</p>
              <Button contact variant="filled" size="m">
                {pricing.cta}
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
