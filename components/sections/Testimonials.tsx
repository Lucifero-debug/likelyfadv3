"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { reelVideos, type Reel } from "@/lib/reels.generated";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Lightbox } from "@/components/ui/Lightbox";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import {
  HEAD_GAP,
  SECTION,
  SIZE_16,
  SIZE_H2,
  TEXT_META,
  WRAP,
} from "@/lib/ui";

const { testimonials } = content;

/* TESTIMONIALS — video cards that play in place.

   Built to the shape of Framer's `Testimonials Video` component — an auto-fit
   grid of cards that expand into a real player rather than opening an overlay —
   and then moved five steps away from it, each for a reason this page's own
   material forced:

     1. THE FRAME IS 9:16, NOT ONE OF THE REFERENCE'S FIVE RATIOS. Every reel in
        the library is vertical. At 3:4 the card threw away a third of each
        frame and the crop had to be biased up to keep faces in shot; at 9:16
        nothing is cut and the ad is shown as it was made. This is a section
        about the work being convincing, so cropping the work to fit a card was
        the wrong trade — the card fits the work instead.

     2. THE CARD IS PAPER, NOT GLASS. The reference sets its quote over the
        video behind a dark gradient. That reads beautifully in isolation and
        reads as a different website here: every other card on this page is
        white on paper with ink type and a pink accent. So the frame keeps its
        own corners inside a white card, and the quote sits under it on paper
        where it needs no scrim to be legible.

     3. THERE IS NO PLAY BUTTON. The reference puts a disc in the middle of
        every card and this has none, because a disc is an instruction to do
        something the card has already done: the clip is ALREADY RUNNING by the
        time you could aim at it. What replaces it is a cue that names the one
        thing left to gain — sound — and it only appears once the picture is
        moving, so nothing is ever asking to be pressed for a result it is
        already showing.

     4. IT PLAYS WITHOUT BEING ASKED, BY WHICHEVER MEANS THE DEVICE HAS. On a
        pointer device that is hover, one card at a time, because a pointer can
        only be on one card at a time. On a touch device there is no hover, and
        the usual answer — put the button back for phones — gives the smallest
        screen the clumsiest version. So on a touch device EVERY card that has
        reached the middle of the viewport plays, together: scrolling IS the
        gesture, and what it asks for is the section, not one card out of it.
        Both routes end in the same place, a silent clip with a cue offering
        sound, and neither needs a control.

        IT USED TO PICK ONE CARD ON TOUCH AS WELL — the lowest index touching
        the band — which made a phone the one device where two cards sat side by
        side in the row and only the left one moved. That reads as the right one
        having failed to load rather than as a choice. THE HOVER ROUTE IS
        UNTOUCHED: a pointer device still previews exactly the card under the
        pointer, and nothing below `(hover: none)` is live on it.

     5. THE CARDS SIT IN A ROW THAT SCROLLS, NOT A GRID THAT WRAPS. The
        reference wraps, and wrapping is what a grid of PHOTOGRAPHS wants: eight
        3:4 cards in two rows read as one block you take in at a glance. Eight
        NINE-BY-SIXTEEN cards in two rows is a two-thousand-pixel band you take
        in by scrolling past most of it, and this section's job is the opposite
        of that — it is the one place on the page where the visitor is meant to
        watch, not skim. A row shows two or four at full size, keeps the rest
        one gesture away, and lets the ninth testimonial cost nothing when it
        arrives. See TRACK for how the two counts are set.

   WHAT THE CARD CLAIMS, WHICH IS THE ONE THING NOT TO GET WRONG HERE. A play
   button over a face with a quote beneath it reads as "this video is the client
   speaking". These clients are unnamed, asked to stay that way, and none of them
   is on camera. A caption above every quote used to say the frame was THE AD
   THE REACTION WAS ABOUT; it was removed by request (Sep 2026). Without it a
   reader can take the person in the frame for the client quoted under it — if
   that matters again, that caption is the fix.

   NO BRAND LOGOS, which the reference puts on every card. There are none, for
   the same reason there are no names.

   MEDIA ELEMENTS ARE CREATED, NEVER PARKED, AND THAT IS THE HALF THAT DID NOT
   CHANGE when the touch route went from one card to all of them. A card at rest
   is a poster and nothing else: the preview clip mounts when the card is
   pointed at or scrolled into the middle band, and dies the moment it is not;
   the full player mounts on click and dies when another card takes over.

   WHAT THE CEILING IS NOW, AND WHY EIGHT TESTIMONIALS DO NOT MEAN EIGHT
   PLAYERS. On a pointer device it is still ONE, because hover is exclusive. On
   touch it is however many cards are inside the middle band at once — and the
   band is only half of what bounds that. The other half is the row: this is a
   horizontal scroller, and the observer is rooted at the VIEWPORT, so a card
   that has been scrolled off the side of the row is not intersecting anything
   and never qualifies. The count is therefore whatever the row happens to be
   showing, not the length of the list.

   MEASURED, on the dev build with the section centred:

     iPhone 13 (390x664)   3 of 8 — two whole cards plus the peek of the third
     iPad-width touch      5 of 8 — four whole cards plus the peek

   THE BUDGET THIS SPENDS FROM IS REAL, and this is the number to re-measure if
   the row's card count ever changes: the page already mounts 128 media elements
   between the hero wall and the work wall, which is past the number a browser
   keeps alive at once. Three on a phone is affordable against that and is what
   a phone-sized row can ask for. A row showing eight at once would not be — at
   that point the band has to narrow, or this route has to go back to picking a
   subset of what it can see.

   ONE OPEN AT A TIME, enforced by the section rather than by each card: opening
   the second stops the first, because two ads talking over each other is the
   one failure this section cannot recover from. It also means the player's
   state never has to be reset — it dies with the element. */

