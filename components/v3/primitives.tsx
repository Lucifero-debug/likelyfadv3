import type { ReactNode } from "react";
import { contactUrl } from "@/lib/site";

/* THE /v3 PAGE'S SHARED PIECES — the Apple-style pass.

   Type follows Apple's size-specific tracking: the larger the line, the
   tighter the letters and the leading. Nothing on this page uses one
   letter-spacing for every size. Fonts are the site's own (Montserrat display,
   Roboto body) — only their tracking, leading and weight are retuned. */

/** Page measure. 16px gutter on a phone, opening out to 1120px of content. */
export const V3_WRAP = "mx-auto w-full max-w-[1200px] px-4 phone:px-6 lap:px-10";

/** Vertical rhythm between bands. */
export const V3_SECTION = "py-[clamp(72px,6rem+4vw,160px)]";

/** Section headline: large, so tracking goes negative and leading goes tight. */
export const V3_H2 =
  "font-display font-bold text-balance text-[clamp(2.1rem,1.25rem+3.1vw,4rem)] leading-[1.05] tracking-[-0.032em]";

/** Intro paragraph under a headline. Body-size tracking stays near zero. */
export const V3_LEAD =
  "text-pretty text-[clamp(1.0625rem,0.98rem+0.4vw,1.3rem)] leading-[1.45] tracking-[-0.005em] text-v3-ink-2";

/** Apple's coloured eyebrow — a short word above a headline, weight not caps. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`font-display text-[clamp(1rem,0.95rem+0.25vw,1.2rem)] font-bold tracking-[-0.012em] text-pink-deep ${className}`}
    >
      {children}
    </p>
  );
}

/** Renders the content file's *starred* phrase as Apple's two-tone headline:
    the phrase steps down to the secondary grey rather than lighting up in a
    gradient. Gradient-filled type on every heading is decoration; a tonal
    step is hierarchy, and it leaves the brand colour to the eyebrow. */
export function Highlight({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, i) =>
        part.startsWith("*") ? (
          <span key={i} className="text-v3-ink-2">
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

/* THE PILL. Feedback lives on the press: `active:` scales down in 100ms, far
   faster than the hover colour change, so the button answers on pointer-down
   rather than on release. */
const PILL =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-[22px] py-[11px] " +
  "font-sans text-[1.0625rem] font-medium tracking-[-0.01em] " +
  "transition-[background-color,color,transform] duration-200 ease-out " +
  "active:scale-[0.97] active:duration-100";

const PILL_TONES = {
  ink: "bg-v3-ink text-white hover:bg-black",
  light: "bg-white text-v3-ink hover:bg-white/85",
} as const;

type PillProps = {
  children: ReactNode;
  tone?: keyof typeof PILL_TONES;
  className?: string;
} & ({ contact: true; href?: never } | { contact?: false; href: string });

export function Pill({ children, tone = "ink", className = "", contact, href }: PillProps) {
  return (
    <a
      href={contact ? contactUrl() : href}
      target={contact ? "_blank" : undefined}
      rel={contact ? "noopener noreferrer" : undefined}
      aria-label={contact ? "Send us a DM on X" : undefined}
      className={`${PILL} ${PILL_TONES[tone]} ${className}`}
    >
      {children}
    </a>
  );
}

/** Apple's inline "Learn more ›" link. The chevron hints the direction. */
export function TextLink({
  children,
  href,
  external = false,
  ariaLabel,
  className = "",
}: {
  children: ReactNode;
  href: string;
  external?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel}
      className={`group inline-flex min-h-11 items-center gap-1 text-[1.0625rem] tracking-[-0.01em] text-pink-deep hover:underline underline-offset-4 ${className}`}
    >
      {children}
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-0.5"
      >
        ›
      </span>
    </a>
  );
}
