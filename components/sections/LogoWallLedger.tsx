import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LOGOS, logoSrc, logoWidth, type Logo } from "@/lib/logos";
import { ANCHOR, HEAD_GAP, SECTION, SIZE_32, WRAP } from "@/lib/ui";

/* LOGO WALL 07 — THE LEDGER.  (v2)

   A ROSTER, SET IN TYPE. Every other wall treats the logos as the content;
   this one treats the NAMES as the content and the marks as the evidence
   beside them — a numbered list in the display face, the way a studio's
   credits page reads. It is the only wall that says each brand's name aloud
   in the site's own voice.

   THE MARK SITS AT THE END OF ITS ROW in its true colour, never tinted, and
   the row answers the pointer in two moves at once: the ground goes white and
   the name slides a few pixels right.

   TWO COLUMNS FROM `lap:`, one below. Nine rows in one column is a long list
   to scroll past on a desktop; split 5 + 4 it is a spread. Numbers run down
   the first column and on into the second, so the order survives the split.

   NO CLIENT JS. Hover is CSS, the entrance is Reveal's; like the grid, this
   is a server component. */

const COPY = {
  kicker: "Clients",
  heading: "The roster.",
  sub: "Nine brands and counting.",
};

const pad = (n: number) => String(n).padStart(2, "0");

const ROW =
  "group/row relative flex items-center gap-[clamp(14px,2vw,28px)] border-b border-line " +
  "px-[clamp(8px,1.4vw,20px)] py-[clamp(16px,2vw,26px)] " +
  "transition-colors duration-300 hover:bg-white";

function Mark({ logo }: { logo: Logo }) {
  const src = logoSrc(logo);
  /* A touch under the marquee's size: here the mark is the footnote to the
     name, and at full size it would out-shout the type it sits beside. */
  const w = Math.round(logoWidth(logo) * 0.9);
  const h = Math.round(logo.h * 0.9);
  return (
    <div className="relative ml-auto shrink-0 max-tab:max-w-[38%]" style={{ width: w, aspectRatio: `${w} / ${h}` }}>
      <img src={src} alt="" width={w} height={h} loading="lazy" decoding="async" className="block size-full object-contain" />
    </div>
  );
}

export function LogoWallLedger() {
  const split = Math.ceil(LOGOS.length / 2);
  const columns = [LOGOS.slice(0, split), LOGOS.slice(split)];

  return (
    <section id="clients" aria-label={COPY.kicker} className={`${SECTION} ${ANCHOR} bg-paper text-ink`}>
      <div className={WRAP}>
        <div className={HEAD_GAP}>
          <SectionHeading kicker={COPY.kicker} heading={COPY.heading} />
          <Reveal delay={100}>
            <p className="mt-3 text-center font-mono text-[0.8rem] tracking-[0.04em] text-ink-soft">{COPY.sub}</p>
          </Reveal>
        </div>

        <div className="grid lap:grid-cols-2 lap:gap-x-[clamp(32px,4vw,64px)]">
          {columns.map((col, c) => (
            <ol
              key={c}
              start={c * split + 1}
              /* The top rule, once per column below `lap:` only for the first:
                 stacked, the second column's first row already sits under the
                 first column's last rule. */
              className={`border-t border-line ${c === 1 ? "max-lap:border-t-0" : ""}`}
            >
              {col.map((l, i) => (
                <li key={l.slug}>
                  <Reveal delay={i * 60} className={ROW}>
                    <span className="w-[2.4ch] shrink-0 font-mono text-[0.72rem] tracking-[0.06em] text-ink-faint">
                      {pad(c * split + i + 1)}
                    </span>
                    <span
                      className={`font-display ${SIZE_32} font-bold leading-[1.1] tracking-[-0.02em] transition-transform duration-300 ease-[cubic-bezier(0.22,0.7,0.2,1)] group-hover/row:translate-x-1.5`}
                    >
                      {l.name}
                    </span>
                    <Mark logo={l} />
                  </Reveal>
                </li>
              ))}
            </ol>
          ))}
        </div>
      </div>
    </section>
  );
}