/* A ROW THAT SCROLLS, NOT A GRID THAT WRAPS. Two cards on a phone, four from
   `lap:` up, and every card past that count reached by scrolling sideways.

   TWO WHOLE CARDS ON A PHONE IS A HARD CONSTRAINT, AND EVERYTHING ELSE ON A
   PHONE IS SPENT PAYING FOR IT. At 390px the row has 342px to divide, so the
   ceiling on a whole card is 171 — that is the arithmetic with a zero gap and
   no peek at all. There is no tuning that makes a 2-up phone card generous;
   there is only getting as close to 171 as a usable row allows. The gap and
   the peek both drop to 16 below `tab:` and the card's own padding drops to 8,
   which is what turns 147 into 155 and the frame inside it from 123 to 137 —
   a ninth of the row recovered from three places that were each spending more
   than a phone can afford. All three go back up at `tab:`, where the row is
   twice as wide and 24 costs nothing.

   THE COUNTS ARE DECLARED AT EVERY STEP, and auto-fit could not have found
   any of them.

   THE WIDTH IS A CALC OFF THE ROW, NOT A FIXED TRACK: (the row, minus the gaps
   BETWEEN the visible cards, minus the peek) divided by how many are visible.
   So the count is exact at every width instead of being whatever a track size
   happened to buy, and it moves on one number when the breakpoint does.
   `flex-none` is what stops flexbox from fitting all eight into a row drawn
   for two.

   `min-w-0` IS NOT DECORATION, IT IS THE BASIS ACTUALLY HOLDING. A flex
   item's automatic minimum size is its MIN-CONTENT width, which beats a
   flex-basis this size: on a 390 phone the three cards whose attribution
   contains SUPPLEMENTS or PERFORMANCE — one unbreakable 11-character word in
   uppercase at 0.09em tracking — pushed themselves out to 167 and 170px against
   a 137px basis, and took their 9:16 frames up with them. Two cards at a time
   quietly became one and a bit. The floor has to be 0 for the declared count to
   mean anything.

   THERE IS NO `h-full` ON THE ITEM, AND THAT IS WHAT MAKES THE CARDS LEVEL.
   A flex item only stretches to the row's height while its cross size is
   `auto`; `height: 100%` is not auto, so the class that equalised the cards
   under a GRID is the one thing that stops flexbox equalising them. Dropped
   here, `align-items: stretch` gives every item the tallest card's height and
   the card's own `h-full` resolves against it — see CARD_TEXT for what keeps
   that tallest card from being set by one long quote.

   BOTH LENGTHS ARE CUSTOM PROPERTIES because each is needed twice — once as
   the flex gap or the peek, once inside a basis calc — and each has to be ONE
   number in both places. They are written out rather than imported because
   Tailwind reads class names as literal source text and cannot see through a
   constant.

   THE GAP STARTS AT 24 AND NOT AT CARD_GAP's 32, WHICH IS THE ONE PLACE THIS
   ROW LEAVES THE PAGE'S SCALE. CARD_GAP is drawn for a WRAPPING grid, where a
   gap has to separate a card from the one beside it AND the one under it, and
   where being too small hands a card's text to its neighbour. Nothing wraps
   here: there is one line of cards, each with a border, a shadow and 12px of
   its own padding, and the only question the gap has to settle is which card a
   line of type belongs to. 24 settles it — it is twice the card's own padding,
   which is the ordering lib/ui actually cares about — and the 8px it gives
   back is 8px of MEASURE, which a phone spends on the quote. From ~914px up the
   clamp has climbed back to CARD_GAP's numbers and the two agree again.

   THE PEEK CLIMBS MORE SLOWLY THAN THE GAP, on 2.5vw against 3.5vw, so it hits
   its 32px ceiling at the width the four-up row starts wanting a bigger sliver
   and stays at 24 across every phone. Both ends of both clamps are on the
   page's scale — 24, 32, 48 — which is the rule for a clamp in lib/ui; what
   they resolve to in between is the part that makes them fluid.

   IT RUNS FULL BLEED WITH A HAIRLINE GUTTER. The row sits outside the WRAP and
   carries only 8px (12px from `tab:`) of side padding, so the first card starts
   just off the left edge of the viewport, like the Work wall. `scroll-px` states it a third time, so a snapped card lands
   on that x too rather than flush against the bleed.

   THERE IS NO VERTICAL PADDING ON THE ROW, and there was: overflow on one axis
   forces a scrollport on both, so the card's hover lift and its shadow had to
   be paid for with py-3 and given back with -my-3. The card has neither now,
   nothing crosses the row's top or bottom edge, and the pair came out together
   rather than being left behind as a padding that cancels itself.

   AND THE Y AXIS IS NAILED SHUT, which is the other half of that same rule.
   `overflow-x-auto` alone does not leave the other axis alone: per CSS Overflow,
   when one axis is anything but `visible`/`clip`, a computed `visible` on the
   other becomes `auto` — so the row was a scrollport on BOTH axes, and anything
   crossing its bottom edge gave it a real internal VERTICAL scroll inside a page
   that already scrolls.

   WHAT WAS CROSSING IT WAS REVEAL, which is why the number below is 26 and not a
   round one. Every card enters from `translate-y-[26px]`, and a transform counts
   toward a scrollport's scrollable area even though it changes no layout — so
   the row was 26px taller than itself on the y axis, at every width, measured,
   until the entrance finished. `overflow-y-hidden` is what stops the browser
   inferring the scrollport. The pad-and-pull pair is what stops it costing
   anything: 26px of padding gives the clip box exactly the entrance's travel, so
   a card sliding up is never cut off at the ankles, and the matching negative
   margin hands the 26px straight back to the layout, so the row still ends where
   it ended. It is the same trick the py-3/-my-3 above was, sized to the only
   thing that still overshoots. Change one of the two and you change both.

   THE PEEK IS THE ONLY EVIDENCE THAT ANYTHING FOLLOWS THE ROW. Whole counts
   end exactly at the gutter, and a row that ends at the gutter looks finished.
   So the visible cards give up the peek's width between them and the next card
   starts that much early, showing a sliver past the gutter — 24px on a phone,
   36 at 820, 48 at 1440. On a phone that sliver is the ONLY affordance there
   is: no arrows fit in a 24px gutter, the scrollbar is hidden and there is no
   hover. It costs 8px of card and it is not optional.

   THE SCROLLBAR IS HIDDEN, which is only defensible because the affordance is
   carried three other ways: the peek, the snap, and — on every pointer that
   cannot flick — the arrows. */
