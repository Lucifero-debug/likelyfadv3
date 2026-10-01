"use client";

import { useState } from "react";

export function Questions({ items }: { items: readonly { readonly q: string; readonly a: string }[] }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  function toggle(index: number) {
    setOpen((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  }
  return <div className="v7-questions">{items.map((item, index) => <div className="v7-question" key={item.q} data-open={open.has(index)}>
    <h3><button type="button" data-control="accordion" id={`v7-question-${index}`} aria-expanded={open.has(index)} aria-controls={`v7-answer-${index}`} onClick={() => toggle(index)}>
      <span>{item.q}</span><svg className="v7-plus" width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="14" cy="14" r="10.5" /><path d="M9.5 14h9M14 9.5v9" /></svg>
    </button></h3>
    <div className="v7-answer" id={`v7-answer-${index}`} role="region" aria-labelledby={`v7-question-${index}`} aria-hidden={!open.has(index)}><div><p>{item.a}</p></div></div>
  </div>)}</div>;
}
