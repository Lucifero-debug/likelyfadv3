#!/usr/bin/env node
/* ONE-OFF: pull the reel library back out of Vercel Blob under the new keys.

   WHY THIS EXISTS AND WHY IT IS NOT PART OF THE SYNC. The Drive folder holds 39
   of the 68 reels the site is built on; the other 29 exist only as the cuts that
   were already uploaded to Blob. So the migration has two sources, and they are
   not equivalent: Drive gives masters that must be transcoded, Blob gives the
   exact bytes that were live. Mixing those into one script would hide which reel
   came from where.

   IT DOWNLOADS ALREADY-ENCODED FILES AND DOES NOT RE-ENCODE THEM. That is the
   point. The Blob objects are the tile cut, the hq cut and the poster the old
   pipeline produced — running them back through ffmpeg would be a second
   generation loss for nothing. They are copied, renamed onto the deterministic
   keys, and that is all.

   THE OLD URLS COME OUT OF GIT, NOT OUT OF A HARDCODED LIST. lib/reels.generated
   .ts at the pre-migration commit is the only complete record of the 204 random-
   suffixed URLs, and it is already in the repo's history. Reading it from a ref
   means this script needs no credentials, no manifest of its own, and cannot
   drift from what was actually live.

     node scripts/restore-from-blob.mjs [--ref <git-ref>] [--only <id,id>] [--force]

   IDEMPOTENT: an output that exists and is non-empty is skipped, so an
   interrupted run resumes instead of starting over. */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeReels } from "./emit-reels.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(REPO, "public", "videos", "reels");

const VARIANTS = [
  { field: "src", ext: ".mp4", type: "video/" },
  { field: "hq", ext: ".hq.mp4", type: "video/" },
  { field: "poster", ext: ".webp", type: "image/" },
];

function die(msg) {
  console.error(`\n  ERROR  ${msg}\n`);
  process.exit(1);
}

const bytes = (n) =>
  n >= 1 << 30 ? `${(n / (1 << 30)).toFixed(2)} GB` : `${(n / (1 << 20)).toFixed(1)} MB`;

function gitShow(ref, file) {
  return new Promise((resolve, reject) => {
    const p = spawn("git", ["show", `${ref}:${file}`], { cwd: REPO, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (c) => (c === 0 ? resolve(out) : reject(new Error(err.trim() || `git exited ${c}`))));
  });
}

/* The pre-migration file is one object literal per line with all three URLs on
   it. Parsed with a regex rather than by importing it, because that revision
   imports nothing and evaluating a checked-out TypeScript file to read four
   strings is a lot of machinery for a one-off. */
function parseOld(source) {
  return [
    ...source.matchAll(
      /\{ id: "([^"]+)", src: "([^"]+)", hq: (null|"[^"]+"), poster: (null|"[^"]+") \}/g
    ),
  ].map((m) => ({
    id: m[1],
    src: m[2],
    hq: m[3] === "null" ? null : m[3].slice(1, -1),
    poster: m[4] === "null" ? null : m[4].slice(1, -1),
  }));
}

/* One retry on anything transient. A 403 is NOT transient — that is the blocked
   store, and hammering it 204 times tells you nothing the first one did not. */
async function download(url, dest, expectType) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    let res;
    try {
      res = await fetch(url);
    } catch (e) {
      if (attempt === 3) throw new Error(`network: ${e.message}`);
      await new Promise((r) => setTimeout(r, 500 * attempt));
      continue;
    }
    if (res.status === 403) {
      const body = await res.text().catch(() => "");
      throw new Error(`403 ${body.trim() || "forbidden"} — the store is still blocked`);
    }
    if (!res.ok) {
      if (attempt === 3) throw new Error(`HTTP ${res.status}`);
      await new Promise((r) => setTimeout(r, 500 * attempt));
      continue;
    }
    const type = res.headers.get("content-type") || "";
    if (expectType && !type.startsWith(expectType)) {
      throw new Error(`unexpected content-type ${type || "(none)"}, wanted ${expectType}*`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.length) throw new Error("empty body");
    /* Written via a temp name and renamed, so an interrupted run never leaves a
       truncated file that the next run would treat as complete. */
    const tmp = `${dest}.part`;
    fs.writeFileSync(tmp, buf);
    fs.renameSync(tmp, dest);
    return buf.length;
  }
  throw new Error("unreachable");
}

