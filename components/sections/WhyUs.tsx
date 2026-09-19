import { content } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import {
  ANCHOR,
  CARD_GAP,
  HEAD_GAP,
  SECTION,
  SIZE_16,
  SIZE_24,
  SIZE_H2,
  TEXT_LEAD,
  TEXT_STATEMENT,
  WRAP,
} from "@/lib/ui";

const { why } = content;

/* THE BOX IS THE PAGE'S. THE TYPE IS STILL THIS SECTION'S OWN.

   Two separate things were bundled together when this section went off-scale,
   and only one of them has come back.

   THE TYPE STAYS AUTHORED. 64 / 32 / 24 / 16, by request — the SIZE_* ramps
   below are those four desktop values made responsive, and no step of the
   page's shared ladder is involved. Change TEXT_H2 and this heading does not
   move.

   THE BOX IS NO LONGER AUTHORED. Gutter, ceiling, vertical rhythm and the two
   gaps all come from SECTION / WRAP / HEAD_GAP / CARD_GAP now, the same as
   every other band. The 16/12 padding standing in for them was doing neither
   job: 16px of gutter against the hero's clamp(24,5vw,64) started this
   section's cards a long way outboard of the copy above them, and 12px of
   vertical padding left a 24px seam between two bands the rest of the page
   separates by 80 to 128. Both read as misalignment because both were.

   ONE GAP BECAME TWO, which is the other half of the repair. A single 32 ran
   every seam here — heading to content and card to card — and that is the one
   arrangement the spacing scale exists to prevent: a header block sitting
   exactly as far from the cards as the cards sit from each other belongs to
   them as readily as to its own section. HEAD_GAP (32→64) over CARD_GAP
   (32→48) puts the ordering back. */

/* THE CARD IS V4'S, CENTRED. Everything that made a V4 pillar read as an
   enumerated case comes over intact — the 36px gradient disc, the extrabold
   20px title, the shrinking 16-then-8 ladder under it, the 24 radius and the
   0.8 hairline — and the only thing changed is the axis: `items-center` plus
   `text-center` on each part, so the badge sits over the middle of the title
   rather than beside its first word.

   THE HOVER HAIRLINE IS GONE WITH IT. It grew from the left edge, which is a
   left-aligned card's gesture; on a centred card it reads as arriving from
   somewhere. The lift and the shadow are the whole hover now, same as V4.

   PADDING IS STILL UNDER THE GRID GAP, which is the rule the scale exists to
   hold: 20→24 inside a card that CARD_GAP separates by 32→48, so a pillar's
   text is always nearer its own edge than its neighbour's. It is a step tighter
   than the 24→32 this section used before because the type inside shrank with
   it — a 20px title does not need a 32px surround. */
const PILLAR =
  "flex h-full flex-col items-center rounded-3xl border-[0.8px] border-line bg-white " +
  "p-[clamp(20px,2vw,24px)] text-center " +
  "transition-[transform,box-shadow,border-color] duration-[280ms] ease-[cubic-bezier(0.22,0.7,0.2,1)] " +
  "hover:-translate-y-1.5 hover:border-transparent hover:shadow-[var(--shadow)]";

/* 20px card titles, down to 18 — V4's step, not the section's lead step. The
   contrast against the 64px heading is carried by WEIGHT here (extrabold
   against the page's usual bold) rather than by size, which is what lets a
   title this small still hold its own in the band. */
const CARD_TITLE = "text-[clamp(1.125rem,1.05rem+0.31vw,1.25rem)]";

