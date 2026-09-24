import type { ReactNode } from "react";
import { contactUrl } from "@/lib/site";

/* THE /v4 PAGE'S SHARED PIECES — the Material 3 pass.

   Everything here is built from M3's tokens rather than picked by eye:
   colour ROLES (m3-* in globals.css), the type scale, the shape scale
   (4 / 8 / 12 / 16 / 28 / 48 / full), state layers and the ripple. The fonts
   are the site's own: Montserrat plays M3's "brand" face (display, headline),
   Roboto its "plain" face (title, body, label) — which is what Roboto is in
   Material anyway. */

/** Page measure. M3 margins: 16 compact, 24 medium, 24+ expanded. */
export const V4_WRAP = "mx-auto w-full max-w-[1280px] px-4 medium:px-6 expanded:px-8 large:px-10";

/** Vertical rhythm between bands. */
export const V4_SECTION = "py-[clamp(64px,5rem+3vw,128px)]";

/* THE TYPE SCALE. M3's roles, set fluid at the display end because a
   landing page's display type has to carry further than an app's.
   Display/headline in the brand face, everything else in the plain face. */
export const T = {
  displayL:
    "font-display font-extrabold text-balance text-[clamp(2.75rem,1.4rem+5.2vw,5.75rem)] leading-[1.02] tracking-[-0.035em]",
  displayM:
    "font-display font-extrabold text-balance text-[clamp(2.25rem,1.4rem+3.2vw,3.75rem)] leading-[1.06] tracking-[-0.03em]",
  displayS:
    "font-display font-bold text-[clamp(2rem,1.6rem+1.4vw,2.75rem)] leading-[1.1] tracking-[-0.025em]",
  headlineM: "font-display font-bold text-[1.75rem] leading-[2.25rem] tracking-[-0.015em]",
  headlineS: "font-display font-bold text-[1.5rem] leading-[2rem] tracking-[-0.01em]",
  titleL: "font-sans font-medium text-[1.375rem] leading-[1.75rem] tracking-[0]",
  titleM: "font-sans font-medium text-base leading-6 tracking-[0.009em]",
  bodyL: "font-sans text-base leading-6 tracking-[0.03em]",
  bodyLFluid: "font-sans text-[clamp(1rem,0.95rem+0.3vw,1.1875rem)] leading-[1.55] tracking-[0.01em]",
  bodyM: "font-sans text-sm leading-5 tracking-[0.016em]",
  labelL: "font-sans font-medium text-sm leading-5 tracking-[0.007em]",
  labelM: "font-sans font-medium text-xs leading-4 tracking-[0.03em]",
} as const;

/** Renders the content file's *starred* phrase in the primary colour role.
    A solid role, not the brand gradient: M3 colour is a scheme of roles, and
    gradient-filled type on every heading is the page performing rather than
    the scheme doing the hierarchy. */
export function Highlight({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, i) =>
        part.startsWith("*") ? (
          <span key={i} className="text-m3-primary">
            {part.slice(1, -1)}
          </span>
        ) : (
          part.split("\n").map((line, j) => (
            <span key={`${i}-${j}`}>
              {j > 0 && <br />}
              {line}
            </span>
          ))
        )
      )}
    </>
  );
}

/* ---------------------------------------------------------------------------
   ICONS — Material Symbols glyphs (24dp grid), inlined so no icon font loads.
   ------------------------------------------------------------------------- */

