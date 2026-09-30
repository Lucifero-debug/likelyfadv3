/* T-0088 CTA REVIEW STACK (Aman msg 2669): no split test, no analytics.
   All candidates sit at the bottom of /v6, one after another, each with a
   small label, so Aman, colleagues and friends can name the one they like;
   the majority winner stays and the rest go. /v6 is noindex. */
import { content } from "@/lib/content-v6";
import { Button } from "@/components/ui/Button";
import { SECTION, WRAP } from "@/lib/ui";
import { CLAIM_BG, CLAIM_SCRIM } from "./claimBg";
import { PhoneChat } from "./PhoneChat";
import { RotatingLine } from "./RotatingLine";

function Label({ n, name }: { n: number; name: string }) {
  return <p className="v6-option-label"><span>Option {n}</span> {name}</p>;
}

function PhoneClose({ id, n, skin }: { id: string; n: number; skin: "imessage" | "whatsapp" }) {
  const { close } = content;
  return (
    <section id={id} aria-label={`CTA option ${n}`} className={`${SECTION} v6-cta-option bg-paper text-ink`}>
      <div className={WRAP}>
        <Label n={n} name={skin === "imessage" ? "iMessage" : "WhatsApp"} />
        <div data-nav-dark className={`v6-close-card v6-sweep relative isolate mx-auto overflow-hidden text-paper ${CLAIM_BG}`}>
          <div aria-hidden className={CLAIM_SCRIM} />
          <div className="v6-close-grid relative">
            <PhoneChat skin={skin} />
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

function RotatingClose({ n }: { n: number }) {
  const { close } = content;
  return (
    <section id="close-rotating" aria-label={`CTA option ${n}`} className={`${SECTION} v6-cta-option bg-paper text-ink`}>
      <div className={`${WRAP} flex flex-col items-center text-center`}>
        <Label n={n} name="Rotating line" />
        <div className="v6-rotate-card v6-sweep flex w-full max-w-[64rem] flex-col items-center gap-6">
          <RotatingLine className="v6-rotate-heading" />
          <Button contact variant="grad" withArrow className="v6-cta-lg">{close.cta}</Button>
          <p className="v6-close-guarantee-ink font-sans text-ink-soft">{close.guarantee}</p>
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
