#!/usr/bin/env node
/* CHECK THAT EVERY DERIVED URL ACTUALLY RESOLVES.

   The manifest stores ids and flags and builds URLs from a base, which is the
   whole point of the R2 migration — but it also means a typo in the base, a
   missed upload or a wrong key produces a URL that is perfectly well-formed and
   completely dead. Nothing in the type system catches that. This does.

   Point it at whatever is serving the library:

     node scripts/verify-library.mjs --base http://localhost:3001/videos
     node scripts/verify-library.mjs --base https://cdn.example.com

   IT READS THE SAME MANIFEST THE SITE DOES, by parsing lib/reels.generated.ts
   for ids and flags rather than importing it — importing would pull in lib/cdn
   .ts and bind the check to whatever NEXT_PUBLIC_CDN_BASE happens to be, which
   is the one variable this is supposed to be testing.

   HEAD FIRST, RANGED GET AS FALLBACK. Some CDNs and dev servers answer HEAD
   with 405 while serving GET perfectly well, and reporting that as a failure
   would be a false alarm on a library that is fine. A one-byte ranged GET
   settles it without pulling the object.

   IT ALSO TOTALS THE BYTES, which is the number to check against R2's free
   tier — and reading it from the server rather than from disk is what makes it
   the real answer rather than the intended one. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function die(msg) {
  console.error(`\n  ERROR  ${msg}\n`);
  process.exit(1);
}

const bytes = (n) =>
  n >= 1 << 30 ? `${(n / (1 << 30)).toFixed(2)} GB` : `${(n / (1 << 20)).toFixed(1)} MB`;

/** Parse `{ id: "x", hq: true, poster: true },` rows out of the manifest. */
function readManifest() {
  const file = path.join(REPO, "lib", "reels.generated.ts");
  const src = fs.readFileSync(file, "utf8");
  const rows = [
    ...src.matchAll(/\{\s*id:\s*"([^"]+)",\s*hq:\s*(true|false),\s*poster:\s*(true|false)\s*\}/g),
  ].map((m) => ({ id: m[1], hq: m[2] === "true", poster: m[3] === "true" }));
  if (!rows.length) die(`no entries parsed from ${file}`);
  return rows;
}

async function probe(url) {
  let res = await fetch(url, { method: "HEAD" }).catch((e) => ({ status: 0, err: e.message }));
  if (res.status === 405 || res.status === 501) {
    res = await fetch(url, { headers: { Range: "bytes=0-0" } }).catch((e) => ({ status: 0, err: e.message }));
  }
  const len = res.headers?.get?.("content-length");
  const range = res.headers?.get?.("content-range");
  /* A ranged response reports 1 byte in content-length; the real size is after
     the slash in content-range. Reading the wrong one under-reports the total
     by a factor of several million, which would look like success. */
  const size = range ? Number(range.split("/")[1]) : Number(len || 0);
  return {
    status: res.status,
    ok: res.status >= 200 && res.status < 300,
    type: res.headers?.get?.("content-type") || "",
    cache: res.headers?.get?.("cache-control") || "",
    size: Number.isFinite(size) ? size : 0,
    err: res.err,
  };
}

async function main() {
  const argv = process.argv.slice(2);
  let base = null;
  let concurrency = 8;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--base") base = argv[++i];
    else if (argv[i] === "--concurrency") concurrency = Math.max(1, Number(argv[++i]) || 8);
    else die(`unknown option: ${argv[i]}`);
  }
  if (!base) die("--base is required, e.g. --base http://localhost:3001/videos");
  base = base.replace(/\/+$/, "");

  const reels = readManifest();
  const jobs = [];
  for (const r of reels) {
    jobs.push({ id: r.id, variant: "src", url: `${base}/reels/${r.id}.mp4`, want: "video/" });
    if (r.hq) jobs.push({ id: r.id, variant: "hq", url: `${base}/reels/${r.id}.hq.mp4`, want: "video/" });
    if (r.poster) jobs.push({ id: r.id, variant: "poster", url: `${base}/reels/${r.id}.webp`, want: "image/" });
  }

  console.log(`\n  VERIFY  ${reels.length} reels, ${jobs.length} objects against ${base}\n`);

  const failures = [];
  const typeWarnings = [];
  const cacheWarnings = [];
  let total = 0;
  let done = 0;
  const queue = [...jobs];

  await Promise.all(
    Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      for (;;) {
        const j = queue.shift();
        if (!j) return;
        const r = await probe(j.url);
        done++;
        if (!r.ok) failures.push({ ...j, ...r });
        else {
          total += r.size;
          if (j.want && r.type && !r.type.startsWith(j.want)) typeWarnings.push({ ...j, got: r.type });
          if (!/max-age=\d\d\d\d+/.test(r.cache)) cacheWarnings.push({ ...j, got: r.cache || "(none)" });
        }
        if (done % 25 === 0) process.stdout.write(`  ${done}/${jobs.length}\n`);
      }
    })
  );

  console.log(`\n  ${jobs.length - failures.length}/${jobs.length} resolved, ${bytes(total)} total`);

  if (typeWarnings.length) {
    console.log(`\n  CONTENT-TYPE looks wrong on ${typeWarnings.length} object(s):`);
    for (const w of typeWarnings.slice(0, 8)) console.log(`    ${w.id} ${w.variant}: ${w.got}`);
  }
  if (cacheWarnings.length) {
    console.log(`\n  CACHE-CONTROL missing or short on ${cacheWarnings.length} object(s):`);
    for (const w of cacheWarnings.slice(0, 4)) console.log(`    ${w.id} ${w.variant}: ${w.got}`);
    console.log(`    (expected on R2, not on the dev server — see docs/r2-upload.md)`);
  }

  if (failures.length) {
    console.error(`\n  ${failures.length} FAILED:`);
    for (const f of failures.slice(0, 20)) {
      console.error(`    ${String(f.status || f.err).padEnd(6)} ${f.id} ${f.variant}  ${f.url}`);
    }
    if (failures.length > 20) console.error(`    ... and ${failures.length - 20} more`);
    console.error("");
    process.exit(1);
  }

  console.log(`\n  ALL OBJECTS RESOLVE.\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => die(e.message));
}
