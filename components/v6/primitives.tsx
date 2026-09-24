import type { ReactNode } from "react";
import { contactUrl } from "@/lib/site";

/* THE /v6 PAGE'S SHARED PIECES — the Polaris pass.

   Polaris's layout model, as components: a Page (the measure), Cards (white,
   radius-300, bevelled) on a grey page, BlockStack/InlineStack gaps from the
   space scale, and AnnotatedSection — the settings-page pattern of a title and
   a line of description beside the card they describe.

   Type is the site's own pair standing in for Inter: Montserrat for headings,
   Roboto for everything else. The scale is Polaris's small one. The only step
   above heading-3xl is the page title, which is fluid because a landing page's
   title has to carry further than an admin page's. */

/** Page. Polaris's default page width is 998px; this runs a little wider
    because the work grid wants the room. */
export const PAGE = "mx-auto w-full max-w-[1100px] px-4 p-sm:px-6";

export const T = {
  pageTitle:
    "font-display font-bold text-balance text-[clamp(1.875rem,1.4rem+1.8vw,2.75rem)] leading-[1.18] tracking-[-0.02em]",
  heading2xl: "font-display font-bold text-[1.5rem] leading-8 tracking-[-0.015em]",
  headingXl: "font-display font-bold text-[1.25rem] leading-[1.75rem] tracking-[-0.01em]",
  headingLg: "font-display font-bold text-[1.0625rem] leading-6 tracking-[-0.005em]",
  headingMd: "font-sans font-bold text-sm leading-5",
  headingSm: "font-sans font-bold text-[0.8125rem] leading-5",
  bodyLg: "font-sans text-[0.9375rem] leading-6",
  bodyMd: "font-sans text-sm leading-5",
  bodySm: "font-sans text-xs leading-4",
} as const;

/** Polaris content rule: no terminal punctuation on headings. The content
    file's headings end in periods and carry *highlight* marks and hard
    breaks; this reads them as plain sentence-case titles. */
export function title(text: string) {
  return text.replace(/\*/g, "").replace(/\n/g, " ").replace(/\.$/, "");
}

/* ---------------------------------------------------------------------------
   ICONS — Polaris's 20px icon grid, drawn as 1.5 strokes with round joins.
   ------------------------------------------------------------------------- */

