"use client";

import { useState } from "react";
import { content } from "@/lib/content";
import { V3_H2, V3_SECTION, V3_WRAP, Eyebrow, Highlight, Pill } from "./primitives";

/* FAQ — a plain list of disclosures. Any number can be open at once: reading
   one answer should never close the one beside it.

   The answer opens by animating its grid row from 0fr to 1fr, so the height
   is the content's own and nothing is measured. The plus turns into a minus
   by rotating its vertical bar flat — the same stroke, redirected — and the
   transition reverses from wherever it is if the row is tapped again. */
export function Faq() {
  const { faq } = content;
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section id="faq" aria-labelledby="v3-faq-title" className={`bg-v3-band ${V3_SECTION}`}>
      <div className={`${V3_WRAP} grid gap-10 lap:grid-cols-[0.9fr_1.1fr] lap:gap-16`}>
        <div className="lap:sticky lap:top-[calc(var(--v3-nav)+40px)] lap:self-start">
          <Eyebrow>{faq.kicker}</Eyebrow>
          <h2 id="v3-faq-title" className={`mt-3 text-v3-ink ${V3_H2}`}>
            <Highlight text={faq.heading} />
          </h2>
          <Pill contact tone="ink" className="mt-8">
            {faq.cta}
          </Pill>
        </div>

        <ul className="divide-y divide-v3-line border-y border-v3-line">
          {faq.items.map((item, i) => {
            const isOpen = open.has(i);
            return (
              <li key={item.q}>
                <h3>
                  <button
                    type="button"
                    id={`v3-faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`v3-faq-a-${i}`}
                    onClick={() => toggle(i)}
                    className="flex min-h-11 w-full items-center justify-between gap-6 py-5 text-left font-display text-[clamp(1.1rem,1.02rem+0.3vw,1.3rem)] font-bold leading-[1.25] tracking-[-0.018em] text-v3-ink transition-opacity duration-100 active:opacity-60"
                  >
                    {item.q}
                    <span aria-hidden="true" className="relative size-4 shrink-0">
                      <span className="absolute left-0 top-1/2 h-[1.75px] w-4 -translate-y-1/2 rounded bg-v3-ink" />
                      <span
                        className={`absolute left-1/2 top-0 h-4 w-[1.75px] -translate-x-1/2 rounded bg-v3-ink transition-transform duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={`v3-faq-a-${i}`}
                  role="region"
                  aria-labelledby={`v3-faq-q-${i}`}
                  inert={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[58ch] pb-6 pr-10 text-pretty text-[1.0625rem] leading-[1.55] text-v3-ink-2">
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
