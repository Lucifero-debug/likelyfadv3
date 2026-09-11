import { chromium, devices } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices["iPhone 13"] });
const p = await ctx.newPage();
await p.goto("http://localhost:3000",{waitUntil:"networkidle"}).catch(()=>{});
await p.waitForTimeout(2000);
console.log(JSON.stringify(await p.evaluate(() => {
  const sec=[...document.querySelectorAll("section")].find(e=>e.querySelector("h2")?.textContent?.includes("Real reactions"));
  const cs=getComputedStyle(sec);
  const grid=sec.querySelector("[class*=grid-cols-2]");
  const head=sec.querySelector("[class*=mb-]");
  const items=[...grid.children];
  const rows={};
  items.forEach((it,i)=>{ const r=it.getBoundingClientRect(); const k=Math.round(r.top/5);
    rows[k]=(rows[k]||0); rows[k]=Math.max(rows[k], +r.height.toFixed(0)); });
  const fig=items[0].querySelector("figure");
  const frame=fig.firstElementChild;
  const text=fig.children[1];
  return {
    viewportH: innerHeight,
    sectionH: +sec.getBoundingClientRect().height.toFixed(0),
    sectionPadY: cs.paddingTop+"/"+cs.paddingBottom,
    headingBlockH: +head.getBoundingClientRect().height.toFixed(0),
    gridH: +grid.getBoundingClientRect().height.toFixed(0),
    gap: getComputedStyle(grid).rowGap,
    rowHeights: Object.values(rows),
    cardW: +fig.getBoundingClientRect().width.toFixed(0),
    frameH: +frame.getBoundingClientRect().height.toFixed(0),
    frameRatio: (frame.getBoundingClientRect().width/frame.getBoundingClientRect().height).toFixed(3),
    textH: +text.getBoundingClientRect().height.toFixed(0),
    screens: +(sec.getBoundingClientRect().height/innerHeight).toFixed(2),
  };
}, null), null, 1));
await b.close();
