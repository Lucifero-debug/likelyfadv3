/* Final figures remain in server HTML; CountUp animates once on arrival.
   The data length alone selects three/four desktop columns and the phone grid. */
import type { CSSProperties } from "react";
import { SECTION, WRAP, HEAD_GAP, TEXT_H2 } from "@/lib/ui";
import { CountUp } from "./reactbits/CountUp";

const FIGURES: { value: React.ReactNode; label: string }[] = [
  { value: <><CountUp to={48} /> hours</>, label: "to the first cut" },
  { value: <><CountUp to={1000} group />+</>, label: "ads shipped since 2024" },
  { value: "$1M+", label: "in ad spend behind our creatives, 2024 to 2026" },
];

export function Numbers() {
  return (
    <section id="numbers" data-nav-dark className={SECTION} aria-label="In numbers">
      <div className={WRAP}>
        <div data-v6-reveal-group className={HEAD_GAP}><h2 className={`${TEXT_H2} font-display text-(length:--title) font-bold leading-[1.1] tracking-[-0.022em]`}>In numbers.</h2></div>
        <dl className="v6-numbers-grid" data-count={FIGURES.length} style={{ "--figure-count": FIGURES.length } as CSSProperties}>
          {FIGURES.map((f) => (
            <div data-v6-reveal-group key={f.label} className="v6-number-tile">
              <dt className="sr-only">{f.label}</dt>
              <dd className="v6-number-value font-display font-bold tracking-[-0.03em]">{f.value}</dd>
              <dd className="v6-number-label font-sans">{f.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
