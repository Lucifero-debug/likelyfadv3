/* Adapted from React Bits GradualBlur (DavidHDev/react-bits).
   MIT + Commons Clause, Copyright (c) 2026 David Haz.
   Website use; not distributed as a component product.
   Retains its progressive masked backdrop layers; only three static layers,
   no hover, runtime injection, animation, resize listener or dependencies. */
import { SHOW_GRADUAL_BLUR } from "../motion";

export function GradualBlur({ spot }: { spot: "hero" | "footer" }) {
  if (!SHOW_GRADUAL_BLUR) return null;
  return (
    <div data-gradual-blur={spot} aria-hidden="true">
      {[1, 2, 3].map(i => {
        const step = 100 / 3;
        const stops = [`transparent ${(i - 1) * step}%`, `black ${i * step}%`];
        if ((i + 1) * step <= 100) stops.push(`black ${(i + 1) * step}%`);
        if ((i + 2) * step <= 100) stops.push(`transparent ${(i + 2) * step}%`);
        const mask = `linear-gradient(to bottom, ${stops.join(", ")})`;
        return <div key={i} style={{ maskImage: mask, WebkitMaskImage: mask, backdropFilter: `blur(${i * 2}px)`, WebkitBackdropFilter: `blur(${i * 2}px)` }} />;
      })}
    </div>
  );
}