const TRACK =
  "[--track-gap:16px] [--peek:16px] " +
  "tab:[--track-gap:clamp(24px,3.5vw,48px)] tab:[--peek:clamp(24px,2.5vw,32px)] " +
  "px-2 scroll-px-2 tab:px-3 tab:scroll-px-3 " +
  "flex snap-x snap-mandatory gap-[var(--track-gap)] overflow-x-auto overflow-y-hidden overscroll-x-contain " +
  "pb-[26px] -mb-[26px] " +
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep";

/* ON A PHONE ONE CARD IS 75% OF THE ROW, so one sits in view at a time with the
   next peeking in (see CARD for its shape there). From `tab:` up,
   `--card-scale` trims every card to 70% of its whole-count width; what it
   frees goes to the next card, so the peek grows rather than a gap opening. */
const ITEM =
  "[--card-scale:0.7] min-w-0 flex-none snap-start basis-[75%] " +
  "tab:basis-[calc((100%_-_var(--track-gap)_-_var(--peek))/2*var(--card-scale))] " +
  "lap:basis-[calc((100%_-_var(--track-gap)*3_-_var(--peek))/4*var(--card-scale))]";

/* THE ARROWS. Paper pills standing in the gutter, in the same near-solid white
   the badge and the control bar use, so they read as part of this page rather
   than as a carousel widget dropped onto it.

   THEY START AT `tab:` AND NOT BELOW: under 761px the gutter is 24px and
   cannot hold a button at all, and every
   device that narrow can flick the row with a thumb. 32px is the CTRL size the
   player's own bar uses, and it is what fits the 5vw gutter at the bottom of
   this range — 38px at exactly 761.

   THEY ARE CENTRED IN THE GUTTER, not hung off the content edge. The offset is
   half the button plus half the gutter, so the same one expression tracks the
   clamp from 38px to 64px and the button never touches either the cards or the
   edge of the viewport. Sitting them ON the cards would have been the other
   option and it puts a white pill over a face.

   AN EXHAUSTED ARROW GOES TO ZERO OPACITY RATHER THAN TO A DISABLED GREY,
   because at rest the row is at its start and a permanently dead left arrow is
   a control that has never once worked. It is `disabled` underneath the
   opacity rather than `aria-hidden`, which is the difference between a button
   that is gone and a button that is invisible but still in the tab order and
   still announced — the second is a focus stop on nothing. `disabled` also
   stops the click, so an invisible arrow cannot swallow one meant for the card
   under it. */
const ARROW =
  "absolute top-1/2 z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full border border-line " +
  "bg-white/92 text-ink shadow-[var(--shadow-sm)] backdrop-blur-[2px] " +
  "transition-[opacity,transform] duration-200 hover:scale-105 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep tab:grid";

