/* T-0088 round 3 (Aman msg 2633): say what the logos are. The shared LogoWall
   keeps its own (hidden on /v6) heading; this label sits directly above it. */
import { content } from "@/lib/content-v6";

export function LogoLabel() {
  return (
    <div className="v6-logo-label bg-paper text-center">
      <p className="inline-flex items-center gap-[0.62em] font-sans text-[0.75rem] font-medium uppercase tracking-[0.14em] text-pink-deep before:h-px before:w-[2.2em] before:bg-current before:opacity-55 before:content-['']">
        {content.logos.label}
      </p>
    </div>
  );
}
