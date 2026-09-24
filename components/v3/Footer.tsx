import { content } from "@/lib/content";
import { PARENT_COMPANY } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { V3_WRAP, Highlight, Pill } from "./primitives";

/* THE CLOSE, then the footer. The close is the last big type on the page and
   the one action again; the footer below it is small, quiet and grey, the way
   a footer should be — wayfinding, not another pitch. */
export function Footer() {
  const { close, footer, brand } = content;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white">
      <section aria-labelledby="v3-close-title" className="py-[clamp(88px,7rem+4vw,176px)]">
        <Reveal className={`${V3_WRAP} flex flex-col items-center text-center`}>
          <h2
            id="v3-close-title"
            className="max-w-[18ch] text-balance font-display text-[clamp(2.3rem,1.3rem+4vw,5rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-v3-ink"
          >
            <Highlight text={close.heading} />
          </h2>
          <p className="mt-5 max-w-[44ch] text-pretty text-[clamp(1.0625rem,0.98rem+0.4vw,1.3rem)] leading-[1.45] text-v3-ink-2">
            {close.sub}
          </p>
          <Pill contact tone="ink" className="mt-8">
            {close.cta}
          </Pill>
        </Reveal>
      </section>

      <div className="bg-v3-band">
        <div className={`${V3_WRAP} py-10 text-[0.8rem] leading-[1.5] text-v3-ink-2`}>
          <div className="flex flex-col gap-8 border-b border-v3-line pb-8 tab:flex-row tab:justify-between">
            <div className="max-w-[32ch]">
              {/* eslint-disable-next-line @next/next/no-img-element -- one small PNG mark */}
              <img src="/ls-icon.png" alt="Likelyfad Studio" className="h-6 w-auto" />
              <p className="mt-3">{footer.tagline}</p>
            </div>
            <div className="flex gap-16">
              {footer.columns.map((col) => (
                <div key={col.title}>
                  <p className="font-medium text-v3-ink">{col.title}</p>
                  <ul className="mt-2 flex flex-col">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          target={"external" in l ? "_blank" : undefined}
                          rel={"external" in l ? "noopener noreferrer" : undefined}
                          className="inline-flex min-h-8 items-center hover:text-v3-ink hover:underline underline-offset-2"
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
          <div className="flex flex-col gap-1 pt-5 tab:flex-row tab:justify-between">
            <p>
              An AI production studio by <span className="text-v3-ink">{PARENT_COMPANY}</span>
            </p>
            <p>
              © {year} {brand}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
