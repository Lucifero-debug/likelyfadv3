"use client";

import { useEffect, useRef } from "react";
import { content } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { KICKER, SPLIT, SplitTitle } from "@/components/sections/PricingV4";
import { ANCHOR, SECTION, TEXT_META, TEXT_SMALL } from "@/lib/ui";
import { Magnetic } from "./Magnetic";

const { pricing } = content;

/* PRICING — V7. PricingV4's ruled spec table, where the table DRAWS ITSELF:
   when the list reaches the reading line, each hairline runs out from the left
   one after another, and each row's tick pops its squircle and is inked in as a
   stroke once its rule has passed it. The rows themselves still rise in with Reveal. Nothing here
   answers hover — the rows are not controls (see PricingV4's note). */

const STEP = 110;
const EASE = "ease-[cubic-bezier(0.22,0.7,0.2,1)]";
const RULE =
  `pointer-events-none absolute inset-x-0 h-px origin-left scale-x-0 bg-line transition-transform duration-[900ms] ${EASE} ` +
  "group-data-[in]/list:scale-x-100";

/* 20px inclusions, down to 18 — the same step FaqV4 sets its questions at. */
const ROW_SIZE = "text-[clamp(1.125rem,1.05rem+0.31vw,1.25rem)]";

/* (PricingV4's note, kept for the record:) THE ROW. A hairline under every one, and the first also carries one above —
   which is what closes the list at both ends.

   THE TOP RULE IS SET FROM THE INDEX, NOT FROM `first:`. Every row here is the
   only child of its own Reveal wrapper, so `first-child` is true for all four
   of them and a `first:border-t` would draw a rule above every row on top of
   the one already under the row before it. */


/* The 28px squircle. `rounded-2xl` on a 28 box is the reference's 16-on-28 — a
   rounded square, not a disc, which is what keeps it from reading as a bullet.

   NO HOVER STATE. FaqV4's marker brightens on hover because its row is a
   <summary> and the whole thing is a control; these rows are static text and
   nothing here is clickable, so a hover response would promise an interaction
   that does not exist. */
const MARKER =
  "grid size-7 flex-none place-items-center rounded-2xl border border-line " +
  "font-display text-base font-bold leading-none text-pink-deep";


export function PricingV7() {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.in = "";
        io.disconnect();
      },
      { rootMargin: "0px 0px -20% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="pricing" className={`${ANCHOR} ${SECTION}`} aria-label={pricing.kicker}>
      <div className={SPLIT}>
        <div className="flex flex-col lap:sticky lap:top-28">
          <Reveal>
            <span className={KICKER}>{pricing.kicker}</span>
          </Reveal>

          <SplitTitle text={pricing.heading} className="mt-4" />

          <Reveal delay={80}>
            <p className={`mt-6 max-w-[46ch] text-pretty font-sans ${TEXT_SMALL} leading-6 text-ink-soft`}>
              {pricing.body}
            </p>
          </Reveal>
        </div>

        <div>
          <ul ref={listRef} className="group/list w-full">
            {pricing.includes.map((item, i) => (
              <li key={item} className="relative">
                {i === 0 && <span aria-hidden className={`${RULE} top-0`} />}
                <span
                  aria-hidden
                  className={`${RULE} bottom-0`}
                  style={{ transitionDelay: `${(i + 1) * STEP}ms` }}
                />
                <Reveal delay={i * 60}>
                  <div className="flex w-full items-center justify-between gap-6 py-6">
                    <span
                      className={`font-display ${ROW_SIZE} font-bold leading-[1.3] tracking-[-0.02em]`}
                    >
                      {item}
                    </span>
                    <span
                      className={`${MARKER} group-data-[in]/list:animate-[v7-pop_640ms_cubic-bezier(0.34,1.56,0.64,1)_backwards] group-data-[in]/list:border-pink`}
                      style={{ animationDelay: `${(i + 1) * STEP + 380}ms` }}
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                        <path
                          d="M3 8.5 6.4 12 13 4.5"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          pathLength={1}
                          style={{ transitionDelay: `${(i + 1) * STEP + 420}ms` }}
                          className={`[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-[520ms] ${EASE} group-data-[in]/list:[stroke-dashoffset:0]`}
                        />
                      </svg>
                    </span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal delay={100} className="mt-10 flex flex-col items-start gap-3">
            <Magnetic>
              <Button contact variant="grad" withArrow>
                {pricing.cta}
              </Button>
            </Magnetic>
            <p className={`font-sans ${TEXT_META} text-ink-faint`}>{pricing.foot}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
