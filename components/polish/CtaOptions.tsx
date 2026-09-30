/* T-0088 CTA REVIEW STACK (Aman msg 2669): no split test, no analytics.
   All candidates sit at the bottom of /v6, one after another, each with a
   small label, so Aman, colleagues and friends can name the one they like;
   the majority winner stays and the rest go. /v6 is noindex. */
import { content } from "@/lib/content-v6";
import { Button } from "@/components/ui/Button";
import { SECTION, WRAP } from "@/lib/ui";
import { CLAIM_BG, CLAIM_SCRIM } from "./claimBg";
import { ChatCard } from "./ChatCard";
import { RotatingLine } from "./RotatingLine";

function Label({ n, name }: { n: number; name: string }) {
  return <p className="v6-option-label"><span>Option {n}</span> {name}</p>;
}

/* Options 1 and 2 (Aman msgs 2705-2734): the in-hand phone, on a light card.
   The background is one class; Aman has not picked yet (msg 2707), so "aurora"
   stands in. The others: "dots" (dot grid + brand glow), "grain" (grainy
   pastel gradient). */
const PHONE_BG: "aurora" | "dots" | "grain" = "aurora";

function PhoneClose({ id, n, skin }: { id: string; n: number; skin: "imessage" | "whatsapp" }) {
  const { close } = content;
  return (
    <section id={id} aria-label={`CTA option ${n}`} className={`${SECTION} v6-cta-option bg-paper text-ink`}>
      <div className={WRAP}>
        <Label n={n} name={skin === "imessage" ? "iMessage" : "WhatsApp"} />
        <div className={`v6-hand-card v6-bgopt-${PHONE_BG} v6-sweep relative isolate overflow-hidden`}>
          <div aria-hidden className="v6-bgopt"><i /><i /><i /></div>
          <div className="v6-hand-copy relative z-[1]">
            <h2 className="text-balance font-display font-bold leading-[1.1] tracking-[-0.022em]">{close.heading}</h2>
            <p className="v6-hand-sub font-sans">{close.sub}</p>
            <Button contact variant="grad" withArrow className="v6-cta-lg">{close.cta}</Button>
            <p className="v6-hand-guarantee font-sans">{close.guarantee}</p>
          </div>
          <div className="v6-hand-art relative z-[1]"><ChatCard skin={skin} /></div>
        </div>
      </div>
    </section>
  );
}

/* Option 3 background (Aman msg 2680). Doom: have a light variant ready as a
   one-line switch; Aman leans white. "dark" = the aurora on ink, "light" = a
   pastel aurora on white. */
const OPT3_THEME: "dark" | "light" = "dark";

function RotatingClose({ n }: { n: number }) {
  const { close } = content;
  return (
    <section id="close-rotating" aria-label={`CTA option ${n}`} className={`${SECTION} v6-cta-option bg-paper text-ink`}>
      <div className={`${WRAP} flex flex-col items-center text-center`}>
        <Label n={n} name="Rotating line" />
        {/* Aman msg 2680: full content width like the other sections, and a
            richer background: our own CSS aurora in the brand colours (three
            soft gradient fields drifting, grain, a faint grid). Compositor-only
            transforms, no WebGL, no JS; reduced motion holds it still. */}
        <div data-nav-dark={OPT3_THEME === "dark" ? "" : undefined} data-theme-v6={OPT3_THEME} className="v6-rotate-card v6-rotate-aurora v6-sweep relative isolate flex w-full flex-col items-center gap-6 overflow-hidden">
          <div aria-hidden className="v6-aurora"><i /><i /><i /></div>
          <RotatingLine className="v6-rotate-heading relative z-[1]" />
          <Button contact variant="grad" withArrow className="v6-cta-lg relative z-[1]">{close.cta}</Button>
          <p className="v6-close-guarantee relative z-[1] font-sans">{close.guarantee}</p>
        </div>
      </div>
    </section>
  );
}

function ClassicClose({ n }: { n: number }) {
  const c = content.closeClassic;
  return (
    <section id="close" aria-label={`CTA option ${n}`} className={`${SECTION} v6-cta-option bg-paper text-ink`}>
      <div className={WRAP}>
        <Label n={n} name="Current close" />
        <div data-nav-dark className={`v6-close-card v6-sweep relative isolate mx-auto flex max-w-[64rem] flex-col items-center gap-6 overflow-hidden text-center text-paper ${CLAIM_BG}`}>
          <div aria-hidden className={CLAIM_SCRIM} />
          <h2 className="relative max-w-[16em] text-balance font-display font-bold leading-[1.1] tracking-[-0.022em]">{c.heading}</h2>
          <p className="relative max-w-[34ch] font-sans text-paper/85">{c.sub}</p>
          <Button contact variant="grad" withArrow className="v6-cta-lg relative">{c.cta}</Button>
        </div>
      </div>
    </section>
  );
}

export function CtaOptions() {
  return (
    <>
      <PhoneClose id="close-imessage" n={1} skin="imessage" />
      <PhoneClose id="close-whatsapp" n={2} skin="whatsapp" />
      <RotatingClose n={3} />
      <ClassicClose n={4} />
    </>
  );
}
