import { content } from "@/lib/content";
import { Enter } from "./Enter";
import { GRID, SECTION, T, Button, Icon, SectionHead } from "./primitives";

/* PRICING — one offer, so one tile, built like a Carbon side-panel footer.

   The pitch sits in the left rail with the rest of the headers. The tile
   (lg columns 5–12) is a STRUCTURED LIST: a heading-compact row, then one
   48px row per inclusion, each ruled with border-subtle and led by a
   checkmark. It closes on the pattern Carbon uses to end a modal: the helper
   line on the left half, and a full-bleed xl primary button filling the right
   half edge to edge, label top-left, arrow top-right. */
export function Pricing() {
  const { pricing } = content;

  return (
    <section id="pricing" aria-labelledby="v5-pricing-title" className={`bg-cds-background ${SECTION}`}>
      <div className={`${GRID} gap-y-12`}>
        <SectionHead id="v5-pricing-title" kicker={pricing.kicker} heading={pricing.heading} />

        <Enter className="col-span-4 cds-md:col-span-8 cds-lg:col-span-11 cds-xlg:col-span-9">
          <p className={`max-w-[56ch] text-pretty text-cds-text-secondary ${T.paragraph}`}>{pricing.body}</p>

          <div className="mt-12 bg-cds-layer">
            <p className={`border-b border-cds-border-subtle px-4 py-4 text-cds-text-primary ${T.headingCompact01}`}>
              Every quote includes
            </p>
            <ul>
              {pricing.includes.map((item) => (
                <li
                  key={item}
                  className={`flex min-h-12 items-center gap-4 border-b border-cds-border-subtle px-4 py-3 text-cds-text-primary ${T.body01}`}
                >
                  <Icon name="checkmark" size={16} className="text-cds-icon-secondary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="grid cds-md:grid-cols-2">
              <p className={`px-4 py-4 text-cds-text-secondary ${T.body01}`}>{pricing.foot}</p>
              <Button contact kind="primary" size="xl" icon="arrowRight" className="w-full">
                {pricing.cta}
              </Button>
            </div>
          </div>
        </Enter>
      </div>
    </section>
  );
}