/* THE NUMERAL CHIP, LIFTED FROM V2 AND SCALED UP.

   V2 sets its index in a 24px circle filled `bg-ink/4` with the numeral in
   pink-deep mono. That is the treatment; the only change here is the size.

   WHY IT IS A CIRCLE AGAIN AND STILL NOT THE OLD BALL. The disc this card used
   to carry was 36px of `--grad` at full saturation with a white numeral on top,
   which made it the loudest object in a white card — a decorative index
   outranking the claim it introduces. V2 keeps the round shape and inverts the
   emphasis: the fill drops to a 4% ink wash that barely separates from the card,
   and the COLOUR moves onto the digits. Same silhouette, opposite weight.

   36px, NOT V2's 24. V2's cards are small, flush-left and set at body size,
   where 24 is in proportion. These are centred, padded to 24 and titled in
   extrabold display, and at 24 the chip read as a leftover under that.

   36 IS THE DISC'S OWN FOOTPRINT, WHICH IS THE POINT AND NOT A COINCIDENCE. The
   card was drawn around a 36px mark, so the gap ladder under it and the balance
   between the mark and the title were both set against that size. Taking V2's
   treatment back up to it means the card gets its original proportions with the
   original's weight problem inverted: same 36px circle, 4% wash instead of full
   saturation, pink digits instead of white on a gradient. Shape and scale from
   the disc, emphasis from V2.

   The numeral rides up with the circle, 0.62rem → 0.78rem, so the digits keep
   their proportion inside it rather than swimming in the middle.

   ZERO-PADDED AND MONO, WHICH IS V2's REASON AND IT HOLDS AT ANY SIZE: `01`
   through `06` are a fixed two characters at a fixed advance, so all six chips
   hold their numeral on the same optical centre and the six line up down the
   grid. A bare `1` beside a `6` in a proportional face would not.

   STILL `aria-hidden`, as the disc was. Read aloud, "one, It looks real, or it
   doesn't ship" prefixes every pillar with a number that says nothing the
   reading order has not already said. The numbering is for the eye, to make six
   cards read as one enumerated set; it is not content.

   THE GAP LADDER BELOW IT IS UNTOUCHED — 16 to the title, 8 to the body. */
const NUMERAL =
  "grid size-9 shrink-0 place-items-center rounded-full bg-ink/4 " +
  "font-mono text-[0.78rem] leading-none tabular-nums text-pink-deep";

/* THE CLAIM CARD'S GROUND — /bg.png, and now the ONLY copy of it in the card.

   THE IMAGE IS MIRRORED, AND IT IS MIRRORED IN THE FILE RATHER THAN IN CSS.
   A transform would turn the element and everything in it, and there is no way
   to flip one layer of a background-image list. So public/bg.png is stored
   flopped. It was re-encoded losslessly on the way through (verified
   pixel-for-pixel against the flopped source) and came out 25% smaller than it
   was, 6.9MB to 5.1MB.

   THE SECOND COPY THAT USED TO SIT OVER THIS ONE IS GONE. Two treatments have
   now been tried on it and both have been removed: first a masked 18px blur,
   then a sepia grade at `sepia(0.85) saturate(2.2) brightness(0.9)`. The blur
   destroyed the photograph in exactly the middle of the card, which is where a
   picture of several hundred video panels is legible as a WALL. The sepia kept
   the detail and traded it for a hue — it pushed every pixel onto one warm axis
   and held saturation above 1 so the card read amber rather than beige, which is
   to say it put a yellow cast over the whole thing. That was its stated intent
   and it is the reason it is gone.

   WHAT REPLACED BOTH IS NOTHING, AND THAT IS A MEASUREMENT RATHER THAN A
   SHRUG. The no-treatment variant was tested on a live side-by-side and held
   7.46:1 worst case with the scrim alone over a completely sharp photograph.
   The scrim was always carrying the contrast; the second copy was only ever
   carrying a look. With it gone the wall keeps its colour and its detail edge
   to edge, which is the whole reason a picture of a video wall sits behind a
   claim about VOLUME.

   IF A GRADE EVER COMES BACK, MAKE IT NEUTRAL AND MAKE IT UNIFORM. Neutral
   because a warm one agrees with the flame end of the page's gradient and
   argues with the violet end, and because the brand radials that used to
   justify a warm cast are no longer in CLAIM_SCRIM. Uniform because a MASKED
   grade would put a colour boundary across the middle of the card, and a hue
   edge is far more visible than a sharpness edge — a blur ramp can be hidden,
   a tone ramp cannot.

   IT WAS RENDERING NO BACKGROUND AT ALL BEFORE THIS, and that is worth knowing
   because the bug is invisible and the shape that caused it is easy to write
   again. The old value was one `bg-[...]` holding three comma-separated layers,
   and the last of them was `var(--color-paper-2)` — a plain colour, #fff7f3. A
   colour is not a valid <bg-image>, and ONE invalid layer in a comma list
   invalidates the WHOLE declaration rather than just its own layer. Chrome
   reported `background-image: none` and `background-color: rgba(0,0,0,0)` on
   this element: the two tint radials had never painted either. So the colour is
   now a background-COLOR utility of its own, and only real image layers go in
   the image list.

   WHAT IS LEFT IN THIS LIST IS NOW ONE IMAGE, which is the other half of that
   lesson: the fewer layers share a declaration, the less one bad value can take
   with it.

   THE BASE COLOUR IS noir, AND IT IS NOT DOING WHAT THIS NOTE USED TO SAY.
   The claim was that /bg.png is a third transparent and noir fills the holes.
   Measured, the file is 100% OPAQUE — it carries an alpha channel, but every
   one of its pixels is at alpha 255, so nothing under it has ever shown through
   and paper-2 would have been just as invisible. What noir actually buys is the
   moment BEFORE the image arrives: a 5MB background on a card whose type is
   `text-paper` renders as near-white on near-white if the ground under it is
   light, so the base colour is what keeps the claim legible while its texture is
   still downloading. Keep it for that, not for holes.

   cover/center/no-repeat RATHER THAN THE NATURAL SIZE. The source is wide and
   the card is wide and short, so at natural size it would tile and show its
   seams. `cover` crops to the middle band, which on this image is the part with
   the texture in it.

   THE INTRINSIC SIZE HAS ALREADY MOVED TWICE and the comment chased it both
   times, so it is not recorded here any more. Nothing breaks when it changes —
   cover/center does not care — but the scrim below IS tuned to where this
   particular picture is bright, so re-measure the contrast behind the claim
   whenever the file is swapped. Bright content moving into the middle is the
   failure it would not survive. */
