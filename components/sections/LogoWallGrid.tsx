import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LOGOS, logoSrc, logoWidth, type Logo } from "@/lib/logos";
import { ANCHOR, HEAD_GAP, SECTION, WRAP } from "@/lib/ui";

/* LOGO WALL 02 — THE RULED GRID.  (v4)

   NO MOTION AT ALL, BY DESIGN. Every other wall in this set moves; this one is
   the control, and the argument for it is the site's own stylesheet: /v7's
   graph rule sits at 1.06:1 and the pillars spend their accent on two things.
   A client list is proof, and proof is more convincing still than animated. It
   is also the only one of the five that is a server component — no "use
   client", no observer, no state.

   THE RULES ARE THE DESIGN. A 3 x 3 field of cells separated by `--color-line`
   hairlines, each mark centred in its cell with generous air. It reads as a
   ledger rather than a carousel, which is the right register for "here is who
   trusts us".

   THE HAIRLINES ARE ONE BORDER PER CELL, NOT A GRID GAP WITH A BACKGROUND. A
   gap-plus-background trick paints the line colour as the whole grid's ground
   and lets each cell cover it, which means the lines are only as crisp as the
   cells' alignment. A right and bottom border on every cell, with the last
   column and row trimmed, is exact at every zoom.

   INK AT REST, COLOUR ON HOVER, same two-layer mask as the marquee: the brand
   mark under a currentColor tint, and the tint fades away under the pointer.
   The cell also lifts a hair and goes white, so the hover reads as a card
   coming forward rather than as a colour flicker.

   The entrance stagger runs across each ROW and resets, so the ninth cell is
   not still arriving when the reader gets there. */

const COPY = {
  kicker: "Clients",
  heading: "Nine brands. Every one of them AI.",
  sub: "Supplements, skincare, fitness, fragrance, software.",
};

const CELL =
  "group/cell relative flex items-center justify-center " +
  "min-h-[clamp(112px,13vw,168px)] p-[clamp(20px,2.4vw,36px)] " +
  "border-r border-b border-line bg-paper text-ink " +
  "transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,0.7,0.2,1)] " +
  "hover:bg-white hover:-translate-y-0.5 hover:z-[1] " +
  "[&:nth-child(3n)]:border-r-0 [&:nth-last-child(-n+3)]:border-b-0";

function Mark({ logo }: { logo: Logo }) {
  const src = logoSrc(logo);
  /* Scaled up a step from the marquee: a cell gives a mark room a strip does
     not, and at strip size these would float in the box. */
  const h = Math.round(logo.h * 1.25);
  const w = Math.round(logoWidth(logo) * 1.25);
  return (
    <div className="relative" style={{ width: w, height: h }}>
      <img src={src} alt={logo.name} width={w} height={h} loading="lazy" decoding="async" className="block size-full object-contain" />
      <span
        aria-hidden
        className="absolute inset-0 bg-current opacity-45 transition-opacity duration-300 [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] group-hover/cell:opacity-0"
        style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-[1] bg-paper transition-opacity duration-300 [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] group-hover/cell:opacity-0"
        style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
      />
    </div>
  );
}

export function LogoWallGrid() {
  return (
    <section id="clients" aria-label={COPY.kicker} className={`${SECTION} ${ANCHOR} bg-paper text-ink`}>
      <div className={WRAP}>
        <div className={HEAD_GAP}>
          <SectionHeading kicker={COPY.kicker} heading={COPY.heading} />
          <Reveal delay={100}>
            <p className="mt-3 text-center font-mono text-[0.8rem] tracking-[0.04em] text-ink-soft">
              {COPY.sub}
            </p>
          </Reveal>
        </div>

        {/* The outer hairline closes the ledger; the cells draw the inner ones. */}
        <ul className="grid grid-cols-3 overflow-hidden rounded-2xl border border-line" role="list">
          {LOGOS.map((l, i) => (
            <li key={l.slug} className={CELL}>
              <Reveal delay={(i % 3) * 70}>
                <Mark logo={l} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
