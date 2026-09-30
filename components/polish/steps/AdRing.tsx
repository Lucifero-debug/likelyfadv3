"use client";
/* The step 4 ring: React Bits Circular Carousel (vendored, see its header),
   our wall posters as items. Drag off, no clicks, no captions; its own
   drift autoplay (it pauses itself off screen and on hidden tabs, and turns
   autoplay off under reduced motion). */
import type { ComponentType } from "react";
import Vendored from "@/components/polish/reactbits/CircularCarousel";

// The vendored file is untyped JS (ts-nocheck); every prop is optional there.
const CircularCarousel = Vendored as unknown as ComponentType<Record<string, unknown>>;

export function AdRing({ posters }: { posters: string[] }) {
  return (
    <CircularCarousel
      items={posters.map(src => ({ src, alt: "", title: "", subtitle: "" }))}
      preset="orbit"
      intro="none"
      cardWidth={96}
      aspectRatio={9 / 16}
      gap={14}
      autoplay="drift"
      speed={10}
      draggable={false}
      pauseOnHover={false}
      focusOnClick={false}
      captions={false}
      parallax={0}
      fadeColor="#fbf9f6"
      cornerRadius={10}
    />
  );
}
