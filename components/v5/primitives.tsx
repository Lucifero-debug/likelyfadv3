import type { ReactNode } from "react";
import { contactUrl } from "@/lib/site";

/* THE /v5 PAGE'S SHARED PIECES — the Carbon pass.

   Built from Carbon's tokens rather than picked by eye: the 2x Grid (16 / 8 / 4
   columns, 32px gutter), the 01–13 spacing scale, the productive and
   expressive type sets, the layer stack (cds-* in globals.css) and square
   corners everywhere. The fonts are the site's own, standing in for IBM Plex:
   Montserrat for the expressive headings, Roboto for productive UI text,
   JetBrains Mono where Carbon would reach for Plex Mono (IDs, labels, counts). */

/** The 2x Grid. 4 columns on sm, 8 from md, 16 from lg; 32px gutter;
    16px outer margin on sm, 32px (margin + half gutter) from lg. */
export const GRID =
  "mx-auto grid w-full max-w-[1584px] grid-cols-4 gap-x-8 px-4 cds-md:grid-cols-8 cds-lg:grid-cols-16 cds-lg:px-8";

/** spacing-12 / spacing-13 between page sections. */
export const SECTION = "py-24 cds-lg:py-40";

/* THE TYPE SETS. Productive for UI (tight leading, it is scanned), expressive
   for the few moments that are read. The expressive sizes are fluid, as
   Carbon's fluid-heading and fluid-display tokens are. */
export const T = {
  /* expressive */
  display:
    "font-display font-medium text-balance text-[clamp(2.625rem,1.2rem+4.4vw,5.25rem)] leading-[1.1] tracking-[-0.03em]",
  fluidH5:
    "font-display font-medium text-balance text-[clamp(2rem,1.5rem+1.6vw,3rem)] leading-[1.16] tracking-[-0.025em]",
  fluidH4:
    "font-display font-medium text-balance text-[clamp(1.75rem,1.45rem+0.9vw,2.25rem)] leading-[1.25] tracking-[-0.02em]",
  paragraph: "font-sans text-[clamp(1rem,0.92rem+0.35vw,1.25rem)] leading-[1.5] tracking-[0]",
  /* productive */
  heading04: "font-display font-medium text-[1.75rem] leading-[2.25rem] tracking-[-0.015em]",
  heading03: "font-display font-medium text-[1.25rem] leading-[1.75rem] tracking-[-0.01em]",
  heading02: "font-sans font-bold text-base leading-6",
  headingCompact01: "font-sans font-bold text-sm leading-[1.125rem] tracking-[0.16px]",
  body02: "font-sans text-base leading-6",
  bodyCompact02: "font-sans text-base leading-[1.375rem]",
  body01: "font-sans text-sm leading-5 tracking-[0.16px]",
  bodyCompact01: "font-sans text-sm leading-[1.125rem] tracking-[0.16px]",
  label01: "font-sans text-xs leading-4 tracking-[0.32px]",
  code01: "font-mono text-xs leading-4 tracking-[0.32px]",
  code02: "font-mono text-sm leading-5 tracking-[0.32px]",
} as const;

/** The content file's *starred* phrase. Carbon has one accent and it means
    "interactive", so emphasis is tonal: the phrase steps down to
    text-secondary, the two-tone headline IBM's own pages use. */
