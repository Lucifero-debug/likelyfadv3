"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { reelVideos, type Reel } from "@/lib/reels.generated";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import {
  HEAD_GAP,
  SECTION,
  SIZE_16,
  SIZE_24,
  SIZE_64,
  TEXT_META,
  TEXT_SMALL,
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
        pointer device that is hover. On a touch device there is no hover, and
        the usual answer — put the button back for phones — gives the smallest
        screen the clumsiest version. So on a touch device the card plays when
        it REACHES THE MIDDLE OF THE VIEWPORT, one at a time, the way a feed
        behaves: scrolling IS the gesture. Both routes end in the same place,
        a silent clip with a cue offering sound, and neither needs a control.

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
   is on camera — so the caption above every quote says the frame is THE AD THE
   REACTION WAS ABOUT. It is not decoration: without it this section invents
   three video testimonials that do not exist. Moving the quote onto paper is
   what let this stop being a pill floating on the video and become an ordinary
   line of type, which is a better place for it.

   NO BRAND LOGOS, which the reference puts on every card. There are none, for
   the same reason there are no names.

   MEDIA ELEMENTS ARE CREATED, NEVER PARKED. A card at rest is a poster and
   nothing else: the preview clip mounts when the card is pointed at or scrolled
   into the middle band, and dies the moment it is not; the full player mounts on
   click and dies when another card takes over. The in-view route deliberately
   picks ONE card rather than every card in frame, which is what keeps this true
   on a phone where all three can be near the viewport at once. So the section
   holds at most ONE <video> at any moment. That is not fussiness — the
   page already mounts 128 of them between the hero wall and the work wall,
   which is past the number of media players a browser keeps alive at once, and
   three permanent ones here would come out of that budget to show a frame the
   poster already shows.

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

   IT BLEEDS THE GUTTER AND PUTS IT STRAIGHT BACK AS PADDING. The negative
   margin lets the overflow run to the edge of the wrap instead of being clipped
   at the text column; the matching padding keeps the FIRST card starting at the
   same x as every other container on this page, so the alignment rule in lib/ui
   survives intact. `scroll-px` states it a third time, so a snapped card lands
   on that x too rather than flush against the bleed.

   THERE IS NO VERTICAL PADDING ON THE ROW, and there was: overflow on one axis
   forces a scrollport on both, so the card's hover lift and its shadow had to
   be paid for with py-3 and given back with -my-3. The card has neither now,
   nothing crosses the row's top or bottom edge, and the pair came out together
   rather than being left behind as a padding that cancels itself.

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
  "-mx-[clamp(24px,5vw,64px)] px-[clamp(24px,5vw,64px)] scroll-px-[clamp(24px,5vw,64px)] " +
  "flex snap-x snap-mandatory gap-[var(--track-gap)] overflow-x-auto overscroll-x-contain " +
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep";

const ITEM =
  "min-w-0 flex-none snap-start basis-[calc((100%_-_var(--track-gap)_-_var(--peek))/2)] " +
  "lap:basis-[calc((100%_-_var(--track-gap)*3_-_var(--peek))/4)]";

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
   3 and 2 hold that order at every width, and the phone pays for them in
   truncation — which, in a 121px measure, is the trade this section can afford
   and the height was not.

   THE ATTRIBUTION IS CLAMPED HARDER THAN THE QUOTE, on purpose. It is the line
   that runs longest — "Marketing manager, supplements brand · after the second
   batch" — and the least load-bearing: the quote is the testimonial, the role
   is context for it. Cutting the quote to keep the role whole would be the
   wrong way round.

   IT IS A SPAN INSIDE THE FLEX ROW, NOT THE ROW ITSELF. line-clamp needs
   `display: -webkit-box` and the attribution is `display: flex` — it carries
   the gradient rule as a ::before, which only exists as a flex child. Clamping
   the <p> would delete the rule; clamping a span inside it keeps both. */
const QUOTE_CLAMP = "line-clamp-3";
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
const CARD = "flex h-full flex-col";

/* The frame. `isolate` keeps every overlay inside stacked against this box, so
   a card can never lift a control over its neighbour. */
const MEDIA =
  "relative isolate aspect-[9/16] w-full overflow-hidden rounded-2xl bg-poster";

