/* T-0088 HOW IT WORKS, steps variant B (Aman msgs 2672, 2675, 2682).
   One frameless light card on the right shows the step: the DM, a real trial
   ad playing, the refund, the monthly flow. On the left, ONE step's text at a
   time sits in the same place and cross-fades in sync with the card (Apple
   style), with four dashes that show progress and jump on click.
   Desktop (fine pointer, >=761px): auto-advances and loops. Phone: stacked,
   plays once and holds on 04. Nothing advances off screen. Reduced motion:
   no auto-advance, no animation; the dashes still switch steps.
   The video is the featured ad already on the page (no new file), requested
   only when step 02 first shows, muted, paused whenever it is not showing. */
import { content } from "@/lib/content-v6";
import { reelVideos } from "@/lib/reels.generated";
import { Button } from "@/components/ui/Button";
import { SECTION, WRAP, HEAD_GAP } from "@/lib/ui";
import { FEATURED_REEL_ID } from "./motion";
import { HowStage } from "./HowStage";

const GRID_IDS = ["0616", "boyfriend-angle-ai", "v2934", "hoodie-ad-podcast-style", "v3057", "doctor-in-office-ai-ugc-health-product"];

export function HowItWorks() {
  const { how, closeChat } = content;
  const featured = reelVideos.find(r => r.id === FEATURED_REEL_ID);
  const grid = GRID_IDS.map(id => reelVideos.find(r => r.id === id)?.poster).filter((p): p is string => !!p);
  if (!featured?.poster || grid.length < 6) throw new Error("How it works needs the featured reel and six posters");
  return (
    <section id="how" aria-label="How it works" className={`${SECTION} v6-how bg-paper text-ink`}>
      <div className={WRAP}>
        <div className={`${HEAD_GAP} flex flex-col items-center text-center`}>
          <h2 className="max-w-[16em] text-balance font-display font-bold leading-[1.1] tracking-[-0.022em]">{how.heading}</h2>
          <p className="v6-how-sub mt-4 max-w-[34ch] font-sans text-ink-soft">{how.sub}</p>
        </div>
        <ol className="sr-only">{how.steps.map(s => <li key={s}>{s}</li>)}</ol>
        <HowStage
          steps={how.steps}
          screens={how.screens}
          chat={{ typed: closeChat.typed, link: closeChat.link, reply: closeChat.reply, typing: closeChat.typing, contact: closeChat.contact }}
          video={{ src: featured.src, poster: featured.poster }}
          grid={grid}
          cta={<Button contact variant="grad" withArrow className="v6-cta-lg">{how.cta}</Button>}
        />
      </div>
    </section>
  );
}