/* THE TEXT BLOCK'S CEILING, WHICH IS WHAT EVERY CARD'S HEIGHT NOW COSTS.

   Cards in a row are all as tall as the tallest, so an unclamped block hands
   ONE testimonial the power to set the height of all eight — and it is never
   the best one, only the longest. Before this, a 4-line quote and a 3-line
   attribution put a hundred pixels of white under "Insane realism." on a
   desktop and nearly two hundred on a phone.

   THE NUMBERS ARE THE SAME AT EVERY WIDTH, and they were not always. The phone
   ran on 4 and 3 back when it showed two 147px cards, to cut less out of a
   measure of about 16 characters — and the block that bought came out 261px
   tall under a 219px video, a card 3.4 times taller than it was wide with more
   type in it than picture. The card is the video; the quote is the caption.
   2 and 2 hold that order at every width, and the phone pays for them in
   truncation — which, in a 121px measure, is the trade this section can afford
   and the height was not. The quote came down from 3 to 2 because a third line
   was buying a row of height off the one longest testimonial and reading as
   prose; two lines read as a pull quote, which is what these are.

   THE TWO ARE CLAMPED THE SAME NOW, which they were not when the quote had
   three lines. The attribution is the line that runs longest — "Marketing
   manager, supplements brand · after the second batch" — so it is still the
   one that truncates most often; it is also the least load-bearing, since the
   quote is the testimonial and the role is context for it. If either has to
   give again, it is the role, not the quote.

   IT IS A SPAN INSIDE THE FLEX ROW, NOT THE ROW ITSELF. line-clamp needs
   `display: -webkit-box` and the attribution is `display: flex` — it carries
   the gradient rule as a ::before, which only exists as a flex child. Clamping
   the <p> would delete the rule; clamping a span inside it keeps both. */
/* THE QUOTE IS NO LONGER CLAMPED (Sep 2026): every review shows in full. The
   frames stay top-aligned and each caption runs only as long as its own text,
   attribution right under the quote. Pinning the attribution to a shared
   floor was tried and dropped: it left a band of empty paper under every
   short quote. With no card chrome, ragged caption ends read as captions. */
const QUOTE_CLAMP = "";

/* The phone quote's fit range, px — see the fit effect in Testimonials. */
const FIT_MIN = 14;
const FIT_MAX = 28;

/* Sized off the CARD (the figcaption is the container), not the viewport:
   the cards were trimmed to 70% and a viewport-sized 23px left ~16 characters
   a line, which put the longest quote at seven lines. 8.6cqw is ~16.5px on a
   191px card. The floor is 14px on a phone, where two lines would need
   unreadable type, and 13px from `lap:`, which is what holds every (trimmed)
   quote to two lines at 1024, the narrowest card on a four-up row. */
/* On a phone the quote is the card's headline — semibold, tight leading, 17px
   on a 390 phone and scaled to the text column below that (15px floor) so the
   longest quote plus its role still fit the fixed 212px card at 360
   — since it sits beside the frame rather than under it. Semibold at every
   width; from `tab:` it takes the card-relative size. */
const QUOTE_SIZE =
  "text-[length:var(--quote-px,clamp(0.9375rem,13.4cqw,1.0625rem))] font-semibold leading-[1.3] " +
  "tab:text-[clamp(0.875rem,8.6cqw,1.375rem)] tab:leading-[1.4] " +
  "lap:text-[clamp(0.8125rem,8.6cqw,1.375rem)]";
const WHO_CLAMP = "line-clamp-2";

/* THERE IS NO CARD ANY MORE — the frame and its caption stand on the paper.

   What this deletes is a white ground, a hairline, a small shadow, 12px of
   padding and a lift on hover: the whole card object the section was built as.
   What is left is the thing the section was always about, which is the ad
   itself, with a line of type under it.

   THE FRAME IS NOW THE FULL WIDTH OF THE COLUMN, and on a phone that is the
   largest single gain in this section's history: 137px of video became 155px
   without the row changing count, because the 8px of padding on each side went
   to the picture instead of to a margin around it. The quote's measure gained
   the same 16.

   WHAT USED TO SEPARATE TWO CARDS WAS THE WHITE GROUND, AND NOW IT IS THE GAP.
   That is why the gap is not also free to shrink: with a border and a fill
   doing the dividing, 16px between two cards was generous; with nothing but
   paper between two frames it is the entire boundary. It stays where it is.

   NO HOVER LIFT, AND NOT BECAUSE IT WAS UNPOPULAR. A 4px rise reads as an
   object moving toward you and needs an edge and a shadow underneath to read
   as anything at all — without them it is type and a picture sliding for no
   reason. The frame already answers a pointer by playing, which is a better
   answer than moving. `group` goes with it: nothing in the card was ever
   keyed to it. */
/* ON A PHONE THE CARD IS A WHY US PILLAR: white, a hairline, 18px corners,
   with the review and its attribution on the left and the frame on the right
   (row-reverse, so the DOM keeps frame-then-caption for every width). From
   `tab:` up it goes back to frame over caption on bare paper.

   212px ON A PHONE IS A WHY US PILLAR'S HEIGHT (measured at 360-430: .pillar
   is 212 unless its title wraps). The frame fills it and takes its width from
   9:16. If the pillar's padding or type changes, re-measure this. */
const CARD =
  "flex h-[212px] flex-row-reverse items-stretch gap-4 rounded-[18px] border border-line bg-white p-3.5 " +
  "tab:h-full tab:flex-col tab:gap-0 tab:rounded-none tab:border-0 tab:bg-transparent tab:p-0";

/* The frame. `isolate` keeps every overlay inside stacked against this box, so
   a card can never lift a control over its neighbour. */
const MEDIA =
  "relative isolate aspect-[9/16] h-full w-auto flex-none overflow-hidden rounded-xl bg-poster tab:h-auto tab:w-full tab:rounded-2xl";

/* Resolve a content id against the generated library. The ids are stable across
   a sync and the URLs are not, which is why content.ts stores the id. A miss
   returns undefined and the card renders as a quote with no frame rather than
   as an empty box. */
