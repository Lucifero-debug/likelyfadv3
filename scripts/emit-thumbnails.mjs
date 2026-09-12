#!/usr/bin/env node
/* STANDALONE THUMBNAILS — masters in, full-resolution JPEGs out.

   NOT THE SITE POSTERS, AND DELIBERATELY NOT SHARING THEIR OUTPUT FOLDER.
   scripts/sync-videos.mjs already cuts a poster per reel, but those are
   400px-wide WebP tuned for the wall tiles: small, lossy, and sized for a
   thumbnail slot roughly a third of a phone screen. They are the wrong file to
   hand to anything else — an ad platform, a client deck, a thumbnail editor —
   and upscaling one is worse than cutting a new frame from the master.

   So this writes a SEPARATE tree, `thumbnails/`, at native 1080x1920, JPEG q2.
   Nothing in the app reads it, nothing uploads it, and it is git-ignored like
   the other two derived trees. Deleting it costs a re-run, nothing else.

   THE FRAME IS THE SAME FRAME THE POSTER USES — one second in, or halfway when
   the clip is shorter than two seconds. That is not laziness: it means the
   full-res thumbnail and the tile poster show the same moment, so a reel picked
   by its tile on the site looks like what you get out of here. The seek is
   `-ss` before `-i` for the same reason as the poster cut: it lands on the
   nearest keyframe, which is fine for a representative frame and saves decoding
   the whole file 39 times.

   IDS COME FROM slugify() IN sync-videos.mjs, IMPORTED RATHER THAN COPIED, so
   `thumbnails/v2702.jpg` is guaranteed to name the same reel as
   `public/videos/reels/v2702.webp` and the `v2702` entry in the manifest. A
   second copy of that regex would drift the first time a filename with an
   accent or a double space showed up. */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { slugify } from "./sync-videos.mjs";

const VIDEO_EXT = new Set([".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi"]);

/* q2 is the top of the useful JPEG range — q1 is visually identical and ~40%
   bigger. Native resolution, so no scale filter at all: whatever the master is,
   that is what comes out. Scaling here would bake a guess about the consumer's
   target size into the file, and scaling down later is cheap and lossless
   enough; scaling back up is not. */
const JPEG_QUALITY = 2;

let THREADS = 4;

function die(msg) {
  console.error(`\n  ERROR  ${msg}\n`);
  process.exit(1);
}

const thumbArgs = (src, out, at) => [
  "-y", "-loglevel", "error", "-nostdin",
  "-ss", String(at),
  "-threads", String(THREADS),
  "-i", src,
  "-frames:v", "1",
  "-q:v", String(JPEG_QUALITY),
  out,
];

function run(bin, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("error", (e) =>
      reject(new Error(e.code === "ENOENT" ? `${bin} not found on PATH` : e.message))
    );
    p.on("close", (c) =>
      c === 0 ? resolve() : reject(new Error(err.trim() || `${bin} exited ${c}`))
    );
  });
}

function capture(bin, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("error", (e) =>
      reject(new Error(e.code === "ENOENT" ? `${bin} not found on PATH` : e.message))
    );
    p.on("close", (c) =>
      c === 0 ? resolve(out.trim()) : reject(new Error(err.trim() || `${bin} exited ${c}`))
    );
  });
}

/* Current means: exists, non-empty, and not older than its source. Same test
   sync-videos uses, so re-running after replacing one master rebuilds exactly
   that one and leaves the other 38 alone. */
function isCurrent(file, srcMtime, force) {
  if (force) return false;
  try {
    const s = fs.statSync(file);
    return s.size > 0 && s.mtimeMs >= srcMtime;
  } catch {
    return false;
  }
}

function bytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
}

function parseArgs(argv) {
  const o = {
    source: ".source-videos",
    out: "thumbnails",
    force: false,
    limit: 0,
    jobs: Math.max(2, Math.min(4, Math.floor(os.cpus().length / 2))),
    threads: 4,
    ffmpeg: process.env.FFMPEG_PATH || "ffmpeg",
    ffprobe: process.env.FFPROBE_PATH || "ffprobe",
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--source") o.source = next();
    else if (a === "--out") o.out = next();
    else if (a === "--jobs") o.jobs = Math.max(1, Number(next()) || 1);
    else if (a === "--threads") o.threads = Math.max(1, Number(next()) || 1);
    else if (a === "--limit") o.limit = Math.max(0, Number(next()) || 0);
    else if (a === "--ffmpeg") o.ffmpeg = next();
    else if (a === "--ffprobe") o.ffprobe = next();
    else if (a === "--force") o.force = true;
    else if (a === "-h" || a === "--help") o.help = true;
    else die(`unknown flag ${a}`);
  }
  return o;
}

