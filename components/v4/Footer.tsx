import { content } from "@/lib/content";
import { PARENT_COMPANY } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { V4_WRAP, T, Button, Highlight } from "./primitives";

/* THE CLOSE, then the footer.

   The close is the page's one primary-container moment at full size: an
   extra-extra-large (48dp) container inset from the margins, with the
   display type and the action. Nothing decorative behind it; the container
   colour is the emphasis.

   The footer is surface-container: quiet, small, wayfinding only. */
export function Footer() {
  const { close, footer, brand } = content;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-m3-surface">
      <section id="close" aria-labelledby="v4-close-title" className={`${V4_WRAP} py-[clamp(48px,4rem+2vw,96px)]`}>
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[48px] bg-m3-primary-container px-6 py-[clamp(56px,7vw,112px)] text-center text-m3-on-primary-container medium:px-12">
            <h2
              id="v4-close-title"
              className={`mx-auto max-w-[18ch] ${T.displayM}`}
            >
              <Highlight text={close.heading} />
            </h2>
            <p className={`mx-auto mt-5 max-w-[44ch] text-pretty opacity-[0.86] ${T.bodyLFluid}`}>{close.sub}</p>
            <Button contact variant="filled" size="m" className="mt-9">
              {close.cta}
            </Button>
          </div>
        </Reveal>
      </section>

      <div className="bg-m3-surface-container">
        <div className={`${V4_WRAP} py-10 text-m3-on-surface-variant ${T.bodyM}`}>
          <div className="flex flex-col gap-8 border-b border-m3-outline-variant pb-8 medium:flex-row medium:justify-between">
            <div className="max-w-[32ch]">
              {/* eslint-disable-next-line @next/next/no-img-element -- one small PNG mark */}
              <img src="/ls-icon.png" alt="Likelyfad Studio" className="h-6 w-auto" />
              <p className="mt-3">{footer.tagline}</p>
            </div>
            <div className="flex gap-16">
              {footer.columns.map((col) => (
                <div key={col.title}>
                  <p className={`text-m3-on-surface ${T.titleM}`}>{col.title}</p>
                  <ul className="mt-2 flex flex-col">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          target={"external" in l ? "_blank" : undefined}
                          rel={"external" in l ? "noopener noreferrer" : undefined}
                          className="inline-flex min-h-10 items-center underline-offset-4 hover:text-m3-on-surface hover:underline"
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
          <div className="flex flex-col gap-1 pt-5 medium:flex-row medium:justify-between">
            <p>
              An AI production studio by <span className="text-m3-on-surface">{PARENT_COMPANY}</span>
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
