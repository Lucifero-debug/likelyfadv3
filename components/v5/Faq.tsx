"use client";

import { useState } from "react";
import { content } from "@/lib/content";
import { Enter } from "./Enter";
import { GRID, SECTION, T, Button, Icon, SectionHead } from "./primitives";

/* FAQ — Carbon's accordion, flush.

   Rows are ruled with border-subtle top and bottom and sit on the page, not
   in a card. The header is 48px min, body-compact-02, the chevron at the
   END. Open panels align their text to the header's 16px and hold 25% of
   the row free on the right, so the answer never runs the full measure.

   Motion is productive and nothing else: the chevron turns on fast-02, the
   panel opens on moderate-02 with the productive standard curve. Any number
   can be open at once. */
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
    <section id="faq" aria-labelledby="v5-faq-title" className={`bg-cds-background ${SECTION}`}>
      <div className={`${GRID} gap-y-12`}>
        <SectionHead
          id="v5-faq-title"
          kicker={faq.kicker}
          heading={faq.heading}
          className="cds-lg:sticky cds-lg:top-[calc(var(--v5-header)+32px)] cds-lg:self-start"
        >
          <Button contact kind="tertiary" size="lg" icon="chat" className="mt-8">
            {faq.cta}
          </Button>
        </SectionHead>

        <Enter className="col-span-4 cds-md:col-span-8 cds-lg:col-span-12">
          <ul className="border-b border-cds-border-subtle">
            {faq.items.map((item, i) => {
              const isOpen = open.has(i);
              return (
                <li key={item.q} className="border-t border-cds-border-subtle">
                  <h3>
                    <button
                      type="button"
                      id={`v5-faq-q-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`v5-faq-a-${i}`}
                      onClick={() => toggle(i)}
                      className={`flex min-h-12 w-full items-center justify-between gap-4 px-4 py-3 text-left text-cds-text-primary transition-colors duration-[var(--cds-fast-01)] ease-[var(--cds-standard-productive)] hover:bg-cds-layer-hover ${T.bodyCompact02}`}
                    >
                      {item.q}
                      <Icon
                        name="chevronDown"
                        size={16}
                        className={`transition-transform duration-[var(--cds-fast-02)] ease-[var(--cds-standard-productive)] ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </h3>
                  <div
                    id={`v5-faq-a-${i}`}
                    role="region"
                    aria-labelledby={`v5-faq-q-${i}`}
                    inert={!isOpen}
                    className={`grid transition-[grid-template-rows,opacity] duration-[var(--cds-moderate-02)] ease-[var(--cds-standard-productive)] ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`pb-6 pl-4 pr-4 pt-2 text-pretty text-cds-text-secondary cds-md:pr-[25%] ${T.body01}`}
                      >
                        {item.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Enter>
      </div>
    </section>
  );
}
