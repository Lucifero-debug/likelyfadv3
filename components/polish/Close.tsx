/* T-0088 CLOSE (Alex: alex-faq-cta.md option C; round 2, Aman msg 2621).
   The page's last ask before the footer: one centred card on paper with a
   brand-gradient border that sweeps once as it enters, the H2, the large
   gradient CTA and the guarantee sub. /v6 only. */
import { content } from "@/lib/content-v6";
import { Button } from "@/components/ui/Button";
import { SECTION, WRAP } from "@/lib/ui";

export function Close() {
  const { close } = content;
  return (
    <section id="close" aria-label="Get started" className={`${SECTION} bg-paper text-ink`}>
      <div className={WRAP}>
        <div className="v6-close-card v6-sweep mx-auto flex max-w-[56rem] flex-col items-center gap-6 text-center">
          <h2 className="max-w-[16em] text-balance font-display font-bold leading-[1.1] tracking-[-0.022em]">{close.heading}</h2>
          <p className="max-w-[34ch] font-sans text-ink-soft">{close.sub}</p>
          <Button contact variant="grad" withArrow className="v6-cta-lg">{close.cta}</Button>
        </div>
      </div>
    </section>
  );
}
