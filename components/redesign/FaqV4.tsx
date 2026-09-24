"use client";

import { useState } from "react";
import { content } from "@/lib/redesign/content";
import { Button } from "@/components/ui/Button";
import {
  ANCHOR,
  HEADING,
  SECTION,
  TEXT_LEAD,
  TEXT_SMALL,
  WRAP,
} from "@/lib/redesign/ui";

const { faq } = content;

/* FAQ: one centred column — the page's quiet band after the pink one, and the
   only band that uses rules. The way out ("ask us") comes after the questions,
   where someone who did not find their answer ends up. Several answers can be
   open at once; the only motion is the row opening, because that is the one
   change the reader asked for. */

const QUESTION =
  "group flex w-full cursor-pointer items-baseline justify-between gap-6 py-6 text-left " +
  "font-display text-[clamp(1.25rem,1.1rem+0.5vw,1.6rem)] font-bold leading-tight tracking-[-0.025em] " +
  "transition-colors duration-200 hover:text-pink-deep";

/* The + turns into × when open. The glyph turns, not a box around it. */
const GLYPH =
  "flex-none font-sans text-2xl font-normal leading-none text-ink-soft " +
  "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[open]:rotate-45";

/* The 0fr → 1fr grid is what animates the height without measuring it. */
const PANEL =
  "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,0.7,0.2,1)]";

export function FaqV4() {
  const [open, setOpen] = useState<readonly number[]>([]);

  return (
    <section
      id="faq"
      className={`${ANCHOR} ${WRAP} ${SECTION}`}
      aria-label="Frequently asked questions"
    >
      <div className="mx-auto max-w-[780px]">
        <h2 className={`mx-auto max-w-[14ch] text-center ${HEADING}`}>
          {faq.heading}
        </h2>

        <div className="mt-[clamp(32px,4.5vw,56px)]">
          {faq.items.map((item, i) => {
            const isOpen = open.includes(i);
            return (
              <div
                key={item.q}
                className={`border-b border-line ${i === 0 ? "border-t" : ""}`}
              >
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    data-open={isOpen ? "" : undefined}
                    onClick={() =>
                      setOpen((prev) =>
                        prev.includes(i)
                          ? prev.filter((n) => n !== i)
                          : [...prev, i],
                      )
                    }
                    className={QUESTION}
                  >
                    <span className="text-balance">{item.q}</span>
                    <span aria-hidden="true" className={GLYPH}>
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className={`${PANEL} ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <p
                      className={`max-w-[60ch] text-pretty pb-6 font-sans ${TEXT_SMALL} leading-relaxed text-ink-soft`}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p
            className={`max-w-[36ch] text-pretty font-sans ${TEXT_LEAD} leading-normal text-ink-soft`}
          >
            {faq.sub}
          </p>
          <Button contact variant="pink">
            {faq.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
