import { content } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { ANCHOR, SECTION, SIZE_H2, TEXT_META, TEXT_SMALL, WRAP } from "@/lib/ui";

const { pricing } = content;

/* PRICING — V4. The centred, hairline-ruled reference, in the same language as
   WhyUsV4, TestimonialsV4 and FaqV4: Bricolage-weight extrabold headings, a
   12px mono kicker, a 1280 page at a 56 gutter. The desktop values:

     SECTION   1280 cap · 56 gutter · 64 top and bottom
     HEADER    672 measure · CENTRED · 10 kicker → heading · 24 → body
               · 40 → list
     KICKER    12px mono, uppercase, 0.1em tracked · centred · NO BAR
     HEADING   48px EXTRABOLD, centred, leading 1.088
     LIST      761 measure · centred · rules top and bottom of every row
     ROW       24 top and bottom · inclusion and marker pushed apart
               20px BOLD display inclusion
     MARKER    28 squircle · 1px hairline · a typographic ✓
     CLOSE     40 under the list · CTA and footnote centred

   WHAT SEPARATES V4 FROM PricingV2 AND PricingV3:

     1. THERE IS NO BOX. V2 gives every inclusion a 24-radius card and V3 puts
        all four inside one square bordered panel; this draws one hairline under
        each row and one above the first, and nothing else. The list is a ruled
        spec table, not a stack of objects — which is the closest any of the
        four variants comes to reading like a price sheet, and it gets there
        without a price on it.
     2. THE LIST IS WIDER THAN THE HEADING — 761 against 672, both centred. The
        header is deliberately the narrower column, so the rows start and end
        outside the heading above them. Reversing that (a wide head over a
        narrow list) is the more common arrangement and reads completely
        differently: this one puts the emphasis on what is included.
     3. THE MARKER IS ON THE RIGHT, not beside the text. V2 and V3 both lead
        each line with the tick; here the inclusion sits left and its mark is
        pushed to the far edge of a 761 row, which is what makes the column read
        as a table with a status against each line rather than as a bulleted
        list. It is the same arrangement FaqV4 uses for its question and its +.
     4. THE MARKER IS TYPOGRAPHIC. A 28px squircle holding a real "✓" set in the
        display face, rather than V2's and V3's two drawn bars. It is heavier and
        less exact than a drawn glyph, which is the point in a section whose
        heading is extrabold.
     5. THE KICKER HAS NO BAR. WhyUsV4 and TestimonialsV4 both open with a
        20 × 2 gradient rule beside the label; this reference drops it and
        centres the bare mono line. With the label centred there is no left edge
        for a bar to start from, and one centred under a centred heading would
        read as a third element rather than as a mark on the first.
     6. IT IS THE SHALLOWEST BAND OF THE FOUR — 64 top and bottom, against V2's
        and V3's 96 and V5's 160.

   THE ONE THING THIS LAYOUT WANTS AND CANNOT HAVE IS A NUMBER. A centred ruled
   table with a 28px status marker on each row is the shape of a pricing sheet,
   and a reader arriving at it expects a figure — which makes this the variant
   where the absence is most visible, and the one worth thinking hardest about
   before shipping. It stays absent anyway: lib/content.ts's house rules forbid
   dollar amounts anywhere on this site, and the copy's stated position is
   "priced to your brief, not a package", so a number here would be an invented
   one. What fills the slot instead is `pricing.foot` — "most brands get a
   number back the same day" — set directly under the CTA, which answers the
   question the table raises without answering it falsely. If real figures ever
   exist, this is the variant that absorbs them with the least surgery: they go
   in the right-hand cell where the ✓ currently sits.

   The clamps run DOWNWARD only. Each lands on its desktop number by ~1280 and
   holds it above; the ramp exists for everything narrower. */

/* THE TWO EDITORIAL MEASURES, AS RAMPS THAT ARE INERT TO 1920.

   672 and 761 are the reference's, and they are right: a centred header and a
   two-column row list are prose, and prose does not get wider because the
   monitor did. What was wrong was that they were the ONLY thing in this band
   with a number, so once the section's own 1280 cap came off they would have
   been a 672px column adrift in a 1920px box.

   Both vw terms are tuned to resolve to the flat value at exactly 1920 — 35vw
   is 672 there, 39.64vw is 761 — which is the same trick WRAP's own ceiling
   uses, and it means every width anyone has designed against resolves to the
   number that was drawn. The ramp only opens above 1920, by 25%, and holds flat
   again from ~2400 up. */
const HEAD_MEASURE = "max-w-[clamp(672px,35vw,840px)]";
const LIST_MEASURE = "max-w-[clamp(761px,39.64vw,950px)]";

