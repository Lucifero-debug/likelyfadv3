/* In numbers (Aman msg 2451): the approved EXAMPLE figures, each visibly marked, with one footnote. Placed after the featured ad and
   before Work in /v6 only. Styled with the page's own tokens (SECTION, WRAP, SectionHeading); the only motion is the
   React Bits CountUp, once, after expansion (first-view fallback) (the server HTML carries the final numbers). */
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SECTION, WRAP, HEAD_GAP, TEXT_META } from "@/lib/ui";
import { CountUp } from "./reactbits/CountUp";

const FIGURES: { value: React.ReactNode; label: string }[] = [
  { value: <CountUp to={48} />, label: "hours to first concepts" },
  { value: <><CountUp to={20} />–<CountUp to={40} /></>, label: "ads a month per brand" },
  { value: <><CountUp to={300} />+</>, label: "ads shipped" },
];

export function Numbers() {
  return (
    <section id="numbers" className={SECTION} aria-label="In numbers">
      <div className={WRAP}>
        <div data-v6-reveal-group className={HEAD_GAP}><SectionHeading kicker="In numbers" heading="What the work does." /></div>
        <dl className="grid grid-cols-1 gap-y-10 tab:grid-cols-3 tab:gap-x-8">
          {FIGURES.map((f) => (
            <div data-v6-reveal-group key={f.label} className="border-t border-line pt-6" data-placeholder="true">
              <dt className="sr-only">{f.label}</dt>
              <dd className="font-display text-[clamp(2.75rem,2rem+3vw,4.5rem)] font-bold leading-none tracking-[-0.03em] text-ink">{f.value}</dd>
              <dd className="mt-3 flex items-baseline gap-2 font-sans text-[1rem] text-ink-soft">
                <span>{f.label}</span>
                <span className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-ink-faint">Example</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className={`mt-8 font-sans ${TEXT_META} text-ink-faint`}>Example figures, replaced with real numbers before launch.</p>
      </div>
    </section>
  );
}
