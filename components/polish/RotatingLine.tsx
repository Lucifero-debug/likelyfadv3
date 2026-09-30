/* T-0088 ROTATING LINE (Aman msg 2659; copy: Alex). One word slot cycles
   through the formats, CSS only (opacity + translate + a light blur): no JS,
   nothing per frame on the main thread. Adding a word is one entry in
   content-v6 `rotating.words`; the cycle length follows the count.
   Screen readers get one plain sentence. Reduced motion: the first word, static.
   Placement pending Aman. */
import type { CSSProperties } from "react";
import { content } from "@/lib/content-v6";

export function RotatingLine({ className = "" }: { className?: string }) {
  const { before, words, after } = content.rotating;
  return (
    <p className={`v6-rotate ${className}`} data-n={Math.min(8, Math.max(3, words.length))} style={{ "--n": words.length } as CSSProperties}>
      <span className="sr-only">{`${before} ${words.join(", ")}. ${after}`}</span>
      <span aria-hidden="true">
        {before}{" "}
        <span className="v6-rotate-slot">
          {words.map((w, i) => <span key={w} className="v6-rotate-word" style={{ "--i": i } as CSSProperties}>{w}</span>)}
        </span>
        {". "}{after}
      </span>
    </p>
  );
}
