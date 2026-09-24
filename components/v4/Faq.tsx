"use client";

import { useState } from "react";
import { content } from "@/lib/content";
import { V4_SECTION, V4_WRAP, T, Button, Icon, SectionHeader } from "./primitives";

/* FAQ — an M3 Expressive SEGMENTED LIST. The rows are separate surfaces 2dp
   apart, fully rounded only at the ends of the group and softly rounded
   between, so the list reads as one object made of parts.

   Opening a row MORPHS it: it lifts to a higher surface container, its
   corners open out to the full 28dp and it gains a margin from its
   neighbours, all on the spatial spring. Any number can be open at once. */
export function Faq() {
  const { faq } = content;
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const last = faq.items.length - 1;

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section id="faq" aria-labelledby="v4-faq-title" className={`bg-m3-surface-container-low ${V4_SECTION}`}>
      <div className={`${V4_WRAP} grid gap-10 expanded:grid-cols-[0.85fr_1.15fr] expanded:gap-16`}>
        <div className="expanded:sticky expanded:top-[calc(var(--v4-bar)+40px)] expanded:self-start">
          <SectionHeader id="v4-faq-title" kicker={faq.kicker} heading={faq.heading} />
          <Button contact variant="tonal" size="m" icon="chat" className="mt-8">
            {faq.cta}
          </Button>
        </div>

        <ul className="flex flex-col gap-0.5">
          {faq.items.map((item, i) => {
            const isOpen = open.has(i);
            /* Corners: 28 at the group's ends, 4 between, 28 all round when open. */
            const shape = isOpen
              ? "rounded-[28px]"
              : `${i === 0 ? "rounded-t-[28px]" : "rounded-t-[4px]"} ${i === last ? "rounded-b-[28px]" : "rounded-b-[4px]"}`;
            return (
              <li
                key={item.q}
                className={`overflow-hidden transition-[border-radius,background-color,margin] duration-[var(--m3-spring-default-ms)] ease-[var(--m3-spring-default)] ${shape} ${
                  isOpen
                    ? `bg-m3-surface-container-highest ${i > 0 ? "mt-2" : ""} ${i < last ? "mb-2" : ""}`
                    : "bg-m3-surface-container-lowest"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={`v4-faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`v4-faq-a-${i}`}
                    onClick={() => toggle(i)}
                    className={`m3-state m3-ripple flex min-h-[72px] w-full items-center justify-between gap-4 rounded-[inherit] px-5 py-4 text-left text-m3-on-surface medium:px-6 font-sans font-medium text-[1.125rem] leading-[1.5rem] medium:text-[1.25rem] medium:leading-[1.75rem]`}
                  >
                    {item.q}
                    <span
                      aria-hidden="true"
                      className={`grid size-10 shrink-0 place-items-center rounded-full transition-[rotate,background-color] duration-[var(--m3-spring-default-ms)] ease-[var(--m3-spring-default)] ${
                        isOpen
                          ? "rotate-180 bg-m3-primary text-m3-on-primary"
                          : "bg-m3-surface-container-high text-m3-on-surface-variant"
                      }`}
                    >
                      <Icon name="expand" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`v4-faq-a-${i}`}
                  role="region"
                  aria-labelledby={`v4-faq-q-${i}`}
                  inert={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--m3-ease-standard)] ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className={`max-w-[60ch] px-5 pb-6 pr-16 text-pretty text-m3-on-surface-variant medium:px-6 medium:pr-20 ${T.bodyL}`}>
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