async function main() {
  const argv = process.argv.slice(2);
  let ref = "HEAD";
  let only = null;
  let force = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--ref") ref = argv[++i];
    else if (argv[i] === "--only") only = new Set(argv[++i].split(",").map((s) => s.trim()));
    else if (argv[i] === "--force") force = true;
    else die(`unknown option: ${argv[i]}`);
  }

  const source = await gitShow(ref, "lib/reels.generated.ts").catch((e) =>
    die(`could not read lib/reels.generated.ts at ${ref}: ${e.message}`)
  );
  let reels = parseOld(source);
  if (!reels.length) {
    die(
      `no reels parsed from ${ref}:lib/reels.generated.ts — that revision is probably ` +
        `already the post-migration file. Pass --ref <pre-migration-commit>.`
    );
  }
  if (only) reels = reels.filter((r) => only.has(r.id));

  console.log(`\n  RESTORE  ${reels.length} reel(s) from ${ref} -> public/videos/reels\n`);
  fs.mkdirSync(OUT, { recursive: true });

  const jobs = [];
  for (const reel of reels) {
    for (const v of VARIANTS) {
      const url = reel[v.field];
      if (!url) continue;
      jobs.push({ id: reel.id, variant: v.field, url, dest: path.join(OUT, reel.id + v.ext), type: v.type });
    }
  }

  let done = 0;
  let fetched = 0;
  let skipped = 0;
  let downloaded = 0;
  const failures = [];
  const queue = [...jobs];

  await Promise.all(
    Array.from({ length: Math.min(6, queue.length) }, async () => {
      for (;;) {
        const j = queue.shift();
        if (!j) return;
        done++;
        if (!force && fs.existsSync(j.dest) && fs.statSync(j.dest).size > 0) {
          skipped++;
          continue;
        }
        try {
          downloaded += await download(j.url, j.dest, j.type);
          fetched++;
          process.stdout.write(`  [${String(done).padStart(3)}/${jobs.length}] ${j.id} ${j.variant}\n`);
        } catch (e) {
          failures.push({ ...j, error: e.message });
          process.stdout.write(`  [${String(done).padStart(3)}/${jobs.length}] ${j.id} ${j.variant}  FAILED: ${e.message}\n`);
        }
      }
    })
  );

  console.log(`\n  ${fetched} downloaded (${bytes(downloaded)}), ${skipped} already present, ${failures.length} failed`);

  if (failures.length) {
    console.error(`\n  MANIFEST NOT WRITTEN — ${failures.length} object(s) did not come down.`);
    const blocked = failures.filter((f) => f.error.includes("blocked")).length;
    if (blocked) {
      console.error(`  ${blocked} of them are the blocked store. Unblock it in the Vercel`);
      console.error(`  dashboard (Storage -> the Blob store) and re-run; completed files are kept.`);
    }
    const shown = failures.slice(0, 10);
    for (const f of shown) console.error(`    ${f.id} ${f.variant}: ${f.error}`);
    if (failures.length > shown.length) console.error(`    ... and ${failures.length - shown.length} more`);
    process.exit(1);
  }

  /* Only once everything is on disk. A manifest written over a partial restore
     claims variants that are not there, and the site 404s on exactly the reels
     that failed. */
  const entries = reels.map((r) => ({
    id: r.id,
    hq: fs.existsSync(path.join(OUT, `${r.id}.hq.mp4`)),
    poster: fs.existsSync(path.join(OUT, `${r.id}.webp`)),
  }));
  const changed = writeReels(entries, REPO);

  const totals = { tile: 0, hq: 0, poster: 0 };
  for (const e of entries) {
    const s = (f) => (fs.existsSync(f) ? fs.statSync(f).size : 0);
    totals.tile += s(path.join(OUT, `${e.id}.mp4`));
    totals.hq += s(path.join(OUT, `${e.id}.hq.mp4`));
    totals.poster += s(path.join(OUT, `${e.id}.webp`));
  }
  const grand = totals.tile + totals.hq + totals.poster;

  console.log(`  lib/reels.generated.ts ${changed ? "rewritten" : "unchanged"} (${entries.length} reels)`);
  console.log(`\n  UPLOAD PAYLOAD  ${jobs.length} objects, ${bytes(grand)}`);
  console.log(`         tiles   ${bytes(totals.tile)}`);
  console.log(`         hq      ${bytes(totals.hq)}`);
  console.log(`         posters ${bytes(totals.poster)}`);
  console.log(`\n  Nothing was uploaded — that is a separate, deliberate step:`);
  console.log(`    node scripts/upload-blob.mjs      (see docs/blob-store.md)\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => die(e.message));
}