function reelById(id: string): Reel | undefined {
  return reelVideos.find((r) => r.id === id);
}

/* AUTOPLAYING VIDEO IS MOTION, so both routes into a preview are gated on the
   same preference. Read at the moment it matters rather than once on mount: it
   costs nothing — this runs on a hover or a scroll boundary, not on a frame —
   and a visitor who turns the setting on mid-session is respected immediately
   rather than on their next navigation. */
function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* Whether a pointer entering a card should start the silent preview.

   THE pointerType CHECK IS WHAT KEEPS A TOUCH OUT OF THIS ROUTE. A tap fires
   pointerenter before it fires click, so without it a phone would start the
   silent preview and then open the full player anyway — two loads for one
   gesture, on the connection least able to afford it. Touch has its own route;
   see IN_VIEW_BAND. */
function wantsHoverPreview(pointerType: string): boolean {
  return pointerType === "mouse" && !reducedMotion();
}

/* THE MIDDLE BAND, and the whole of the touch behaviour.

   A card counts as "being looked at" when it crosses the middle 40% of the
   viewport — 30% shaved off the top and bottom of the root box. That is the
   number to change if it feels early or late. EVERY card that qualifies plays,
   so the two ends of this number now do the same thing at different moments
   rather than different things: widen it and the row starts moving further from
   centre, narrow it and the section has to be almost perfectly placed before
   anything moves, which on a slow scroll means it spends most of its time
   showing stills. 40% is where a phone's two visible cards come in together as
   the section settles, which is the point of it.

   ONLY ON A DEVICE WITH NO HOVER. On a laptop with a touchscreen both routes
   would be live, and a card would start playing as it scrolled past whether or
   not the pointer was anywhere near it. `(hover: none)` is the query that
   separates them: it describes the PRIMARY input, so a phone matches and a
   touch-capable laptop does not. */
const IN_VIEW_BAND = "-30% 0px -30% 0px";

/* ---------------------------------------------------------------------------
   ONE CARD. The frame is a button that opens the clip in the shared Lightbox
   — the same full-screen viewer the Work wall uses — and the quote lives
   beside or under it. There is no inline player and no playback bar any more
   (removed Sep 2026): the Lightbox carries sound and a mute control. */
