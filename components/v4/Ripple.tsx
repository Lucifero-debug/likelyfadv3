"use client";

import { useEffect } from "react";

/* THE RIPPLE, delegated. One pointerdown listener for the whole page instead
   of a hook per button, so every button stays a server component: anything
   carrying .m3-ripple gets a wave that starts at the press point, grows to
   cover the component, and fades once the pointer lets go.

   The state layer (.m3-state) already answers hover, focus and press; the
   ripple only adds WHERE the press happened. Under reduced motion it is
   hidden in CSS and the state layer alone remains. */
export function Ripple() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const host = (e.target as Element | null)?.closest<HTMLElement>(".m3-ripple");
      if (!host || host.matches(":disabled")) return;

      const rect = host.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Far enough to reach the furthest corner from the press point.
      const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));

      const wave = document.createElement("span");
      wave.className = "m3-ripple-wave";
      wave.setAttribute("aria-hidden", "true");
      wave.style.cssText = `left:${x}px;top:${y}px;width:${radius * 2}px;height:${radius * 2}px`;
      host.appendChild(wave);

      const born = performance.now();
      const release = () => {
        window.removeEventListener("pointerup", release);
        window.removeEventListener("pointercancel", release);
        // Let the wave reach most of its size before it fades, even on a quick tap.
        const wait = Math.max(0, 225 - (performance.now() - born));
        window.setTimeout(() => {
          wave.setAttribute("data-out", "");
          window.setTimeout(() => wave.remove(), 220);
        }, wait);
      };
      window.addEventListener("pointerup", release);
      window.addEventListener("pointercancel", release);
    };

    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  return null;
}
