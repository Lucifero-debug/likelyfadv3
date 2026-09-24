import { content } from "@/lib/content";
import { PAGE, BAND, T, Button, Card, Icon, AnnotatedSection } from "./primitives";

/* PRICING — an AnnotatedSection, the settings-page pattern.

   The annotation carries the pitch; the card carries what every quote
   includes, as a checked list, and a footer with the
   action. The action is SECONDARY: Polaris gives a page one primary action,
   and this page's is in the header. */
export function Pricing() {
  const { pricing } = content;

  return (
    <section id="pricing" aria-labelledby="v6-pricing-title" className={BAND}>
      <div className={PAGE}>
        <AnnotatedSection id="v6-pricing-title" heading={pricing.heading} description={pricing.body}>
          <Card padded={false}>
            <div className="px-4 pt-4 p-sm:px-5 p-sm:pt-5">
              <h3 className={`text-p-text ${T.headingMd}`}>Every quote includes</h3>
            </div>
            <ul className={`px-4 pb-2 pt-2 p-sm:px-5 ${T.bodyMd}`}>
              {pricing.includes.map((item) => (
                <li key={item} className="flex items-center gap-2 border-b border-p-border-secondary py-3 text-p-text last:border-b-0">
                  <Icon name="check" className="text-p-icon" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 border-t border-p-border-secondary bg-p-bg-surface-secondary px-4 py-3 p-sm:flex-row p-sm:items-center p-sm:justify-between p-sm:px-5">
              <p className={`text-p-text-secondary ${T.bodyMd}`}>{pricing.foot}</p>
              <Button contact variant="secondary">
                {pricing.cta}
              </Button>
            </div>
          </Card>
        </AnnotatedSection>
      </div>
    </section>
  );
}
