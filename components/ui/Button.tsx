import type { ReactNode } from "react";
import { contactUrl } from "@/lib/site";

type Variant = "grad" | "dark" | "ghost" | "light";
type Size = "default" | "compact";

/* Buttons hold still. Hover changes colour, border and shadow only — nothing
   moves, slides or wipes, so the CTA reads as a control rather than a toy.
   `active:opacity` is the press state, and the only one a touch device ever
   reaches. It runs faster than the rest: press feedback has to feel immediate.

   700, not 600: Roboto has no 600, so the browser resolves it up to 700 anyway.
*/
/* WIDTH ONLY — the border COLOUR belongs to the variant, and every variant must
   name one. `border-transparent` used to live here, and it silently beat the
   variants: Tailwind emits `.border-transparent` after `.border-ink` and
   `.border-line`, all three are single-class selectors of equal specificity, so
   the last one written to the stylesheet wins no matter what order the classes
   sit in on the element. The outlined variants were rendering with an invisible
   border because of it. One border-color utility per button, no exceptions. */
const BASE =
  "relative inline-flex min-h-[44px] items-center justify-center gap-2 overflow-hidden rounded-full " +
  "border font-sans font-bold tracking-[-0.01em] active:opacity-[0.88] " +
  "transition-[color,background-color,border-color,box-shadow] duration-[280ms] " +
  "ease-[cubic-bezier(0.22,0.7,0.2,1)]";

/* Padding and type size travel together in one table rather than being merged
   in from a className: two competing px-* utilities have equal specificity and
   Tailwind emits them in scale order, so the larger would win whatever order
   the caller wrote them in.

   `compact` is the nav CTA on a phone — next to the wordmark a full-size button
   is the loudest thing on the bar. It reverts at the tablet breakpoint, the
   same one where the nav links come back, so the bar changes shape exactly
   once.

   ALL THREE RAMPS ARE INERT AT 1920, where they resolve to the 24 / 16 / 0.96rem
   this table used to state flat. That is deliberate: a button is the one
   component that appears in five places at three sizes, so the safe shape for a
   change like this is one that moves nothing at the width the page was drawn
   at and only runs outward from it. Below 1920 they ease down to 18 / 12 /
   0.9rem at `lap:` and hold; above it they open to 32 / 22 / 1.05rem.

   WHY THEY RAMP AT ALL. Fixed px beside a vw-driven page is not "stable", it is
   a size that grows on screen every time someone zooms in — browser zoom scales
   CSS px and shrinks the CSS viewport, so at 175% a `py-4` CTA was rendering
   half again as large as drawn while the headline beside it had ramped down.
   The nav bar and this button were the two loudest instances of it.

   THE `tab:` STEP IS NOW CONTINUOUS, which is the other half of the fix. It
   used to jump straight from 16/12/0.875rem to 24/16/0.96rem the moment the
   viewport crossed 761 — a 50% padding step at one pixel of width. The ramps
   pick up at 18/12/0.9rem there instead, so the compact button grows into the
   default rather than snapping to it.

   `min-h-[44px]` IS ON `BASE` NOW, NOT JUST HERE, and it states the tap-target
   floor instead of leaving it to arithmetic. The height is DERIVED from the
   body leading and now from a clamp as well, so it has two ways to drift under
   44 silently; taking the page's leading to 1.2 once put the compact CTA at
   43px with nothing in this file touched. At the tightest point of these ramps
   — `lap:`, 12px of padding on 0.9rem of Roboto — the derived height is ~47px,
   so the floor is headroom rather than a crutch. */
const PAD_X = "px-[clamp(18px,12px+0.626vw,32px)]";
const PAD_Y = "py-[clamp(12px,8px+0.417vw,22px)]";
const SIZE_TEXT = "text-[clamp(0.9rem,0.84rem+0.1vw,1.05rem)]";

const SIZES: Record<Size, string> = {
  default: `${PAD_X} ${PAD_Y} ${SIZE_TEXT}`,
  compact:
    "px-4 py-3 text-[0.875rem] " +
    "tab:px-[clamp(18px,12px+0.626vw,32px)] tab:py-[clamp(12px,8px+0.417vw,22px)] " +
    "tab:text-[clamp(0.9rem,0.84rem+0.1vw,1.05rem)]",
};

const VARIANTS: Record<Variant, string> = {
  grad:
    "border-transparent bg-[image:var(--grad)] text-white " +
    "shadow-[0_12px_30px_-12px_rgba(236,72,153,0.6)] hover:shadow-[var(--shadow-pink)]",
  dark: "border-transparent bg-ink text-paper hover:shadow-[var(--shadow-pink)]",
  /* Full-strength ink rather than the hairline the `light` variant uses: this
     one sits beside the gradient CTA in the hero and needs enough weight to
     read as the second half of a pair. */
  ghost: "border-ink bg-transparent text-ink hover:border-pink hover:text-pink-deep",
  light:
    "border-line bg-white text-ink hover:border-pink hover:text-pink-deep " +
    "hover:shadow-[var(--shadow-sm)]",
};

type ButtonBase = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  withArrow?: boolean;
  ariaLabel?: string;
  /** Opens in a new tab, with the rel that has to go with it.

      IT EXISTS BECAUSE `target="_blank"` USED TO BE WELDED TO `contact`, and
      that was fine for exactly as long as the X profile was the only outbound
      link on the page. The work wall's Drive library is the second, and
      spelling its target inline at the call site would have meant spelling the
      rel there too — which is the half everyone forgets. A page opened with
      `_blank` and no `noopener` can reach back through `window.opener` and
      navigate the tab it came from, so the two belong together in one place
      rather than in one place and one caller.

      An in-page anchor or a same-site route should leave this alone: opening a
      new tab for a destination on this site takes the back button away from
      the visitor for nothing. */
  external?: boolean;
};

/* href used to default to "#" in v1, which meant a Button with no destination
   rendered a link that silently went nowhere. The union makes that
   unrepresentable: either it is the DM CTA, or it says where it goes. */
type ButtonProps = ButtonBase &
  (
    | { /** The DM CTA — opens the X profile in a new tab. */ contact: true; href?: never }
    | { contact?: false; /** Destination, or an in-page anchor (#id). */ href: string }
  );

export function Button({
  children,
  href,
  variant = "grad",
  size = "default",
  className = "",
  withArrow = false,
  contact = false,
  external = false,
  ariaLabel,
}: ButtonProps) {
  // The union guarantees href is present whenever contact is not set.
  const finalHref = contact ? contactUrl() : (href as string);
  /* The DM CTA is external by definition, so it never has to ask for the flag.
     Anything else says so for itself. */
  const newTab = contact || external;

  return (
    <a
      href={finalHref}
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel ?? (contact ? "Send us a DM on X" : undefined)}
    >
      <span>{children}</span>
      {withArrow && <span aria-hidden="true">→</span>}
    </a>
  );
}
