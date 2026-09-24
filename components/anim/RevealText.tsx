"use client";

import type { ComponentProps } from "react";
import { RevealText as TextReveal } from "@/components/ui/RevealText";

/* ============================================================================
   REVEALTEXT — the same word-by-word reveal, timed in SECONDS.

   The clip-and-slide, the per-word boxes and the gradient run all stay in
   components/ui/RevealText; this is the unit conversion and nothing else. The
   sections written against the v1 markup pass `stagger={0.03}` where that one
   wants 30, and the two are a factor of a thousand apart — a raw 0.03 would be
   read as sub-millisecond and every word would land on the same frame.

   ONE CONVERSION, IN ONE PLACE, is the point of the file. Doing it at each call
   site means six chances to write 0.03 into a ms prop, and the failure is
   silent: the reveal still runs, it just stops being a sweep.
   ========================================================================== */
type Props = Omit<ComponentProps<typeof TextReveal>, "stagger" | "delay"> & {
  /** SECONDS between words. */
  stagger?: number;
  /** SECONDS before the first word moves. */
  delay?: number;
};

export function RevealText({ stagger = 0.045, delay = 0, ...rest }: Props) {
  return <TextReveal {...rest} stagger={stagger * 1000} delay={delay * 1000} />;
}