const CLAIM_BG = "bg-noir bg-cover bg-center bg-no-repeat bg-[url('/bg.png')]";

/* THE SCRIM IS THE WHOLE TREATMENT NOW, AND IT IS ENOUGH ON ITS OWN.

   That ordering was always the house rule — Testimonials.tsx puts it plainly:
   the fill carries the contrast and any softening is the finish, not the other
   way round. What changed is that there is no finish left. Measured over a
   completely sharp, completely untoned photograph this gradient holds 7.46:1
   worst case against `text-paper`, comfortably past AA, so nothing above it is
   required for legibility.

   Which is also why the card has no fallback story to worry about. It used to
   depend on `filter` and `mask-image` having run; now it depends on a
   background-image gradient, which is as old as the box model. A hardened
   browser, a "reduce transparency" setting or a print stylesheet all leave this
   layer intact.

   ONE ELEMENT, ONE IMAGE LAYER. The warm and cool corner radials that used to
   ride here at 10% alpha are gone. They were the only thing tying this card to
   the page's flame/violet run, and removing them is a real cost — but they were
   also reading as a yellow cast in the top-left corner once the sepia grade was
   removed from under them, and a lone violet wash in the opposite corner reads
   as a stray tint rather than as half of a deliberate pair. If the tie to the
   brand ramp is wanted back, bring BOTH radials back together or neither.

   THE RAMP: 0.82 at the centre where the statement sits, still 0.70 at 42% —
   the measure caps at 26ch, so the type never leaves that plateau — then down
   to 0.40 at the corners, which is dark enough to sit under the hairline
   without flattening the thumbnails into mud.

   THE CLASS IS WRITTEN OUT WHOLE INSIDE ONE STRING LITERAL, and that is not a
   style preference. Tailwind scans source TEXT for candidates: it never
   evaluates this file, so a class assembled across a `+` or out of a `${}` is a
   class it never sees and never generates. Splitting BETWEEN classes is fine —
   the concatenation here breaks on a space — but splitting INSIDE one, or
   interpolating its value from a constant, silently produces no rule at all.

   THIS IS NOT HYPOTHETICAL, IT HAPPENED TWICE ON THIS CARD. The note on
   CLAIM_BG above records the first: one invalid layer in a comma list took the
   whole declaration with it, and Chrome reported `background-image: none` on an
   element that looked fine because something else was painting. The second was
   the blur treatment's first draft, which hoisted its mask into a constant and
   interpolated it. Computed style came back `mask-image: none` and
   `background-image: none` — the blur's own edge falloff was doing a passable
   impression of a ramp, so it LOOKED like it worked.

   Both failures are invisible in the browser and invisible in review. Check
   computed style, not the screenshot, whenever this class changes. */
const CLAIM_SCRIM =
  "pointer-events-none absolute inset-0 " +
  "bg-[image:radial-gradient(85%_115%_at_50%_50%,rgba(14,12,17,0.82)_0%,rgba(14,12,17,0.7)_42%,rgba(14,12,17,0.4)_100%)]";

