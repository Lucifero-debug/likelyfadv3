import type { CSSProperties } from "react";
import { TEXT_H2, TEXT_SMALL } from "@/lib/ui";

/** One native scroll-reveal line. Plain, fully readable server HTML by default. */
export function WorkHeading({ kicker, heading }: { kicker: string; heading: string }) {
  return (
    <div className={`${TEXT_H2} mx-auto mb-4 max-w-[calc(var(--title)*13)] text-center`}>
      <div className="mb-3"><span className={`inline-flex items-center gap-[0.62em] font-sans font-medium uppercase ${TEXT_SMALL} before:h-px before:w-[2.2em] before:bg-current before:opacity-55 before:content-['']`}>{kicker}</span></div>
      <h2 data-scroll-reveal className="font-display text-(length:--title) font-bold leading-[1.1] tracking-[-0.022em] text-balance">
        {heading.split(" ").map((word, i) => <span key={i}><span data-scroll-word style={{ "--word-start": `${i * 3}%`, "--word-end": `${30 + i * 3}%` } as CSSProperties}>{word}</span>{" "}</span>)}
      </h2>
    </div>
  );
}
