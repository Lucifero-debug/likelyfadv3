import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--disable-features=CalculateNativeWinOcclusion"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:3130", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);

const box = await p.evaluate(() => {
  const r = document.querySelector("header nav").getBoundingClientRect();
  return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
});

const probe = async (y) => {
  await p.evaluate((t) => window.scrollTo(0, t), y);
  await p.waitForTimeout(450);
  // true ground pixels under the link row, header hidden
  await p.evaluate(() => (document.querySelector("header").style.visibility = "hidden"));
  const shot = (await p.screenshot({ clip: box })).toString("base64");
  await p.evaluate(() => (document.querySelector("header").style.visibility = ""));
  return p.evaluate(async ({ shot, w, h }) => {
    const img = new Image();
    img.src = "data:image/png;base64," + shot;
    await img.decode();
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, w, h).data;
    // darkest and average ground pixel behind the links
    let sum = [0, 0, 0], n = 0, dark = [255, 255, 255], light = [0, 0, 0];
    const lum = (r, g, bl) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl); };
    for (let i = 0; i < d.length; i += 4) {
      sum[0] += d[i]; sum[1] += d[i + 1]; sum[2] += d[i + 2]; n++;
      if (lum(d[i], d[i + 1], d[i + 2]) < lum(...dark)) dark = [d[i], d[i + 1], d[i + 2]];
      if (lum(d[i], d[i + 1], d[i + 2]) > lum(...light)) light = [d[i], d[i + 1], d[i + 2]];
    }
    const avg = sum.map((v) => Math.round(v / n));

    const link = document.querySelector("header nav a");
    const fg = getComputedStyle(link).color;
    const over = (bgArr) => {
      const cc = document.createElement("canvas"); cc.width = cc.height = 4;
      const xx = cc.getContext("2d");
      xx.fillStyle = `rgb(${bgArr.join(",")})`; xx.fillRect(0, 0, 4, 4);
      xx.fillStyle = fg; xx.fillRect(0, 0, 4, 4);
      const px = xx.getImageData(1, 1, 1, 1).data;
      const [hi, lo] = [lum(px[0], px[1], px[2]), lum(...bgArr)].sort((m, q) => q - m);
      return +(((hi + 0.05) / (lo + 0.05)).toFixed(2));
    };
    return { y: Math.round(scrollY), avg: avg.join(","), rAvg: over(avg), rDark: over(dark), rLight: over(light) };
  }, { shot, w: box.width, h: box.height });
};

console.log(" scrollY  avg ground      vs-avg  vs-darkest  vs-lightest  worst  verdict");
for (const y of [0, 300, 1000, 1700, 1780, 1900, 2100, 2400, 2900, 3300, 3450, 3600, 4400, 5400, 6100, 6300]) {
  const r = await probe(y);
  const worst = Math.min(r.rAvg, r.rDark, r.rLight);
  console.log(`${String(r.y).padEnd(8)} ${r.avg.padEnd(15)} ${String(r.rAvg).padStart(6)}  ${String(r.rDark).padStart(10)}  ${String(r.rLight).padStart(11)}  ${String(worst).padStart(5)}  ${worst >= 4.5 ? "PASS" : "FAIL"}`);
}
await b.close();