export function WhyUs() {
  return (
    /* THE TWO-ELEMENT SPLIT EVERY OTHER SECTION USES: the <section> owns the
       vertical rhythm and nothing else, the div inside it owns the gutter and
       the ceiling. Keeping them apart is what lets a band paint a ground edge
       to edge while its content still stops where the hero's content stops —
       and WRAP's ceiling IS the hero's stage, 1520 against the same gutter
       clamp, so that is one measurement shared rather than two similar numbers
       that happen to agree today. */
    <section id="why" className={`${SECTION} ${ANCHOR}`} aria-label={why.kicker}>
      <div className={WRAP}>
        {/* THE HEADER BLOCK IS ITS OWN FLEX COLUMN, and it has to be: RevealText
            renders its root as `display: inline`, so a margin on the h2 below is
            inert — the same trap SectionHeading documents on its own mt-3. A flex
            parent blockifies its children, which is what makes these gaps exist
            at all.

            12, THEN 24, THEN HEAD_GAP, opening as it goes down. The kicker
            belongs to the headline, the lead belongs to both, and the cards
            belong to the section; each gap being larger than the one above it is
            the only thing telling a reader which of those is which. */}
        <div className={`${HEAD_GAP} flex flex-col items-center gap-3 text-center`}>
          {/* Roboto, not the mono every other kicker on the page uses —
              "everything else Roboto" applies to this too. The rule keeps its
              length in em so it still tracks the 24px it sits beside. */}
          <Reveal>
            <span className={`inline-flex items-center gap-[0.62em] font-sans ${SIZE_24} font-medium uppercase tracking-[0.22em] text-pink-deep before:h-px before:w-[2.2em] before:bg-current before:opacity-55 before:content-['']`}>
              {why.kicker}
            </span>
          </Reveal>

        {/* The measure is in em ON THE H2 ITSELF, where em resolves against this
            element's own 64px rather than against the body size — which is why
            SectionHeading has to route the same cap through a custom property and
            this does not. 13em is the same ~13-title-em measure the rest of the
            page's headings use, so it still turns over two lines.

            A gradient run is marked in the copy with *asterisks* and RevealText
            lays each word out as its own box — see the note there before setting
            this as plain text. */}
          <RevealText
            as="h2"
            text={why.heading}
            className={`mx-auto max-w-[13em] text-center text-balance font-display ${SIZE_H2} font-bold leading-[1.1] tracking-[-0.022em]`}
          />

          {/* mt-3 on top of the column's own 12 is the 24 the lead is owed: one
              step above the gap over it, one step below the gap under it.

              TEXT_LEAD, NOT THE AUTHORED 32px STEP, AND IT HAD TO MOVE WITH THE
              HEADING. The heading above is on SIZE_H2 now, which tops out at 64
              at 1920 rather than at 1440 — a 32px lead under it ran 1.6x at the
              laptop widths, and lib/ui.ts's own rule is that a heading runs two
              to three times the text it introduces. TEXT_LEAD puts it back in
              band (2.0x on a phone, 2.5x at 1440, 3.2x at 1920) and is the step
              every other deck on this page already uses, so the section's lead
              is now the same size as the hero's rather than 60% larger. */}
          <Reveal delay={100} className="mt-3">
            <p className={`mx-auto max-w-[54ch] text-center text-pretty font-sans ${TEXT_LEAD} leading-[1.45] text-ink-soft`}>
              {why.lead}
            </p>
          </Reveal>
        </div>

        <div className={`grid ${CARD_GAP} phone:grid-cols-2 lap:grid-cols-3`}>
          {why.pillars.map((p, i) => (
            /* Stagger runs across the ROW, not the whole grid: at 6 × 70ms the
               last card would still be arriving long after the reader got there.
               It resets every three so no card waits more than 140ms. */
            <Reveal key={p.title} delay={(i % 3) * 70} className="h-full">
              <article className={PILLAR}>
                {/* The 36px numeral chip — see NUMERAL. */}
                <span aria-hidden className={NUMERAL}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* THE LADDER OF SHRINKING GAPS — 16 here, 8 below, not one gap
                    repeated. The badge sits further from the title than the
                    title does from its body, so the title and body group as one
                    block that the badge introduces. */}
                <h3 className={`pt-4 text-balance font-display ${CARD_TITLE} font-extrabold leading-[1.2] tracking-[-0.025em]`}>
                  {p.title}
                </h3>
                {/* `leading-6` is 24-on-16: these cards run ~390 wide at the
                    ceiling, so the lines are long enough to need the extra
                    leading to stay trackable. */}
                <p className={`pt-2 text-pretty font-sans ${SIZE_16} leading-6 text-ink-soft`}>
                  {p.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* The argument, not a card in the grid — so it gets the photographic
            ground, the larger radius, and a padding step above the pillars to
            match. Worth knowing if it ever looks empty: the claim text caps at
            26ch, so most of this box's width IS padding at a desktop measure.

            THE TOP MARGIN IS CARD_GAP'S CLAMP, SPELLED OUT. The section is not a
            flex column any more, so this seam is a margin rather than a gap, and
            it is deliberately the same number as the seam between the cards
            above: the claim is the last item in that sequence, not a new one.
            Tailwind scans source TEXT and never sees a class assembled from a
            variable, which is why the clamp is written out rather than derived
            from CARD_GAP — the note at the foot of lib/ui.ts. */}
        {/* THE FOREGROUND FLIPPED WITH THE GROUND, AND IT HAD TO. /bg.png is a
            DARK-ON-AVERAGE photograph — and "on average" is the correction this
            note needs, because calling it a near-black texture is what made
            `text-paper` look like the whole job. Its mean is dark; its left two
            thirds are not, and measured on the pixels behind the statement 43%
            of them sat under 4.5:1 against paper, with a worst case of 1.04:1.
            That is the bug CLAIM_SCRIM exists to fix, and it fixes it alone: the
            same measurement over a sharp, untoned photograph reads 7.46:1 worst
            case. Everything in this box was drawn for the near-white ground it
            replaced: the statement inherited `text-ink` (#16141a) from the body,
            the CTA was `variant="dark"` (ink pill, paper text) and the hairline
            was `border-line`, ink at 10% alpha. All three are near-black on
            near-black. Left alone the card would have rendered as a dark
            rectangle with an invisible sentence and an invisible button in it.

            `text-paper` here rather than on the statement itself so the whole
            box inherits it — the CTA's own variant sets its colour, so nothing
            is fighting over it, and anything added to this card later starts
            legible instead of starting invisible.

            `border-white/10` is `border-line` mirrored: the same 10% hairline,
            measured from the other end of the scale. */}
        {/* `isolate` so the scrim stacks against this card and nothing else,
            `overflow-hidden` so it takes the 3xl radius — an absolutely-
            positioned inset-0 child is a rectangle otherwise, and the scrim
            would square off the corners the border is rounding. */}
        <div
          /* Not full-bleed, but it is wider than the wrap the nav links sit
             in, so it passes under them — and it is a dark photograph. Same
             flag the work band and the footer carry; see Nav.tsx. */
          data-nav-dark
          className={`relative isolate mt-[clamp(32px,3.5vw,48px)] overflow-hidden rounded-3xl border border-white/10 p-[clamp(32px,3.5vw,48px)] text-center text-paper ${CLAIM_BG}`}
        >
          <div aria-hidden className={CLAIM_SCRIM} />

          {/* THE FLEX COLUMN MOVED OFF THE CARD AND ONTO THIS, because the card
              now has an absolutely-positioned child and it must not become a
              flex item. `relative` is all the lift the content needs: it and the
              scrim are both positioned with an auto z-index, so paint order is
              DOM order and the content is last. No z-index anywhere, which is
              why `isolate` above is enough to keep it that way. */}
          <div className="relative flex flex-col items-center gap-6">
            {/* A DIRECT flex child, deliberately: `display: inline` on a flex item
                blockifies, which is what lets the 26ch measure apply. Wrap it in a
                Reveal <div> and the div becomes the flex item, the <p> stays inline,
                and the measure is silently dropped.

                Roboto rather than Montserrat: it is a statement, not a heading, and
                "everything else Roboto" covers it. Its SIZE is still the page's
                STATEMENT step — no fixed value was given for this one. */}
            <RevealText
              as="p"
              text={why.claim}
              stagger={30}
              className={`max-w-[26ch] text-pretty font-sans ${TEXT_STATEMENT} font-bold leading-[1.2] lap:leading-[1.1] tracking-[-0.022em]`}
            />
            <Reveal delay={100}>
              {/* `grad` rather than `dark`, which is now an ink pill on an ink
                  ground. It is also the same variant the hero gives this exact
                  action — both are `contact`, both open the DM — so the page's
                  primary CTA looks the same in both places it appears. */}
              <Button contact variant="grad" withArrow>
                {why.claimCta}
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}