const HELP = `
  emit-thumbnails — full-resolution JPEG thumbnails, one per source video.

    node scripts/emit-thumbnails.mjs [flags]

    --source <dir>   masters to read          (default .source-videos)
    --out <dir>      where to write           (default thumbnails)
    --force          rebuild even if current
    --limit <n>      only do n that need work
    --jobs <n>       parallel ffmpeg processes
    --threads <n>    threads per ffmpeg
    --ffmpeg <path>  --ffprobe <path>

  Writes <out>/<id>.jpg at the master's native resolution, where <id> is the
  same slug the reel library uses. Nothing here touches public/videos, the
  generated manifest, or the blob store.
`;

async function main() {
  const opt = parseArgs(process.argv.slice(2));
  if (opt.help) {
    console.log(HELP);
    return;
  }
  THREADS = opt.threads;

  const sourceDir = path.resolve(opt.source);
  const outDir = path.resolve(opt.out);

  if (!fs.existsSync(sourceDir)) die(`source dir not found: ${sourceDir}`);
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs
    .readdirSync(sourceDir)
    .filter((f) => VIDEO_EXT.has(path.extname(f).toLowerCase()))
    .sort();
  if (!files.length) die(`no video files in ${sourceDir}`);

  /* Collision check before any work. Two masters that slug to the same id would
     silently overwrite each other, and you would find out by counting files. */
  const byId = new Map();
  for (const f of files) {
    const id = slugify(f);
    if (!id) die(`${f} slugs to an empty id`);
    if (byId.has(id)) die(`${f} and ${byId.get(id)} both slug to "${id}"`);
    byId.set(id, f);
  }

  let tasks = [...byId.entries()];

  if (opt.limit) {
    const pending = tasks.filter(([id, file]) =>
      !isCurrent(
        path.join(outDir, `${id}.jpg`),
        fs.statSync(path.join(sourceDir, file)).mtimeMs,
        opt.force
      )
    );
    const take = new Set(pending.slice(0, opt.limit).map(([id]) => id));
    console.log(`  LIMIT  ${pending.length} need work; doing ${take.size} this batch`);
    tasks = tasks.filter(([id]) => take.has(id));
  }

  console.log(`\n  THUMBNAILS  ${sourceDir}`);
  console.log(`           -> ${outDir}`);
  console.log(
    `              ${tasks.length} source(s), ${opt.jobs} job(s), JPEG q${JPEG_QUALITY}, native size\n`
  );

  let built = 0;
  let skipped = 0;
  let done = 0;
  const failures = [];

  async function build([id, file]) {
    const src = path.join(sourceDir, file);
    const srcMtime = fs.statSync(src).mtimeMs;
    const out = path.join(outDir, `${id}.jpg`);

    if (isCurrent(out, srcMtime, opt.force)) {
      skipped++;
      done++;
      return;
    }

    /* One second in, unless the clip is shorter than two — then halfway, so a
       very short source yields a frame rather than a black one past the end.
       Probe failures fall back to 0, which is always inside the file. */
    let at = 1;
    try {
      const d = Number(
        await capture(opt.ffprobe, [
          "-v", "error", "-show_entries", "format=duration",
          "-of", "default=nw=1:nk=1", src,
        ])
      );
      if (Number.isFinite(d) && d > 0 && d < 2) at = d / 2;
    } catch {
      at = 0;
    }

    /* Temp name then rename, because ffmpeg writes progressively: a run killed
       partway leaves a file that exists, is non-empty, and is newer than its
       source — exactly what isCurrent() calls current, so the next run would
       skip a truncated image forever. */
    const tmp = path.join(outDir, `.${id}.${process.pid}.tmp.jpg`);
    try {
      await run(opt.ffmpeg, thumbArgs(src, tmp, at));
      fs.renameSync(tmp, out);
      built++;
      done++;
      console.log(
        `  ${String(done).padStart(3)}/${tasks.length}  ${id}.jpg  ${bytes(fs.statSync(out).size)}`
      );
    } catch (e) {
      try {
        fs.unlinkSync(tmp);
      } catch {}
      done++;
      failures.push(`${id}: ${e.message}`);
      console.log(`  ${String(done).padStart(3)}/${tasks.length}  ${id}  FAILED`);
    }
  }

  /* A shared cursor rather than fixed chunks: the clips differ in length by 40x,
     so chunking leaves workers idle behind one long file. */
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(opt.jobs, tasks.length) }, async () => {
      while (cursor < tasks.length) await build(tasks[cursor++]);
    })
  );

  const written = fs.readdirSync(outDir).filter((f) => f.endsWith(".jpg"));
  const total = written.reduce((n, f) => n + fs.statSync(path.join(outDir, f)).size, 0);

  console.log(`\n  DONE  ${built} built, ${skipped} already current`);
  console.log(`        ${written.length} thumbnail(s) in ${outDir}, ${bytes(total)}`);
  if (failures.length) {
    console.log(`\n  ${failures.length} FAILED:`);
    for (const f of failures) console.log(`    ${f}`);
    process.exitCode = 1;
  }
  console.log();
}

main().catch((e) => die(e.message));