/* THE SOUND CUE — what stands where the play disc used to.

   IT ONLY EXISTS WHILE THE CLIP IS RUNNING, which is the whole idea. A control
   on a still poster has to advertise playback; this one arrives after playback,
   so it can advertise the only thing still missing, and it says so in words
   rather than in a glyph nobody has to decode. Its wording changes with the
   route in: "Click" where a pointer started it, "Tap" where scrolling did.

   IT IS NOT A BUTTON, and that is deliberate rather than sloppy: the whole
   frame is the button, so a second target inside it would only create a place
   where the click means the same thing but the cursor implies otherwise.
   pointer-events-none keeps it out of the way entirely.

   Paper rather than glass, like the badge above it, so it holds ink type over
   any frame without needing backdrop-filter to be supported. */
const SOUND_CUE =
  "pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/92 py-1 pl-2 pr-2.5 " +
  `font-mono ${TEXT_META} uppercase leading-none tracking-[0.08em] text-ink backdrop-blur-[2px] ` +
  "transition-[opacity,transform] duration-[280ms] ease-[cubic-bezier(0.22,0.7,0.2,1)]";

/* The format badge, and the light counterpart to the reference's glass pill:
   near-solid paper rather than a tinted blur, so it holds ink type over any
   frame without needing backdrop-filter to be supported. */
const BADGE =
  `pointer-events-none absolute right-3 top-3 rounded-full bg-white/92 px-2.5 py-1 font-mono ${TEXT_META} uppercase leading-none tracking-[0.08em] text-ink backdrop-blur-[2px]`;

/* THE CONTROL BAR, LIGHT. Same idea as the reference's glass, in this page's
   palette: the fill carries the contrast and the blur is the finish, not the
   other way round. 92% paper rather than a 45% tint means it stays readable
   where backdrop-filter is unsupported or switched off — which is the failure
   mode a dark glass bar has no answer to, since 45% black over a bright frame
   is ink on grey. */
const BAR =
  "flex items-center gap-2.5 rounded-2xl border border-line bg-paper/92 px-2.5 py-2 text-ink backdrop-blur-md";

/* The seek bar. A real <input type="range"> rather than a div with pointer
   handlers, because the div version cannot be operated from a keyboard and this
   is a control, not a progress meter — arrow keys seek, and that comes free.
   Everything below is the appearance stripped back and rebuilt; the FILL is an
   inline gradient rather than a class, since it changes on every frame of
   playback and Tailwind cannot emit a class per percentage. */
const SEEK =
  "h-1 w-full cursor-pointer appearance-none rounded-full bg-transparent outline-none " +
  "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full " +
  "[&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-deep " +
  "[&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.35)] " +
  "[&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-line " +
  "[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 " +
  "[&::-moz-range-thumb]:bg-pink-deep " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pink-deep";

/* Control buttons in the bar. 32px is under the 44px touch guidance and
   deliberately so: they sit inside a bar that is itself the target on a phone,
   and a 44px play button in a 9:16 card at one-column width is a fifth of the
   frame's width. The bar's own padding brings the effective target back up. */
const CTRL =
  "grid size-8 flex-none place-items-center rounded-full text-ink transition-colors duration-200 " +
  "hover:bg-ink/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep";

/* mm:ss. NaN until metadata lands, which is a real state rather than an edge
   case — the bar renders before the file has said how long it is. */
