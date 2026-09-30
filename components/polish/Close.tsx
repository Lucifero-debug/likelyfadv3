/* T-0088 CLOSE (Alex's final copy, section 9): the page's last ask before the
   footer. Light band; heading, the one CTA, and the same-day line. /v6 only. */
import { content } from "@/lib/content-v6";
import { Button } from "@/components/ui/Button";
import { SECTION, WRAP } from "@/lib/ui";

export function Close() {
  const { close } = content;
  return (
    <section id="close" aria-label="Get started" className={`${SECTION} bg-paper text-ink`}>
      <div className={`${WRAP} flex flex-col items-center gap-6 text-center`}>
        <h2 className="max-w-[16em] text-balance font-display font-bold leading-[1.1] tracking-[-0.022em]">{close.heading}</h2>
        <Button contact variant="grad" withArrow>{close.cta}</Button>
        <p className="font-sans text-ink-soft">{close.sub}</p>
      </div>
    </section>
  );
}
