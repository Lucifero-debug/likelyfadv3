"use client";

import { useState } from "react";
import { content } from "@/lib/content";
import { PAGE, BAND, T, Button, Card, Icon, AnnotatedSection } from "./primitives";

/* FAQ — an AnnotatedSection with one card of Collapsibles, the way the
   admin stacks expandable settings: rows split by dividers, 44px minimum,
   the question in medium weight, a chevron at the end. Panels open with
   Polaris's modest motion (duration-200). Any number can be open at once. */
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
    <section id="faq" aria-labelledby="v6-faq-title" className={BAND}>
      <div className={PAGE}>
        <AnnotatedSection
          id="v6-faq-title"
          heading={faq.heading}
          description={content.close.sub}
          action={
            <Button contact variant="secondary">
              {faq.cta}
            </Button>
          }
        >
          <Card padded={false}>
            <ul>
              {faq.items.map((item, i) => {
                const isOpen = open.has(i);
                return (
                  <li key={item.q} className="border-b border-p-border-secondary last:border-b-0">
                    <h3>
                      <button
                        type="button"
                        id={`v6-faq-q-${i}`}
                        aria-expanded={isOpen}
                        aria-controls={`v6-faq-a-${i}`}
                        onClick={() => toggle(i)}
                        className={`flex min-h-12 w-full items-center justify-between gap-4 px-4 py-3 text-left font-medium text-p-text transition-colors duration-[var(--p-duration-100)] ease-[var(--p-ease)] hover:bg-p-bg-surface-hover p-sm:px-5 ${T.bodyMd}`}
                      >
                        {item.q}
                        <Icon
                          name="chevronDown"
                          className={`text-p-icon transition-transform duration-[var(--p-duration-200)] ease-[var(--p-ease)] ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </h3>
                    <div
                      id={`v6-faq-a-${i}`}
                      role="region"
                      aria-labelledby={`v6-faq-q-${i}`}
                      inert={!isOpen}
                      className={`grid transition-[grid-template-rows,opacity] duration-[var(--p-duration-200)] ease-[var(--p-ease)] ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className={`max-w-[62ch] px-4 pb-4 text-pretty text-p-text-secondary p-sm:px-5 ${T.bodyMd}`}>
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </AnnotatedSection>
      </div>
    </section>
  );
}