const PATHS = {
  arrowRight: "M4 10h12M11 5l5 5-5 5",
  external: "M11 4h5v5M16 4l-7 7M14 12v4H4V6h4",
  check: "M5 10.5l3.5 3.5L15 7",
  checkCircle: "M10 17.5a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM7 10.25l2 2 4-4.25",
  chevronDown: "M6 8l4 4 4-4",
  menu: "M3.5 5.5h13M3.5 10h13M3.5 14.5h13",
  close: "M5.5 5.5l9 9M14.5 5.5l-9 9",
  chat: "M4 4h12a1 1 0 011 1v8a1 1 0 01-1 1H9l-4 3v-3H4a1 1 0 01-1-1V5a1 1 0 011-1z",
  view: "M2.5 10S5 4.5 10 4.5 17.5 10 17.5 10 15 15.5 10 15.5 2.5 10 2.5 10zM10 12.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z",
  clock: "M10 17.5a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM10 6v4l2.5 2",
  cash: "M2.5 5.5h15v9h-15zM10 12a2 2 0 100-4 2 2 0 000 4zM5 8v4M15 8v4",
  grid: "M3.5 3.5h5v5h-5zM11.5 3.5h5v5h-5zM3.5 11.5h5v5h-5zM11.5 11.5h5v5h-5z",
  resize: "M3.5 4.5h13v11h-13zM6.5 7.5h3M6.5 7.5v3M13.5 12.5h-3M13.5 12.5v-3",
  home: "M3.5 9L10 3.5 16.5 9v7.5h-4.5v-4.5H8v4.5H3.5z",
  star: "M10 3l2.1 4.3 4.7.7-3.4 3.3.8 4.7L10 13.8 5.8 16l.8-4.7L3.2 8l4.7-.7z",
  play: "M7 5v10l8-5z",
  receipt: "M5 2.5h10v15l-2.5-1.5-2.5 1.5-2.5-1.5L5 17.5zM7.5 6.5h5M7.5 9.5h5M7.5 12.5h3",
  question: "M10 17.5a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM8 8a2 2 0 113 1.7c-.6.4-1 .8-1 1.5M10 13.5v.25",
  person: "M10 9.5a3 3 0 100-6 3 3 0 000 6zM4 16.5c.8-3 3.2-4.5 6-4.5s5.2 1.5 6 4.5",
  info: "M10 17.5a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM10 9v5M10 6.25v.25",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  const filled = name === "play";
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   BUTTONS. Primary is the near-black filled button with the bevel, and
   Polaris allows one per page region; secondary is white with the bevel;
   plain is a link-coloured text button. radius-200. 44px on touch, 36px
   where there is a pointer. Labels are verb + object, sentence case.
   ------------------------------------------------------------------------- */

const VARIANT = {
  primary:
    "p-btn-primary bg-p-bg-fill-brand text-p-text-brand-on-bg-fill hover:bg-p-bg-fill-brand-hover",
  secondary: "p-btn-secondary bg-p-bg-surface text-p-text hover:bg-p-bg-surface-hover active:bg-p-bg-surface-active",
  plain: "text-p-text-link hover:text-p-text-link-hover hover:underline underline-offset-2",
} as const;

type ButtonProps = {
  children: ReactNode;
  variant?: keyof typeof VARIANT;
  icon?: IconName;
  trailingIcon?: IconName;
  full?: boolean;
  className?: string;
  ariaLabel?: string;
} & ({ contact: true; href?: never; external?: never } | { contact?: false; href: string; external?: boolean });

export function Button({
  children,
  variant = "secondary",
  icon,
  trailingIcon,
  full,
  className = "",
  contact,
  href,
  external,
  ariaLabel,
}: ButtonProps) {
  const newTab = contact || external;
  const plain = variant === "plain";
  return (
    <a
      href={contact ? contactUrl() : href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel ?? (contact ? "Send us a DM on X, opens in a new tab" : undefined)}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-sans text-sm font-medium leading-5 transition-[background-color,box-shadow,color] duration-[var(--p-duration-100)] ease-[var(--p-ease)] ${
        plain ? "min-h-11 p-md:min-h-0" : "h-11 px-4 p-md:h-9 p-md:px-3"
      } ${full ? "w-full" : ""} ${VARIANT[variant]} ${className}`}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={16} />}
    </a>
  );
}

/* ---------------------------------------------------------------------------
   CARD, BADGE, and the section patterns.
   ------------------------------------------------------------------------- */

export function Card({
  children,
  className = "",
  padded = true,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  as?: "div" | "article" | "section" | "li" | "figure";
}) {
  return (
    <Tag
      className={`overflow-hidden rounded-xl bg-p-bg-surface shadow-[var(--p-shadow-card)] ${padded ? "p-4 p-sm:p-5" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}

const TONE = {
  neutral: "bg-p-bg-fill-tertiary text-p-text",
  success: "bg-[#affebf] text-[#014b40]",
  info: "bg-[#e0f0ff] text-[#00527c]",
  magic: "bg-[#ece9ff] text-[#5700d1]",
  inverse: "bg-p-bg-inverse/90 text-white",
} as const;

/** Badge — the quietest status. Tones other than neutral carry an icon, so
    colour is never the only signal. */
export function Badge({
  children,
  tone = "neutral",
  icon,
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof TONE;
  icon?: IconName;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-5 items-center gap-0.5 whitespace-nowrap rounded-lg px-2 font-sans text-xs font-medium leading-4 ${
        icon ? "pl-1" : ""
      } ${TONE[tone]} ${className}`}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}

/** The heading row that opens a band: a sentence-case title with an optional
    line of description and one action at the right. */
export function SectionHeader({
  id,
  heading,
  lead,
  action,
}: {
  id: string;
  heading: string;
  lead?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 p-md:flex-row p-md:items-end p-md:justify-between">
      <div className="max-w-[60ch]">
        <h2 id={id} className={`text-p-text ${T.heading2xl}`}>
          {title(heading)}
        </h2>
        {lead && <p className={`mt-1 text-pretty text-p-text-secondary ${T.bodyLg}`}>{lead}</p>}
      </div>
      {action}
    </div>
  );
}

/** Layout.AnnotatedSection — the annotation (title, description, an action)
    in a third, the card in two thirds. Stacks below lg. */
export function AnnotatedSection({
  id,
  heading,
  description,
  action,
  children,
}: {
  id: string;
  heading: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-4 p-lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] p-lg:gap-6">
      <div>
        <h2 id={id} className={`text-p-text ${T.heading2xl}`}>
          {title(heading)}
        </h2>
        {description && <p className={`mt-2 text-pretty text-p-text-secondary ${T.bodyMd}`}>{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
      {children}
    </div>
  );
}

/** Vertical rhythm between bands: space-1000 (40px), space-1600 (64px) wide. */
export const BAND = "py-10 p-lg:py-16";