/* THE SECTION HEADING STEP, SHARED WITH THE WHOLE PAGE — not a fourth private
   clamp. This was `clamp(2rem,1.35rem+2.7vw,3rem)`: 48px flat from 1100px of
   viewport all the way up, while Why us and Testimonials ran to 64 and Work to
   66. Three ceilings for one tier is what "some sections stop resizing" looks
   like — scroll from Why us into Pricing on a 2560 display and the heading
   visibly drops a third. SIZE_H2 is one ramp for all four, 32 → 64, and it
   clears H1 at every width; see lib/ui.ts. The 48 this used to state is still
   on the ramp, it just lands at ~1300 now instead of being the ceiling. */
const HEADING = SIZE_H2;

/* 20px inclusions, down to 18 — the same step FaqV4 sets its questions at. */
const ROW_SIZE = "text-[clamp(1.125rem,1.05rem+0.31vw,1.25rem)]";

/* THE ROW. A hairline under every one, and the first also carries one above —
   which is what closes the list at both ends.

   THE TOP RULE IS SET FROM THE INDEX, NOT FROM `first:`. Every row here is the
   only child of its own Reveal wrapper, so `first-child` is true for all four
   of them and a `first:border-t` would draw a rule above every row on top of
   the one already under the row before it. */
const row = (first: boolean) => `group border-b border-line ${first ? "border-t" : ""}`;

/* The 28px squircle. `rounded-2xl` on a 28 box is the reference's 16-on-28 — a
   rounded square, not a disc, which is what keeps it from reading as a bullet.

   NO HOVER STATE. FaqV4's marker brightens on hover because its row is a
   <summary> and the whole thing is a control; these rows are static text and
   nothing here is clickable, so a hover response would promise an interaction
   that does not exist. */
const MARKER =
  "grid size-7 flex-none place-items-center rounded-2xl border border-line " +
  "font-display text-base font-bold leading-none text-pink-deep";

export function PricingV4() {
  return (
    /* WRAP AND SECTION, THE PAGE'S OWN BOX — not the reference's 1280 cap and
       56 gutter any more. The reference frame gives no vertical padding at all
       (it is a crop, not a section), which is why the rhythm was borrowed from
       V2 and V3 in the first place; the horizontal half was left on the
       reference's numbers, and that is what stranded this band. Above ~1400px
       of viewport every other section on the page kept opening — WRAP runs to
       1520 and then ramps to 1920 — and this one stopped dead at 1280 with its
       own narrower gutter, so the page visibly came apart below Work on any
       large display or at any zoom-out. Same box as every other band now, which
       also puts this section's first pixel on the same x as the hero's
       headline. */
    <section
      id="pricing"
      className={`${ANCHOR} ${WRAP} ${SECTION}`}
      aria-label={pricing.kicker}
    >
      {/* HEADER — 672, centred. 10 under the kicker is the tightest gap in the
          whole set, and it is what binds the two lines into one header block
          rather than leaving the kicker floating above it. */}
      <div className={`mx-auto flex w-full ${HEAD_MEASURE} flex-col items-center`}>
        <Reveal>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-pink-deep">
            {pricing.kicker}
          </span>
        </Reveal>

        {/* No `text-balance`: the copy carries a hard \n at the comma, which
            RevealText turns into a <br>, so the break is already decided in
            lib/content.ts and balancing would go looking for a second one. */}
        <RevealText
          as="h2"
          text={pricing.heading}
          className={`mt-2.5 text-center font-display ${HEADING} font-extrabold leading-[1.088] tracking-[-0.02em]`}
        />

        <Reveal delay={80}>
          <p
            className={`mt-6 text-pretty text-center font-sans ${TEXT_SMALL} leading-6 text-ink-soft`}
          >
            {pricing.body}
          </p>
        </Reveal>
      </div>

      {/* THE LIST — 761, centred, and wider than the 672 header above it. See
          note 2: that inversion is the design. */}
      <ul className={`mx-auto mt-10 w-full ${LIST_MEASURE}`}>
        {pricing.includes.map((item, i) => (
          <li key={item} className={row(i === 0)}>
            <Reveal delay={i * 60}>
              <div className="flex w-full items-center justify-between gap-6 py-6">
                <span
                  className={`font-display ${ROW_SIZE} font-bold leading-[1.3] tracking-[-0.02em]`}
                >
                  {item}
                </span>
                <span className={MARKER} aria-hidden="true">
                  ✓
                </span>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      {/* THE CLOSE — 40 under the list, centred. The footnote is the answer to
          the number this table does not print; see the header note. */}
      <Reveal delay={100} className="mt-10 flex flex-col items-center gap-3">
        <Button contact variant="grad" withArrow>
          {pricing.cta}
        </Button>
        <p className={`font-sans ${TEXT_META} text-ink-faint`}>{pricing.foot}</p>
      </Reveal>
    </section>
  );
}
