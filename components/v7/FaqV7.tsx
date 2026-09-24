"use client";

import { useEffect, useRef } from "react";
import { FaqV4 } from "@/components/sections/FaqV4";

/* FAQ — V7. FaqV4 whole (its accordion already animates open and closed), plus
   A HIGHLIGHT THAT GLIDES between questions: a soft pink wash behind the row
   under the pointer or holding keyboard focus, which slides from one row to the
   next instead of blinking on and off, and grows with a row as it opens. One
   element, moved with a transform and sized with a height, inserted behind the
   list. Leaving the list fades it out where it stands. */
export function FaqV7() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const first = host?.querySelector<HTMLElement>("#faq h3 button");
    /* The list: the element that holds every row. */
    const list = first?.closest("h3")?.parentElement?.parentElement?.parentElement as HTMLElement | null;
    if (!host || !list) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const prevPos = list.style.position;
    list.style.position = "relative";
    list.style.isolation = "isolate";

    const TRANS = still
      ? ""
      : "transform 420ms cubic-bezier(0.16,1,0.3,1),height 420ms cubic-bezier(0.16,1,0.3,1),opacity 250ms ease";
    const glow = document.createElement("span");
    glow.setAttribute("aria-hidden", "true");
    glow.style.cssText =
      "position:absolute;left:-16px;right:-16px;top:0;height:0;z-index:-1;border-radius:18px;" +
      "background:linear-gradient(100deg,rgba(255,106,61,0.07),rgba(240,64,127,0.09) 55%,rgba(138,79,224,0.07));" +
      "opacity:0;pointer-events:none;";
    glow.style.transition = TRANS;
    list.appendChild(glow);

    let row: HTMLElement | null = null;
    const place = () => {
      if (!row) return;
      glow.style.transform = `translateY(${row.offsetTop}px)`;
      glow.style.height = `${row.offsetHeight}px`;
    };
    /* A row is the Reveal wrapper directly inside the list. */
    const rowOf = (el: EventTarget | null) => {
      let n = el as HTMLElement | null;
      while (n && n.parentElement !== list) n = n.parentElement;
      return n && n !== glow ? n : null;
    };
    const show = (r: HTMLElement | null) => {
      if (!r) return;
      const firstShow = glow.style.opacity !== "1";
      row = r;
      if (firstShow) {
        /* Appear in place, rather than sliding in from wherever it last was. */
        glow.style.transition = "none";
        place();
        void glow.offsetHeight;
        glow.style.transition = TRANS;
      }
      place();
      glow.style.opacity = "1";
    };
    const hide = () => {
      glow.style.opacity = "0";
    };

    const onOver = (e: PointerEvent) => show(rowOf(e.target));
    const onFocus = (e: FocusEvent) => show(rowOf(e.target));
    /* Rows change height as they open and close; follow them. */
    const ro = new ResizeObserver(place);
    [...list.children].forEach((c) => c !== glow && ro.observe(c));

    list.addEventListener("pointerover", onOver);
    list.addEventListener("pointerleave", hide);
    list.addEventListener("focusin", onFocus);
    list.addEventListener("focusout", hide);
    return () => {
      ro.disconnect();
      list.removeEventListener("pointerover", onOver);
      list.removeEventListener("pointerleave", hide);
      list.removeEventListener("focusin", onFocus);
      list.removeEventListener("focusout", hide);
      glow.remove();
      list.style.position = prevPos;
      list.style.isolation = "";
    };
  }, []);

  return (
    <div ref={hostRef}>
      <FaqV4 />
    </div>
  );
}
