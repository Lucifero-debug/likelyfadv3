/* T-0088 CLOSE (Alex: alex-faq-cta.md option C; round 2, Aman msg 2621).
   The page's last ask before the footer: one centred card on paper with a
   brand-gradient border that sweeps once as it enters, the H2, the large
   gradient CTA and the guarantee sub, over the bridge band's photograph. /v6 only. */
import { content } from "@/lib/content-v6";
import { Button } from "@/components/ui/Button";
import { SECTION, WRAP } from "@/lib/ui";
import { CLAIM_BG, CLAIM_SCRIM } from "./claimBg";

export function Close() {
  const { close } = content;
  return (
    <section id="close" aria-label="Get started" className={`${SECTION} bg-paper text-ink`}>
      <div className={WRAP}>
        {/* Round 3 (Aman msg 2635): the same video-wall photograph and scrim as the
            bridge band, so the last ask sells with the work, not with text alone. */}
        <div data-nav-dark className={`v6-close-card v6-sweep relative isolate mx-auto flex max-w-[64rem] flex-col items-center gap-6 overflow-hidden text-center text-paper ${CLAIM_BG}`}>
          <div aria-hidden className={CLAIM_SCRIM} />
          <h2 className="relative max-w-[16em] text-balance font-display font-bold leading-[1.1] tracking-[-0.022em]">{close.heading}</h2>
          <p className="relative max-w-[34ch] font-sans text-paper/85">{close.sub}</p>
          <Button contact variant="grad" withArrow className="v6-cta-lg relative">{close.cta}</Button>
        </div>
      </div>
    </section>
  );
}
