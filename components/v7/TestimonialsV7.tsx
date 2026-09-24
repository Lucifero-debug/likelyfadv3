"use client";

import { useEffect, useRef } from "react";
import { Testimonials } from "@/components/sections/Testimonials";

/* TESTIMONIALS — V7. The shared section, left whole (its players, the one-at-a-
   time rule and the touch autoplay are 1,100 lines worth keeping), with two
   additions layered on its row:

     DRAG TO SCROLL on a mouse. The row only scrolled by wheel, trackpad or the
     arrows; now it can be grabbed and flung, with momentum, and it settles back
     onto the snap. A drag longer than a few pixels swallows the click that
     ends it, so letting go over a card never opens that card's player.

     A DEPTH CURVE. Every card's frame leans away in 3D by how far it sits from the
     row's centre, so the row reads as a gentle arc and moves like one as it
     scrolls. Written on each card's frame, from the row's own scroll event —
     nothing listens to the page. */
export function TestimonialsV7() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const track = host?.querySelector<HTMLElement>('[role="group"][tabindex="0"]');
    if (!host || !track) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const items = [...track.children] as HTMLElement[];
    /* The FRAME of each card (its first child), not the whole card: tilting the
       quote under it would skew the type. */
    const cards = items.map((el) => (el.firstElementChild?.firstElementChild as HTMLElement | null) ?? null);

    if (fine) track.dataset.cursor = "Drag";

    /* ── THE DEPTH CURVE ─────────────────────────────────────────────── */
    let raf = 0;
    const curve = () => {
      raf = 0;
      const tr = track.getBoundingClientRect();
      const mid = tr.left + tr.width / 2;
      items.forEach((item, i) => {
        const card = cards[i];
        if (!card) return;
        const r = item.getBoundingClientRect();
        const d = Math.max(-1.4, Math.min(1.4, (r.left + r.width / 2 - mid) / (tr.width / 2)));
        card.style.transform = `perspective(1100px) rotateY(${(-d * 8).toFixed(2)}deg) translateZ(${(-Math.abs(d) * 24).toFixed(1)}px)`;
      });
    };
    const scheduleCurve = () => {
      if (!raf) raf = requestAnimationFrame(curve);
    };
    if (!still) {
      cards.forEach((c) => c && (c.style.transformOrigin = "50% 50%"));
      curve();
      track.addEventListener("scroll", scheduleCurve, { passive: true });
      window.addEventListener("resize", scheduleCurve);
    }

    /* ── DRAG TO SCROLL (mouse only) ─────────────────────────────────── */
    let down = false;
    let moved = 0;
    let startX = 0;
    let startLeft = 0;
    let lastX = 0;
    let lastT = 0;
    let vel = 0;
    let glide = 0;

    const stopGlide = () => {
      cancelAnimationFrame(glide);
      glide = 0;
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      /* Cards are buttons, so a drag may start on one (the capture-phase click
         guard below keeps it from opening). Only the seek slider is exempt:
         dragging it must scrub, not scroll. */
      if ((e.target as HTMLElement).closest("input")) return;
      stopGlide();
      down = true;
      moved = 0;
      startX = lastX = e.clientX;
      startLeft = track.scrollLeft;
      lastT = performance.now();
      vel = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved < 4) return;
      if (!track.hasPointerCapture(e.pointerId)) {
        track.setPointerCapture(e.pointerId);
        track.style.scrollSnapType = "none";
        track.style.cursor = "grabbing";
        track.style.userSelect = "none";
      }
      track.scrollLeft = startLeft - dx;
      const now = performance.now();
      vel = (lastX - e.clientX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
    };
    const release = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
      track.style.cursor = "";
      track.style.userSelect = "";
      if (moved < 4) {
        track.style.scrollSnapType = "";
        return;
      }
      /* Momentum, then hand back to snap so the row lands on a card. */
      let v = vel * 16;
      const step = () => {
        track.scrollLeft += v;
        v *= 0.92;
        if (Math.abs(v) > 0.5 && !still) glide = requestAnimationFrame(step);
        else {
          glide = 0;
          track.style.scrollSnapType = "";
        }
      };
      glide = requestAnimationFrame(step);
    };
    /* Capture phase: the click that ends a drag never reaches the card. */
    const onClick = (e: MouseEvent) => {
      if (moved >= 4) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };

    if (fine) {
      track.addEventListener("pointerdown", onDown);
      track.addEventListener("pointermove", onMove);
      track.addEventListener("pointerup", release);
      track.addEventListener("pointercancel", release);
      track.addEventListener("click", onClick, true);
      track.style.cursor = "grab";
    }

    return () => {
      cancelAnimationFrame(raf);
      stopGlide();
      track.removeEventListener("scroll", scheduleCurve);
      window.removeEventListener("resize", scheduleCurve);
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", release);
      track.removeEventListener("pointercancel", release);
      track.removeEventListener("click", onClick, true);
      cards.forEach((c) => c && (c.style.transform = ""));
      delete track.dataset.cursor;
      track.style.cursor = "";
    };
  }, []);

  return (
    <div ref={hostRef}>
      <Testimonials />
    </div>
  );
}
