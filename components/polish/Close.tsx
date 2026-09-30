/* T-0088 CLOSE (round 4, Aman msg 2659; copy: Alex, alex-cta-copy.md).
   On the bridge band's video-wall photograph + scrim (round 3): a real iPhone
   on the LEFT with a DM being sent inside (PhoneChat), and on the RIGHT
   "Starting takes ten seconds.", the line, the big CTA and the guarantee.
   Phone: stacked, the chat plays once and holds. /v6 only. */
import { content } from "@/lib/content-v6";
import { Button } from "@/components/ui/Button";
import { SECTION, WRAP } from "@/lib/ui";
import { CLAIM_BG, CLAIM_SCRIM } from "./claimBg";
import { PhoneChat } from "./PhoneChat";

/* The chat skin (Aman to choose: "imessage" | "whatsapp"). */
export const CHAT_SKIN: "imessage" | "whatsapp" = "imessage";

export function Close() {
  const { close } = content;
  return (
    <section id="close" aria-label="Get started" className={`${SECTION} bg-paper text-ink`}>
      <div className={WRAP}>
        <div data-nav-dark className={`v6-close-card v6-sweep relative isolate mx-auto overflow-hidden text-paper ${CLAIM_BG}`}>
          <div aria-hidden className={CLAIM_SCRIM} />
          <div className="v6-close-grid relative">
            <PhoneChat skin={CHAT_SKIN} />
            <div className="v6-close-copy">
              <h2 className="text-balance font-display font-bold leading-[1.1] tracking-[-0.022em]">{close.heading}</h2>
              <p className="v6-close-sub font-sans">{close.sub}</p>
              <Button contact variant="grad" withArrow className="v6-cta-lg">{close.cta}</Button>
              <p className="v6-close-guarantee font-sans">{close.guarantee}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
