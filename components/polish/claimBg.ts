/* The bridge band's photograph and scrim, shared by WhyUs (a client component)
   and the server-rendered Close section. A plain module, not a client file:
   importing constants from a "use client" file into a server component yields
   client references, not strings (round 3 bug: the close card lost its image). */
export const CLAIM_BG = "bg-noir bg-cover bg-center bg-no-repeat bg-[url('/bg.png')]";

/* The scrim carries the contrast on its own — 7.46:1 worst case against
   text-paper over the untoned photograph. Written as one literal: Tailwind
   scans source text, so a class assembled from a variable never generates. */
export const CLAIM_SCRIM =
  "pointer-events-none absolute inset-0 " +
  "bg-[image:radial-gradient(85%_115%_at_50%_50%,rgba(14,12,17,0.82)_0%,rgba(14,12,17,0.7)_42%,rgba(14,12,17,0.4)_100%)]";