function clock(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

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
   number to change if it feels early or late, and the two ends do different
   things: widen it and two cards qualify at once on a phone (only the first
   still plays, but the switch happens sooner than the eye expects), narrow it
   and a card has to be almost perfectly centred, which on a slow scroll means
   the section spends most of its time showing stills.

   ONLY ON A DEVICE WITH NO HOVER. On a laptop with a touchscreen both routes
   would be live, and a card would start playing as it scrolled past whether or
   not the pointer was anywhere near it. `(hover: none)` is the query that
   separates them: it describes the PRIMARY input, so a phone matches and a
   touch-capable laptop does not. */
const IN_VIEW_BAND = "-30% 0px -30% 0px";

/* ---------------------------------------------------------------------------
   THE PLAYER. Mounted only while its card is the open one, so every piece of
   state below is scoped to one playback session and none of it needs resetting.
   The <video> is created here too, which is why a card at rest costs nothing. */
function Player({ reel, label }: { reel: Reel; label: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const hide = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  /* True between pointerdown and pointerup on the seek bar. While it is set,
     timeupdate stops writing `at` — otherwise the thumb fights the playhead and
     jumps back under the finger on every frame. */
  const scrubbing = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [ended, setEnded] = useState(false);
  const [at, setAt] = useState(0);
  const [length, setLength] = useState(NaN);
  /* Controls are visible whenever the video is not playing, and auto-hide two
     seconds after the last pointer while it is. Kept as state rather than a
     class toggle because the Watch Again screen reads it too. */
  const [showing, setShowing] = useState(true);

  /* AUTOPLAY WITH SOUND IS THE POINT — the card was clicked, so the gesture is
     there and the policy allows it. The fallback matters anyway: a browser with
     a stricter setting rejects the promise, and silently leaving a dead frame
     would look like a broken card. Muting and retrying gets the video running,
     and the mute control then says what happened. */
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    el.play().catch(() => {
      el.muted = true;
      setMuted(true);
      void el.play().catch(() => {});
    });
  }, []);

  useEffect(() => () => clearTimeout(hide.current), []);

  /* Show the bar, and say whether it should go away again.

     THE CALLER PASSES THE INTENT RATHER THAN THIS READING `playing`, and that
     is not a style choice. Every caller is an event handler that is itself
     about to change `playing` — onPlay fires before the state it sets has
     landed — so a version of this that read the state variable would arm the
     countdown against the value from BEFORE the event, and the bar would hang
     around for one whole transition after playback started. */
  const arm = useCallback((autoHide: boolean) => {
    setShowing(true);
    clearTimeout(hide.current);
    if (autoHide) hide.current = setTimeout(() => setShowing(false), 2200);
  }, []);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.ended) {
      el.currentTime = 0;
      setEnded(false);
    }
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
  };

  const pct = Number.isFinite(length) && length > 0 ? (at / length) * 100 : 0;

  return (
    <div
      className="absolute inset-0"
      onPointerMove={() => arm(playing && !ended)}
      onPointerLeave={() => playing && !ended && setShowing(false)}
    >
      <video
        ref={video}
        /* The HQ cut, with audio — the tile cut the walls and the hover preview
           play is silent and small. `?? src` covers a sync run without ffmpeg. */
        src={reel.hq ?? reel.src}
        poster={reel.poster ?? undefined}
        playsInline
        preload="auto"
        onClick={toggle}
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
          arm(true);
        }}
        onPause={() => {
          setPlaying(false);
          arm(false);
        }}
        onPlaying={() => setBuffering(false)}
        onWaiting={() => setBuffering(true)}
        onLoadedMetadata={(e) => setLength(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          if (!scrubbing.current) setAt(e.currentTarget.currentTime);
        }}
        onEnded={() => {
          setEnded(true);
          setPlaying(false);
          arm(false);
        }}
        /* object-contain, NOT cover. The frame is 9:16 and so is the footage, so
           there is nothing to crop — and `contain` is the setting that keeps it
           that way if a non-vertical clip is ever pointed at from content.ts:
           it letterboxes onto the poster ground instead of silently cutting the
           sides off. */
        className="size-full cursor-pointer object-contain"
      />

      {/* BUFFERING. Shown only while actually stalled AND still playing — a
          spinner over a paused video says the wrong thing entirely. */}
      {buffering && !ended && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-white/30 border-t-white"
        />
      )}

      {/* WATCH AGAIN. The reference's replay screen: the card goes back to
          something you can act on rather than holding a black last frame. A
          PAPER wash rather than the reference's black one — the same decision
          as the bar, and it keeps the ended state looking like part of this
          page rather than like a video player that has taken the card over. */}
      {ended && (
        <div className="absolute inset-0 grid place-items-center bg-paper/80 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={toggle}
            className={`flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 font-sans ${TEXT_SMALL} font-medium text-ink shadow-[var(--shadow-sm)] transition-transform duration-200 hover:scale-105`}
          >
            <svg
              viewBox="0 0 12 12"
              width="12"
              height="12"
              fill="currentColor"
              aria-hidden="true"
              className="text-pink-deep"
            >
              <path d="M6 1.5V0L3.5 2 6 4V2.5a3.5 3.5 0 1 1-3.5 3.5H1a5 5 0 1 0 5-4.5z" />
            </svg>
            Watch again
          </button>
        </div>
      )}

      {/* THE BAR. `pointer-events-none` travels with the opacity so a hidden bar
          cannot swallow a click meant for the video underneath it. */}
      <div
        className={`absolute inset-x-0 bottom-0 p-2.5 transition-opacity duration-[280ms] ${
          showing ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className={BAR}>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className={CTRL}
          >
            {playing ? (
              <svg viewBox="0 0 10 12" width="10" height="12" fill="currentColor" aria-hidden="true">
                <rect x="0" y="0" width="3.5" height="12" rx="1" />
                <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 10 12" width="10" height="12" fill="currentColor" aria-hidden="true">
                <path d="M0 0l10 6-10 6z" />
              </svg>
            )}
          </button>

          <input
            type="range"
            min={0}
            max={Number.isFinite(length) && length > 0 ? length : 0}
            step={0.01}
            value={at}
            aria-label="Seek"
            onPointerDown={() => (scrubbing.current = true)}
            onPointerUp={() => (scrubbing.current = false)}
            onChange={(e) => {
              const to = Number(e.currentTarget.value);
              setAt(to);
              if (video.current) video.current.currentTime = to;
            }}
            /* The fill is the value, so it cannot be a class — see SEEK. Both
               stops are tokens rather than literals, so the played portion is
               the page's pink and the rest is its hairline. */
            style={{
              background: `linear-gradient(to right, var(--color-pink-deep) ${pct}%, var(--color-line) ${pct}%)`,
            }}
            className={SEEK}
          />

          <span className={`flex-none font-mono ${TEXT_META} tabular-nums leading-none text-ink-soft`}>
            {clock(at)} / {clock(length)}
          </span>

          <button
            type="button"
            onClick={() => {
              const el = video.current;
              if (!el) return;
              el.muted = !el.muted;
              setMuted(el.muted);
            }}
            aria-label={muted ? `Unmute ${label}` : `Mute ${label}`}
            className={CTRL}
          >
            {muted ? (
              <svg viewBox="0 0 14 12" width="14" height="12" fill="currentColor" aria-hidden="true">
                <path d="M0 4h3l3-3v10L3 8H0z" />
                <path d="M9 4l4 4M13 4l-4 4" stroke="currentColor" strokeWidth="1.4" fill="none" />
              </svg>
            ) : (
              <svg viewBox="0 0 14 12" width="14" height="12" fill="currentColor" aria-hidden="true">
                <path d="M0 4h3l3-3v10L3 8H0z" />
                <path
                  d="M9 3.5a4 4 0 0 1 0 5M11 2a6.5 6.5 0 0 1 0 8"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  fill="none"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   ONE CARD. The frame is a button until it is opened, and the quote lives under
   it on paper. */
function Card({
  item,
  reel,
  open,
  onOpen,
  inView,
  frameRef,
}: {
  item: (typeof testimonials.items)[number];
  reel: Reel | undefined;
  open: boolean;
  onOpen: () => void;
  /** True when this is the card the section has chosen as centred — touch
      devices only, and never more than one card at a time. */
  inView: boolean;
  /** Registers this card's frame with the section's observer. */
  frameRef: (node: HTMLDivElement | null) => void;
}) {
  /* THE TWO ROUTES MEET HERE. `hovering` is this card's own business; `inView`
     is the section's, because choosing one card out of three is a decision no
     single card can make. Either one plays the clip and neither knows about the
     other, which is what keeps the two behaviours from having to agree on
     anything beyond "is it running".

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

  const preview = !open && (hovering || inView);

  return (
    <figure className={CARD}>
      <div ref={frameRef} className={MEDIA}>
        {reel && open ? (
          <Player reel={reel} label={item.label} />
        ) : (
          reel && (
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

              {/* THE SOUND CUE, IN PLACE OF THE PLAY BUTTON — see SOUND_CUE. It
                  waits for `ready` rather than for `preview`, so it appears with
                  the moving picture and not over a still poster that is about to
                  be replaced. */}
              <span
                className={`${SOUND_CUE} ${
                  ready ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                }`}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 14 12"
                  width="12"
                  height="11"
                  fill="currentColor"
                  className="text-pink-deep"
                >
                  <path d="M0 4h3l3-3v10L3 8H0z" />
                  <path
                    d="M9 3.5a4 4 0 0 1 0 5M11 2a6.5 6.5 0 0 1 0 8"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    fill="none"
                  />
                </svg>
                {hovering ? "Click for sound" : "Tap for sound"}
              </span>

              <span className={BADGE}>{item.label}</span>
            </button>
          )
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
      <figcaption className="pt-5">
        {/* THE LINE THAT KEEPS THIS HONEST — see the note at the top of the file
            before removing it. It comes BEFORE the quote because that is the
            order the eye takes them in: the frame above is the claim, so the
            correction has to arrive before the quote, not after it. */}
        {reel && (
          /* TRACKING COMES OFF ON A PHONE AND NOTHING ELSE DOES. This line is
             the one thing in the card that cannot be shortened or clamped —
             see the top of the file: without it the section invents three
             video testimonials that do not exist — so the only room left in it
             is between the letters. At 0.1em a 360px Android wraps it to THREE
             lines, which is a whole line of height spent on a caption; 0.04em
             holds it at two from 360 up and still reads as the page's mono
             caption. The full 0.1em returns from `tab:`, where the measure can
             carry it. */
          <p className={`font-mono ${TEXT_META} uppercase tracking-[0.04em] tab:tracking-[0.1em] text-ink-faint`}>
            The ad this reaction was about
          </p>
        )}

        <blockquote
          className={`${reel ? "mt-2" : ""} ${QUOTE_CLAMP} text-pretty font-sans ${SIZE_24} leading-[1.4] tracking-[-0.01em]`}
        >
          &ldquo;{item.quote}&rdquo;
        </blockquote>

        {/* A short gradient rule instead of an avatar: it marks where the quote
            ends and the attribution begins without pretending to identify
            anyone. These clients asked to stay unnamed. --grad-ink, not --grad:
            this rule is back on paper, where the bright cut drops to ~2.4:1. */}
        <p
          className={`mt-3 flex items-center gap-[0.65em] font-sans ${TEXT_META} uppercase tracking-[0.09em] text-ink-faint before:h-0.5 before:w-5 before:flex-none before:rounded-sm before:bg-[image:var(--grad-ink)] before:content-['']`}
        >
          <span className={`${WHO_CLAMP} min-w-0 break-words`}>{item.who}</span>
        </p>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  /* The open card's index, or null. Held here rather than in Card because only
     one may play at a time — see the note at the top. */
  const [open, setOpen] = useState<number | null>(null);

  /* The card a touch device is currently looking at, or null. Also held here,
     and for a stronger reason than `open`: "which of the three is centred" is
     not a question any one card can answer about itself. */
  const [centred, setCentred] = useState<number | null>(null);
  const frames = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    /* BOTH GUARDS RUN BEFORE ANYTHING IS OBSERVED, so on a laptop this effect
       costs one media-query read and then nothing at all for the life of the
       page — no observer, no callbacks, no state. */
    if (!window.matchMedia("(hover: none)").matches) return;
    if (reducedMotion()) return;

    const els = frames.current.filter((el): el is HTMLDivElement => el !== null);
    if (!els.length) return;

    /* Insertion order is card order, so the LOWEST index in here is the highest
       card on the page — which is the one to play when a slow scroll leaves two
       of them touching the band at once. Picking the most-intersecting instead
       would swap between them mid-scroll, and every swap is a media element
       torn down and rebuilt. */
    const inBand = new Set<number>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = els.indexOf(entry.target as HTMLDivElement);
          if (i < 0) continue;
          if (entry.isIntersecting) inBand.add(i);
          else inBand.delete(i);
        }
        setCentred(inBand.size ? Math.min(...inBand) : null);
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
    <section className={SECTION} aria-label={testimonials.kicker}>
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
            className={`mt-3 text-balance font-display ${SIZE_64} font-bold leading-[1.1] tracking-[-0.022em]`}
          />
        </div>

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
                  onOpen={() => setOpen(i)}
                  inView={centred === i}
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
            className={`${ARROW} -left-[calc((clamp(24px,5vw,64px)_+_32px)/2)] ${
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
            className={`${ARROW} -right-[calc((clamp(24px,5vw,64px)_+_32px)/2)] ${
              edges.end ? "opacity-100" : "opacity-0"
            }`}
          >
            <svg viewBox="0 0 8 12" width="8" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M1.5 1l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
