import { content } from "@/lib/content";
import { PARENT_COMPANY } from "@/lib/site";
import { Enter } from "./Enter";
import { GRID, T, Button, TwoTone } from "./primitives";

/* THE CLOSE, then the footer — both Gray 100, as IBM's footer is.

   The close is a call-to-action section on the grid: the fluid heading across
   lg columns 1–10, the supporting line and the primary button on 11–16,
   bottom-aligned so the button's edge meets the heading's baseline region.
   A full-bleed border-subtle rule separates it from the footer proper, whose
   columns snap to the same 4-column spans as every band above. */
export function Footer() {
  const { close, footer, brand, hero } = content;
  const year = new Date().getFullYear();

  return (
    <footer className="cds-g100 bg-cds-background text-cds-text-primary">
      <section id="close" aria-labelledby="v5-close-title" className="py-24 cds-lg:py-32">
        <Enter className={`${GRID} gap-y-8`}>
          <div className="col-span-4 cds-md:col-span-8 cds-lg:col-span-10">
            <h2 id="v5-close-title" className={`max-w-[20ch] ${T.fluidH5}`}>
              <TwoTone text={close.heading} />
            </h2>
          </div>
          <div className="col-span-4 flex flex-col items-start justify-end cds-md:col-span-8 cds-lg:col-span-6">
            <p className={`max-w-[40ch] text-cds-text-secondary ${T.body02}`}>{close.sub}</p>
            <Button contact kind="primary" size="lg" icon="arrowRight" className="mt-8 w-full cds-md:w-auto cds-md:min-w-[256px]">
              {close.cta}
            </Button>
          </div>
        </Enter>
      </section>

      <div className="border-t border-cds-border-subtle">
        <div className={`${GRID} gap-y-10 py-12`}>
          <div className="col-span-4 cds-md:col-span-4 cds-lg:col-span-8">
            {/* eslint-disable-next-line @next/next/no-img-element -- one small PNG mark */}
            <img src="/ls-icon.png" alt="Likelyfad Studio" className="h-6 w-auto" />
            <p className={`mt-4 max-w-[32ch] text-cds-text-secondary ${T.body01}`}>{footer.tagline}</p>
            <p className={`mt-2 text-cds-text-helper ${T.label01}`}>{hero.reassurance}</p>
          </div>
          {footer.columns.map((col) => (
            <div key={col.title} className="col-span-2 cds-md:col-span-2 cds-lg:col-span-4">
              <p className={`text-cds-text-primary ${T.headingCompact01}`}>{col.title}</p>
              <ul className="mt-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={"external" in l ? "_blank" : undefined}
                      rel={"external" in l ? "noopener noreferrer" : undefined}
                      className={`inline-flex min-h-8 items-center text-cds-text-secondary underline-offset-4 transition-colors duration-[var(--cds-fast-01)] hover:text-cds-text-primary hover:underline ${T.body01}`}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-cds-border-subtle">
        <div
          className={`${GRID} gap-y-1 py-4 text-cds-text-helper ${T.label01}`}
        >
          <p className="col-span-4 cds-md:col-span-4 cds-lg:col-span-8">
            An AI production studio by <span className="text-cds-text-secondary">{PARENT_COMPANY}</span>
          </p>
          <p className="col-span-4 cds-md:col-span-4 cds-lg:col-span-8 cds-md:text-right">
            © {year} {brand}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