const PATHS = {
  arrow: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
  chat: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z",
  check: "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  bolt: "M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z",
  eye: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  trendDown: "M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z",
  grid: "M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z",
  ratio: "M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z",
  play: "M8 5v14l11-7z",
  menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
  close: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  expand: "M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z",
  left: "M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z",
  right: "M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  external: "M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z",
  schedule: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  quote: "M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z",
  sparkle: "M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d={PATHS[name]} />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   BUTTONS. M3's five emphasis levels, of which this page uses four, in the
   Expressive S and M sizes. Every one carries a state layer and a ripple, and
   morphs its corners on press (.m3-btn in globals.css).
   ------------------------------------------------------------------------- */

const BTN_VARIANT = {
  filled: "bg-m3-primary text-m3-on-primary",
  tonal: "bg-m3-secondary-container text-m3-on-secondary-container",
  outlined: "border border-m3-outline-variant text-m3-on-surface-variant",
  text: "text-m3-primary",
} as const;

const BTN_SIZE = {
  s: `h-10 gap-2 px-4 ${T.labelL} [--m3-btn-r:20px] [--m3-btn-r-pressed:8px]`,
  m: `h-14 gap-2 px-6 ${T.titleM} [--m3-btn-r:28px] [--m3-btn-r-pressed:12px]`,
} as const;

type ButtonProps = {
  children: ReactNode;
  variant?: keyof typeof BTN_VARIANT;
  size?: keyof typeof BTN_SIZE;
  icon?: IconName;
  trailingIcon?: IconName;
  className?: string;
  ariaLabel?: string;
} & ({ contact: true; href?: never; external?: never } | { contact?: false; href: string; external?: boolean });

export function Button({
  children,
  variant = "filled",
  size = "s",
  icon,
  trailingIcon,
  className = "",
  contact,
  href,
  external,
  ariaLabel,
}: ButtonProps) {
  const newTab = contact || external;
  return (
    <a
      href={contact ? contactUrl() : href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel ?? (contact ? "Send us a DM on X" : undefined)}
      className={`m3-state m3-ripple m3-btn inline-flex shrink-0 items-center justify-center whitespace-nowrap ${BTN_VARIANT[variant]} ${BTN_SIZE[size]} ${className}`}
    >
      {icon && <Icon name={icon} size={size === "m" ? 24 : 18} />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={size === "m" ? 24 : 18} />}
    </a>
  );
}

/** A standard icon button — 48dp target, 24dp glyph, round. */
export const ICON_BTN =
  "m3-state m3-ripple grid size-12 shrink-0 place-items-center rounded-full transition-colors duration-200 disabled:pointer-events-none disabled:opacity-[0.38]";

/* ---------------------------------------------------------------------------
   CHIPS, and the section header built on one.
   ------------------------------------------------------------------------- */

/** An assist-chip-shaped label (not interactive): 32dp, 8dp corners. */
export function Chip({ children, icon, className = "" }: { children: ReactNode; icon?: IconName; className?: string }) {
  return (
    <span
      className={`inline-flex h-8 items-center gap-2 rounded-lg px-3 ${T.labelL} ${
        icon ? "pl-2" : ""
      } ${className}`}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </span>
  );
}

export function SectionHeader({
  kicker,
  heading,
  lead,
  id,
  center = false,
  className = "",
}: {
  kicker: string;
  heading: string;
  lead?: string;
  id: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={`${center ? "mx-auto flex max-w-[780px] flex-col items-center text-center" : "max-w-[720px]"} ${className}`}>
      <p className={`text-m3-primary ${T.titleM}`}>{kicker}</p>
      <h2 id={id} className={`mt-3 text-m3-on-surface ${T.displayM}`}>
        <Highlight text={heading} />
      </h2>
      {lead && <p className={`mt-5 max-w-[56ch] text-pretty text-m3-on-surface-variant ${T.bodyLFluid}`}>{lead}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   EXPRESSIVE SHAPES. The cookie is a 9-lobed circle from M3's shape library,
   generated once at module scope (deterministic, so server and client agree)
   and exposed as a CSS variable for .m3-shape-cookie.
   ------------------------------------------------------------------------- */

function cookie(lobes: number, depth: number, steps = 144) {
  const pts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = 0.5 - depth + depth * Math.cos(lobes * t);
    pts.push(`${(50 + 100 * r * Math.cos(t)).toFixed(2)}% ${(50 + 100 * r * Math.sin(t)).toFixed(2)}%`);
  }
  return `polygon(${pts.join(",")})`;
}

export const COOKIE_9 = cookie(9, 0.035);
export const SUNNY_12 = cookie(12, 0.025);