function Card({
  item,
  reel,
  open,
  anyOpen,
  onOpen,
  inView,
  frameRef,
}: {
  item: (typeof testimonials.items)[number];
  reel: Reel | undefined;
  open: boolean;
  /** True while ANY card in the section is open, this one included. Only the
      in-view route reads it; see the note on `preview`. */
  anyOpen: boolean;
  onOpen: () => void;
  /** True when this card is inside the section's middle band — touch devices
      only. SEVERAL CARDS CARRY IT AT ONCE, which is the point: on a phone the
      two cards visible in the row play together. */
  inView: boolean;
  /** Registers this card's frame with the section's observer. */
  frameRef: (node: HTMLDivElement | null) => void;
}) {
  /* THE TWO ROUTES MEET HERE. `hovering` is this card's own business; `inView`
     is the section's, because "am I inside the viewport's middle band" needs an
     observer and the section owns the only one. Either one plays the clip and
     neither knows about the other, which is what keeps the two behaviours from
     having to agree on anything beyond "is it running" — and it is why making
     the touch route play EVERY card in the band did not touch the hover route
     at all. Hover is still exclusive, because a pointer is.

     `ready` IS SEPARATE BECAUSE THE FADE HAS TO BE STATE. The obvious shortcut
     is to drop the opacity class off the element in the `playing` handler and
     leave React out of it — and it works until anything re-renders this card,
     at which point reconciliation writes the original className back and a
     playing preview turns invisible. Opening ANOTHER card re-renders every
     card, so that is not a hypothetical. */
  const [hovering, setHovering] = useState(false);
  const [ready, setReady] = useState(false);
  /* The preview's own progress hairline, written through a ref rather than
     state: timeupdate fires ~4 times a second per playing clip, and putting
     that through React would re-render the card — and therefore its quote, its
     attribution and the whole figure — for a 2px bar. React never sets
     `transform` on this element, so nothing reconciles it away. */
  const bar = useRef<HTMLSpanElement>(null);


  /* THE OPEN PLAYER SILENCES THE OTHER CARDS' PICTURE, NOT JUST THEIR SOUND —
     but only on the touch route, which is the only one that can have several
     previews running in the first place.

     Opening a card is the one moment in this section where the visitor has said
     which ad they want, and it is the one moment audio is involved. Three
     muted clips looping beside the one they asked to hear is the same failure
     the section's "one open at a time" rule exists to prevent, arriving through
     the picture instead of through the speaker. So `anyOpen` drops the in-view
     route for the length of a playback session.

     `hovering` IS DELIBERATELY NOT GATED ON IT. On a pointer device a preview
     beside an open player is a pointer sitting on another card — a deliberate
     act, aimed at one card, and the behaviour that was there before any of
     this. Nothing about the hover route changes. */
  const preview = !open && (hovering || (inView && !anyOpen));

  return (
    <figure className={CARD}>
      <div ref={frameRef} className={MEDIA}>
        {reel && (
            <button
              type="button"
              onClick={onOpen}
              onPointerEnter={(e) => {
                if (!wantsHoverPreview(e.pointerType)) return;
                setReady(false);
                setHovering(true);
              }}
              onPointerLeave={() => setHovering(false)}
              /* The label says what OPENING it does. The quote and the
                 attribution are in the figure below, so a screen reader has them
                 either way; what it cannot get from a poster is that this
                 control plays an ad rather than a person talking. */
              aria-label={`Play the ad this reaction was about — ${item.label}`}
              className="absolute inset-0 cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a remote
                  blob URL already at the size it renders. next/image would mean
                  a remotePatterns entry and a proxy hop to re-encode a 24KB webp
                  into itself; the only thing wanted here is the browser's own
                  lazy loading, which a plain <img> gives directly. */}
              <img
                src={reel.poster ?? undefined}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />

              {/* THE PREVIEW SITS OVER THE POSTER, NOT INSTEAD OF IT, and that
                  is the whole trick: the poster stays mounted underneath, so
                  the frame never blinks to empty while the clip loads and never
                  blinks back when it unmounts. The clip fades in as it starts
                  playing, so a slow connection degrades to "the poster stayed"
                  rather than to a black rectangle.

                  THE TILE CUT, NOT THE HQ ONE — small, silent, and already what
                  both walls play. A hover is not a request for audio. */}
              {preview && (
                <LazyVideo
                  src={reel.src}
                  poster={reel.poster}
                  /* IMMEDIATE, AND THIS IS THE ONE PLACE THAT IS RIGHT. The
                     element only exists because a pointer is already on the
                     card, so both of LazyVideo's gates are answers to a
                     question nobody asked: an intersection test on a tile the
                     visitor is looking at, then a dwell and a place in the
                     start queue, would answer a hover a third of a second
                     late. `immediate` attaches and plays on mount and
                     registers no lane — which is also why the lane below is
                     inert and named only to satisfy the prop. */
                  immediate
                  preload="auto"
                  lane="testimonial-preview"
                  onPlaying={() => setReady(true)}
                  /* The hairline is driven from here rather than from a
                     requestAnimationFrame loop: timeupdate is the event the
                     browser already fires for this, roughly four times a
                     second, which is smooth enough for a bar 2px tall and
                     costs nothing when the tab is in the background. */
                  onTimeUpdate={(e) => {
                    const el = bar.current;
                    const { currentTime, duration } = e.currentTarget;
                    if (!el || !Number.isFinite(duration) || duration <= 0) return;
                    el.style.transform = `scaleX(${currentTime / duration})`;
                  }}
                  className={`absolute inset-0 size-full object-cover transition-opacity duration-[320ms] ${
                    ready ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}

              {/* THE PROGRESS HAIRLINE — the second half of what replaces the
                  play button. Removing the disc removes the only thing on a
                  resting card that said "this is video"; once the picture moves
                  that is self-evident, but a clip on loop with no marks on it
                  still gives no sense of LENGTH, and a viewer who cannot see
                  how much is left reads a loop as a stutter. Two pixels of the
                  page's own ramp fixes that and asks for nothing.

                  scaleX from the left, so the only thing changing per frame is
                  a transform on a composited layer — a width would lay out the
                  frame four times a second. */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[image:var(--grad)] transition-opacity duration-[280ms] ${
                  ready ? "opacity-100" : "opacity-0"
                }`}
                ref={bar}
                /* Starts at zero width, not full: the first timeupdate is a
                   fraction of a second away, and a bar that begins full and
                   snaps back reads as the clip having restarted. */
                style={{ transform: "scaleX(0)" }}
              />
            </button>
        )}
      </div>

      {/* THE TEXT BLOCK, ON PAPER. px-2 rather than 0: the card's own 12px of
          padding is right for a picture, which wants to sit near its edge, and
          too tight for type, which wants a margin. 20 over the frame, so the
          quote belongs to the card rather than to the video. */}
      {/* No horizontal inset: with the card's padding gone, the caption's left
          edge IS the frame's left edge, and any px here would set the type in
          from the picture it belongs to. pt-5 is the only gap left in the
          card, and it is the one that does the grouping. */}
      <figcaption
        className="@container flex min-w-0 flex-1 flex-col justify-between gap-2 pl-1.5 tab:block tab:pl-0 tab:pt-5"
      >
        <blockquote
          className={`${QUOTE_CLAMP} text-pretty font-sans ${QUOTE_SIZE} tracking-[-0.01em]`}
        >
          &ldquo;{item.quote}&rdquo;
        </blockquote>

        {/* A short gradient rule instead of an avatar: it marks where the quote
            ends and the attribution begins without pretending to identify
            anyone. These clients asked to stay unnamed. --grad-ink, not --grad:
            this rule is back on paper, where the bright cut drops to ~2.4:1. */}
        <p
          className={`mt-2 flex items-center gap-[0.65em] leading-[1.3] max-tab:w-fit max-tab:flex-col max-tab:items-stretch max-tab:gap-[5px] max-tab:before:w-1/2 max-tab:before:h-px max-tab:before:rounded-none tab:mt-3 tab:leading-normal font-sans ${TEXT_META} uppercase tracking-[0.04em] tab:tracking-[0.09em] text-ink-faint before:h-0.5 before:w-5 before:flex-none before:rounded-sm before:bg-[image:var(--grad-ink)] before:content-['']`}
        >
          {/* Phone: the role alone — the context after " · " is dropped — in
              a smaller size, never clamped. From `tab:` the full line at the
              same 11px, clamped as before. */}
          <span className="min-w-0 break-words text-[0.5rem] tab:hidden">{item.who.split(" · ")[0]}</span>
          <span className={`hidden min-w-0 break-words text-[0.6875rem] ${WHO_CLAMP} tab:[display:-webkit-box]`}>{item.who}</span>
        </p>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  /* The open card's index, or null. Held here rather than in Card because only
     one may play at a time — see the note at the top. */
  const [open, setOpen] = useState<number | null>(null);
  const openReel = open !== null ? reelById(testimonials.items[open].reel) : undefined;
  /* Stable, because Lightbox re-binds its keydown and scroll lock on it. */
  const closeLightbox = useCallback(() => setOpen(null), []);

  /* PHONE ONLY: ONE QUOTE SIZE FOR EVERY CARD, as large as the tightest card
     allows. Each phone card is a fixed 212px with its caption spanning the
     frame (quote at the top, role at the bottom); this finds the largest
     size between FIT_MIN and FIT_MAX at which EVERY quote + role still fits,
     by binary search on one custom property, and re-runs when the row
     resizes and once the webfont lands. From `tab:` the property is cleared
     and QUOTE_SIZE takes over. */
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const phone = window.matchMedia("(max-width: 760.98px)");
    const caps = () => [...root.querySelectorAll<HTMLElement>("figcaption")];
    const fit = () => {
      if (!phone.matches) {
        root.style.removeProperty("--quote-px");
        return;
      }
      const all = caps();
      const fits = (px: number) => {
        root.style.setProperty("--quote-px", `${px}px`);
        return all.every((c) => c.scrollHeight <= c.clientHeight);
      };
      let lo = FIT_MIN;
      let hi = FIT_MAX;
      if (!fits(lo)) return;
      while (hi - lo > 0.25) {
        const mid = (lo + hi) / 2;
        if (fits(mid)) lo = mid;
        else hi = mid;
      }
      root.style.setProperty("--quote-px", `${lo}px`);
    };
    fit();
    const ro = new ResizeObserver(fit);
    const row = root.querySelector("figure")?.parentElement?.parentElement;
    if (row) ro.observe(row);
    phone.addEventListener("change", fit);
    void document.fonts?.ready.then(fit);
    return () => {
      ro.disconnect();
      phone.removeEventListener("change", fit);
    };
  }, []);

  /* WHICH CARDS A TOUCH DEVICE IS LOOKING AT, AS A BITMASK — bit i is card i.
     Held here rather than in Card for a stronger reason than `open`: "am I
     inside the viewport's middle band" needs an observer, and the whole point
     of this section is that there is one observer rather than one per card.

     A MASK RATHER THAN A Set, BECAUSE IT IS A PRIMITIVE. React bails out of a
     re-render when state is set to a value `Object.is`-equal to the one it
     holds; a fresh Set every time the observer fires is never equal to the last
     one, so a callback that changed nothing would still re-render all three
     cards. This file already keeps the preview's progress bar off React for
     exactly that reason, and it would be odd to spend the savings back here.
     Three testimonials is three bits; the technique holds to 31. */
  const [inBand, setInBand] = useState(0);
  const frames = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    /* BOTH GUARDS RUN BEFORE ANYTHING IS OBSERVED, so on a laptop this effect
       costs one media-query read and then nothing at all for the life of the
       page — no observer, no callbacks, no state. */
    if (!window.matchMedia("(hover: none)").matches) return;
    if (reducedMotion()) return;

    const els = frames.current.filter((el): el is HTMLDivElement => el !== null);
    if (!els.length) return;

    /* THE MASK IS CARRIED ACROSS CALLBACKS, NOT REBUILT FROM ONE. An
       IntersectionObserver callback carries only the targets whose state
       CHANGED, so a card that entered the band two callbacks ago is absent from
       this one and rebuilding from `entries` alone would silently stop it. The
       Set this replaces existed for the same reason; a mask is that Set in the
       one form React can compare for free. */
    let mask = 0;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = els.indexOf(entry.target as HTMLDivElement);
          if (i < 0) continue;
          if (entry.isIntersecting) mask |= 1 << i;
          else mask &= ~(1 << i);
        }
        setInBand(mask);
      },
      { rootMargin: IN_VIEW_BAND }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* THE ROW'S OWN STATE, and the only thing the arrows have to know: whether
     there is anything left in either direction. Both start false so the markup
     the server sends has NEITHER arrow lit — the first measurement runs after
     mount, when there is a real scrollWidth to read, and turns the right one
     on. Guessing `end: true` here would flash an arrow onto a row that fits. */
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const readEdges = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    /* A pixel of slack at each end. Card widths are fractional — a calc off a
       vw clamp divided by four rarely lands on an integer — so scrollLeft stops
       a hair short of max, and an arrow left lit on a row that cannot move is
       worse than no arrow at all. */
    setEdges({ start: el.scrollLeft > 1, end: el.scrollLeft < max - 1 });
  }, []);

  useEffect(() => {
    readEdges();
    /* RESIZE ONLY. The row's own scrolling is handled by onScroll on the
       element, which fires just for this box; the page's scroll never changes
       these numbers, so nothing here listens to the window's. That matters on
       this page specifically — see the note in app/page.tsx about sections
       carrying their own scroll listeners. */
    window.addEventListener("resize", readEdges, { passive: true });
    return () => window.removeEventListener("resize", readEdges);
  }, [readEdges]);

  /* ONE PAGE IS AS MANY WHOLE CARDS AS THE ROW IS SHOWING, and both numbers are
     MEASURED rather than assumed: the step is the distance between two card
     origins — card plus gap, whatever the clamps resolved to — and the count is
     how many of those fit the row. So the two-and-four rule lives in exactly
     one place, the class names on ITEM, and this cannot drift away from it when
     that rule changes.

     Smooth unless the visitor asked for less motion, in which case the jump is
     instant. A snapped row lands on a card either way. */
  const page = useCallback((dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    const second = el.children[1] as HTMLElement | undefined;
    const step = first && second ? second.offsetLeft - first.offsetLeft : 0;
    if (!step) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const per = Math.max(1, Math.round((el.clientWidth - pad * 2) / step));
    el.scrollBy({
      left: dir * step * per,
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  }, []);

  return (
    /* SECTION OUTSIDE, WRAP INSIDE, like every other band. Without the ceiling
       these cards ran to the viewport, so on a wide monitor a one-line quote was
       set across ~600px while the hero's own copy above it was capped at 42ch —
       the quotes read as a different page rather than as a section of this one. */
    <section ref={sectionRef} className={SECTION} aria-label={testimonials.kicker}>
      <div className={WRAP}>
        {/* 832px is 13 × the 64px the title reaches on a desktop — the same
            13-title-em measure SectionHeading gives its other four. It is in px
            rather than em because it sits on this DIV, where an em would resolve
            against the body size and not against the title. */}
        <div className={`${HEAD_GAP} mx-auto max-w-[832px] text-center`}>
          {/* Roboto, not the mono the other kickers use — "rest use roboto"
              covers this. The rule stays in em so it tracks the type. */}
          <Reveal>
            <span
              className={`inline-flex items-center gap-[0.62em] font-sans ${SIZE_16} font-medium uppercase tracking-[0.22em] text-pink-deep before:h-px before:w-[2.2em] before:bg-current before:opacity-55 before:content-['']`}
            >
              {testimonials.kicker}
            </span>
          </Reveal>
          {/* mt-3 is inert on a non-replaced inline element and this h2 is one —
              kept because SectionHeading carries it and this is otherwise its
              markup. The gap under the kicker is line-box height, not margin. */}
          <RevealText
            as="h2"
            text={testimonials.heading}
            className={`mt-3 text-balance font-display ${SIZE_H2} font-bold leading-[1.1] tracking-[-0.022em]`}
          />
        </div>
      </div>

      {/* FULL BLEED, like the Work wall: the row sits outside the WRAP, so it
          runs edge to edge across the viewport, flush at both sides. */}
      {/* RELATIVE ON THE OUTSIDE, NOT ON THE SCROLLER. The arrows have to
            stand still while the row moves under them, and a child of a
            scrollport is positioned against the scrolled content — it would
            slide away with the cards it is meant to move. */}
        <div className="relative">
          <div
            ref={track}
            onScroll={readEdges}
            /* FOCUSABLE, because a scrollport that only a pointer can move is
               unreachable from a keyboard. With a tabindex it takes arrow keys
               natively, and the name says what it holds — the arrows below are
               a second route to the same thing, not the only one. */
            tabIndex={0}
            role="group"
            aria-label={`${testimonials.kicker} — scroll for more`}
            className={TRACK}
          >
            {testimonials.items.map((t, i) => (
              /* h-full so a card whose quote runs to three lines does not leave
                 its neighbours short — the frames stay on one baseline and the
                 text blocks take the difference.

                 THE STAGGER STOPS AT THE FOURTH CARD. Off the side of the row
                 the delay is no longer a stagger, just a wait: at i * 70 the
                 eighth card would sit blank for half a second after the scroll
                 that brought it in, and it has no visible neighbour to be
                 staggered against. */
              <Reveal key={t.quote} delay={Math.min(i, 3) * 70} className={ITEM}>
                <Card
                  item={t}
                  reel={reelById(t.reel)}
                  open={open === i}
                  anyOpen={open !== null}
                  onOpen={() => setOpen(i)}
                  inView={(inBand & (1 << i)) !== 0}
                  frameRef={(node) => {
                    frames.current[i] = node;
                  }}
                />
              </Reveal>
            ))}
          </div>

          <button
            type="button"
            onClick={() => page(-1)}
            aria-label="Previous testimonials"
            disabled={!edges.start}
            className={`${ARROW} left-3 ${
              edges.start ? "opacity-100" : "opacity-0"
            }`}
          >
            <svg viewBox="0 0 8 12" width="8" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M6.5 1L1.5 6l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => page(1)}
            aria-label="More testimonials"
            disabled={!edges.end}
            className={`${ARROW} right-3 ${
              edges.end ? "opacity-100" : "opacity-0"
            }`}
          >
            <svg viewBox="0 0 8 12" width="8" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M1.5 1l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

      {open !== null && openReel && <Lightbox reel={openReel} onClose={closeLightbox} />}
    </section>
  );
}