export function TwoTone({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, i) =>
        part.startsWith("*") ? (
          <span key={i} className="text-cds-text-secondary">
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
   ICONS — drawn on Carbon's 32-unit grid with a 2-unit stroke, so they sit at
   Carbon's icon weight at 16, 20 and 32px. Inlined; no icon font loads.
   ------------------------------------------------------------------------- */

const STROKE = {
  arrowRight: "M18 6l10 10-10 10M28 16H4",
  launch: "M26 18v8H6V6h8M20 4h8v8M28 4L15 17",
  checkmark: "M6 16.5l7 7L26 10",
  chevronDown: "M8 12l8 8 8-8",
  menu: "M4 8h24M4 16h24M4 24h24",
  close: "M8 8l16 16M24 8L8 24",
  chat: "M4 5h24v17H13l-6 5v-5H4z",
  view: "M2 16s5-9 14-9 14 9 14 9-5 9-14 9S2 16 2 16zM16 20a4 4 0 100-8 4 4 0 000 8z",
  time: "M16 29a13 13 0 100-26 13 13 0 000 26zM16 8v8l5 4",
  flash: "M18 3L7 18h8l-2 11 12-16h-8z",
  trendDown: "M3 9l9 9 5-5 11 11M28 16v8h-8",
  grid: "M4 4h10v10H4zM18 4h10v10H18zM4 18h10v10H4zM18 18h10v10H18z",
  fit: "M3 6h26v20H3zM7 10v5M7 10h5M25 22v-5M25 22h-5",
  quotes: "M6 22v-6a7 7 0 017-7M19 22v-6a7 7 0 017-7M6 16h6v6H6zM19 16h6v6h-6z",
} as const;

const FILL = {
  play: "M10 6v20l17-10z",
} as const;

export type IconName = keyof typeof STROKE | keyof typeof FILL;

export function Icon({ name, size = 16, className = "" }: { name: IconName; size?: number; className?: string }) {
  const filled = name in FILL;
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={size >= 32 ? 1.5 : 2}
      strokeLinecap="square"
      className={`shrink-0 ${className}`}
    >
      <path d={filled ? FILL[name as keyof typeof FILL] : STROKE[name as keyof typeof STROKE]} />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   BUTTONS. Carbon's kinds and sizes. Square. The label sits LEFT and the icon
   hangs at the right edge with 64px of reserved padding (15 / 63 in Carbon's
   own spec), so a set of buttons reads as a column of left-aligned labels.
   The xl size puts the label at the top-left, as a full-bleed modal or panel
   footer does. Hover and active are token swaps on fast-01 (70ms).
   ------------------------------------------------------------------------- */

const KIND = {
  primary:
    "bg-cds-btn-primary text-cds-text-on-color hover:bg-cds-btn-primary-hover active:bg-cds-btn-primary-active",
  secondary:
    "bg-cds-btn-secondary text-cds-text-on-color hover:bg-cds-btn-secondary-hover active:bg-cds-btn-secondary-active",
  tertiary:
    "border border-cds-btn-tertiary text-cds-btn-tertiary hover:bg-cds-btn-tertiary-hover hover:text-cds-text-inverse active:bg-cds-btn-tertiary-active active:text-cds-text-inverse",
  ghost: "text-cds-link hover:bg-cds-background-hover hover:text-cds-link-hover",
} as const;

const SIZE = {
  md: `h-10 ${T.bodyCompact01} items-center`,
  lg: `h-12 ${T.bodyCompact01} items-center`,
  xl: `h-16 ${T.bodyCompact01} items-start pt-[14px]`,
} as const;

type ButtonProps = {
  children: ReactNode;
  kind?: keyof typeof KIND;
  size?: keyof typeof SIZE;
  icon?: IconName;
  className?: string;
  ariaLabel?: string;
} & ({ contact: true; href?: never; external?: never } | { contact?: false; href: string; external?: boolean });

export function Button({
  children,
  kind = "primary",
  size = "lg",
  icon,
  className = "",
  contact,
  href,
  external,
  ariaLabel,
}: ButtonProps) {
  const newTab = contact || external;
  const ghost = kind === "ghost";
  return (
    <a
      href={contact ? contactUrl() : href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel ?? (contact ? "Send us a DM on X" : undefined)}
      className={`cds-btn relative inline-flex max-w-full shrink-0 justify-between whitespace-nowrap transition-[background-color,border-color,color] duration-[var(--cds-fast-01)] ease-[var(--cds-standard-productive)] ${
        ghost ? "gap-2 px-4" : "pl-4 pr-16"
      } ${KIND[kind]} ${SIZE[size]} ${className}`}
    >
      {children}
      {icon && (
        <Icon
          name={icon}
          size={16}
          className={ghost ? "self-center" : `absolute right-4 ${size === "xl" ? "top-4" : "top-1/2 -translate-y-1/2"}`}
        />
      )}
    </a>
  );
}

/* ---------------------------------------------------------------------------
   SMALL PARTS.
   ------------------------------------------------------------------------- */

/** Carbon's gray tag: 24px, pill-shaped (tags are the one rounded thing). */
export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full bg-cds-tag px-2 text-cds-tag-text ${T.label01} ${className}`}
    >
      {children}
    </span>
  );
}

/** The eyebrow over a section, as ibm.com sets it: body-compact-01 in
    text-secondary, sentence case. Not mono, not numbered. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-cds-text-secondary ${T.bodyCompact01} ${className}`}>{children}</p>;
}

/** The left-rail header every band opens with: occupies lg columns 1–4, the
    band's content takes 5–16. On md and down it stacks above. */
export function SectionHead({
  kicker,
  heading,
  lead,
  id,
  children,
  className = "",
}: {
  kicker: string;
  heading: string;
  lead?: string;
  id: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`col-span-4 cds-md:col-span-8 cds-lg:col-span-4 ${className}`}>
      <Eyebrow>{kicker}</Eyebrow>
      <h2 id={id} className={`mt-4 text-cds-text-primary ${T.fluidH5}`}>
        <TwoTone text={heading} />
      </h2>
      {lead && <p className={`mt-6 max-w-[48ch] text-pretty text-cds-text-secondary ${T.body02}`}>{lead}</p>}
      {children}
    </div>
  );
}
