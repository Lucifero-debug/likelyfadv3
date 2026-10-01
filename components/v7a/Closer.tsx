"use client";

import { useEffect, useRef, useState } from "react";
import type { Reel } from "@/lib/reels.generated";
import { ReelVideo } from "./Media";

export function Closer({ reel, heading, steps, meta }: { reel: Reel; heading: string; steps: readonly { readonly title: string; readonly line: string }[]; meta: string }) {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(1);
  useEffect(() => {
    const blocks = [...root.current!.querySelectorAll<HTMLElement>("[data-process-step]")];
    // The active text passes through a narrow band below the phone's pinned frame.
    const phone = matchMedia("(max-width: 767px)");
    let observer: IntersectionObserver;
    const observe = () => {
      observer?.disconnect();
      observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setStep(Number((visible[visible.length - 1].target as HTMLElement).dataset.processStep));
      }, { rootMargin: phone.matches ? "-58% 0px -15% 0px" : "-35% 0px -35% 0px", threshold: 0 });
      blocks.forEach((block) => observer.observe(block));
    };
    observe();
    phone.addEventListener("change", observe);
    return () => { observer.disconnect(); phone.removeEventListener("change", observe); };
  }, []);

  return <section id="closer" className="v7-section v7-closer" ref={root} aria-labelledby="v7-closer-title">
    <div className="v7-container"><h2 id="v7-closer-title" className="v7-chapter-title">{heading}</h2>
      <div className="v7-closer-body">
        <div className="v7-closer-sticky">
          <div className="v7-process-frame" data-step={step} data-reel={step < 3 ? reel.id : undefined}>
            {step === 1 && <div className="v7-script-card" aria-label="Script preview"><div className="v7-script-mark" aria-hidden="true" /><div className="v7-script-lines" aria-hidden="true">{[82, 100, 70, 90].map((width, index) => <span key={index} style={{ width: `${width}%` }} />)}</div></div>}
            {step === 2 && <div className="v7-storyboard" aria-label="Storyboard preview">{[1, 2, 3, 4].map((index) =>
              // eslint-disable-next-line @next/next/no-img-element
              <img key={index} src={`/v7/chip-${reel.id}-step-${index}.jpg`} alt="" width={360} height={640} />
            )}</div>}
            {step >= 3 && <ReelVideo reel={reel} priority={7} />}
            {step === 4 && <span className="v7-meta-chip">{meta}</span>}
          </div>
        </div>
        <div className="v7-process-steps">{steps.map((item, index) => <article key={item.title} className="v7-process-step" data-process-step={index + 1} data-active={step === index + 1}>
          <span className="v7-step-number" aria-hidden="true">0{index + 1}</span><h3>{item.title}</h3><p>{item.line}</p>
        </article>)}</div>
      </div>
    </div>
  </section>;
}
