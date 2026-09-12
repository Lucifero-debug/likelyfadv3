#!/usr/bin/env node
/* THE REEL SYNC — Drive folder in, public/videos cache + lib/reels.generated.ts out.

   Replaces scripts/sync-drive-videos.mjs, which the repo referenced but did not
   contain. What it does NOT do is upload: R2 needs credentials, and a script
   that can push to the CDN is a script that can overwrite the live library by
   accident. Uploading is a separate, deliberate step — see docs/r2-upload.md.

   THREE STAGES, EACH SKIPPABLE, BECAUSE THEY FAIL FOR DIFFERENT REASONS.
   Fetching needs the network and an rclone remote; transcoding needs ffmpeg and
   an hour; emitting needs neither. Wiring them into one unskippable pass means
   a network blip costs you the transcode you already paid for.

     1. FETCH   rclone copy <remote> -> <source dir>          (--remote)
     2. BUILD   ffmpeg: tile cut, hq cut, poster              (default)
     3. EMIT    lib/reels.generated.ts                        (default)

   IDEMPOTENT BY MTIME, NOT BY A LEDGER. An output is current when it exists and
   is newer than the source it came from; current outputs are skipped. There is
   no state file to go stale and no run id anywhere in the output, so a second
   run transcodes nothing and produces no diff. `--force` re-encodes everything.

   THE ID IS THE WHOLE CONTRACT. lib/reelOrder.ts keys both walls' display order
   on it, so a filename that slugs differently than it did before silently
   reshuffles the site. This script refuses to write a manifest whose ids differ
   from the current one unless you say `--allow-drift`, and prints the diff
   either way. */

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeReels, GENERATED_PATH } from "./emit-reels.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ---------------------------------------------------------------------------
   ENCODE SETTINGS — the numbers, in one place, with what each is for.

   TILE: what the walls autoplay, 68 of them on one page. CRF 30 is aggressive
   and right: it is a silent, small, moving background element, and 68 of them
   against a 10 GB tier is the constraint that matters more than the last few dB
   of PSNR.

   400 WIDE, AND IT WAS 720 FOR A BOX THAT NO LONGER READS THIS FILE. The 720
   was sized against the 343px testimonial frame at DPR 2 — but Testimonials
   picks `hq ?? src` (components/sections/Testimonials.tsx), and every one of
   the 39 reels in the manifest carries an hq cut, so that frame has not painted
   a tile cut in a long time. Nor has the lightbox, nor the v5/v6/v7 bleeds,
   which resolve the same way. What is actually left on this file is wall tiles:
   158px in the hero wall, 146px in Work, and nothing else.

   SO THE WORST CASE IS A PHONE, NOT A DESKTOP. Work's tile is
   clamp(112px,33vw,146px) below `tab`, which reaches its 146px cap on any
   viewport past 442px; at DPR 3 that is 438 device px. A DPR 2 laptop asks for
   335 at most (158px, plus the ~1.06 the wall's translateZ magnifies the near
   column by). 400 covers the desktop case outright and lands just under the
   highest-density phones — see the note on what that costs, below.

   WHAT THE 720 COST, MEASURED. ffprobe on a shipped tile cut: 720x1280 at
   541kbps, averaging 2.38 MB across the library. A phone parks ~11 of those
   playing at once on the Work wall, which is ~6 Mbps sustained to hold one
   screen of it — and 11 concurrent 720x1280 decodes is past what phone hardware
   decoders carry, so the overflow falls to software and drops frames even on
   wifi. Probed at 390x844 on a 4x CPU throttle against a 4 Mbps line, 9 of 11
   running clips sat at readyState < 3: playing, with nothing buffered. That is
   the stutter, and it is bytes rather than anything in the player.

   RE-ENCODED FROM THE MASTER AT THIS WIDTH, one clip: 1.95 MB -> 0.82 MB, -58%,
   and 31% of the pixel count, which is the half the decoder is paying for.

   THE ONE THING 400 DOES NOT COVER is a DPR 3.5 Android (~412 CSS px wide,
   asking ~476 device px), where the tile is upscaled about 1.19x. On 146px of
   moving video that is not a visible softening; if it ever reads as one, 480 is
   the width that meets it and costs -45% instead of -58%.

   AUDIO IS STRIPPED, NOT MUTED. `-an` removes the track; muting in the player
   would still ship the bytes and still make the element one the browser has to
   treat as audible. 68 unused AAC tracks is real weight for nothing.

   HQ: the lightbox cut, and also what Testimonials picks via `hq ?? src`. Capped
   at 1080 wide rather than scaled TO 1080 — `min(1080,iw)` never upscales a
   source that is smaller, which would spend bytes inventing detail.

   yuv420p AND profile:v high ON BOTH, which is not decoration: 4:2:0 at High is
   the combination every browser and every iOS version decodes in hardware.
   A 4:2:2 or 4:4:4 source passed through untouched plays on a desktop and shows
   a black rectangle on a phone.

   faststart ON BOTH because both are progressive-download. Without it the moov
   atom sits at the end of the file and the browser cannot start playing until
   the whole clip has arrived — which for the wall means nothing moves until
   every tile is fully downloaded. */
const TILE_WIDTH = 400;
const HQ_MAX_WIDTH = 1080;
const TILE_CRF = 30;

/* HQ_CRF WAS 22 AND THAT IS WHAT FILLED THE STORE. 22 at 1080 wide is a
   near-master encode, which was a defensible default back when the library was
   68 short reels. It is not one now: the library is 39 clips averaging 97
   seconds, 25 of them over a minute, and the hq cuts alone came to 1.41 GB of a
   1.68 GB store — 84% of everything, against tile cuts totalling 306 MB.

   Measured on v3583 (94s), re-encoded from the master rather than estimated:
   CRF 22 -> 43.5 MB, CRF 26 -> 26.5 MB, CRF 28 -> 21.3 MB. 26 is the pick at
   -39%, projecting the 1.41 GB of hq down to roughly 860 MB.

   IT IS A LIGHTBOX CUT, NOT A DELIVERABLE. Nobody downloads these; they play
   once in an overlay on top of a dimmed page. 26 is visually near-transparent
   from 22 at this width, and the clips it has to hold up on are AI-generated
   faces and product gradients, which is why this stopped at 26 rather than 28 —
   banding on skin is the first thing to go and the most obvious when it does.

   RAISING IT DOES NOT SHRINK ANYTHING ON ITS OWN. The outputs are keyed on
   mtime by isCurrent(), so an existing hq cut counts as current no matter what
   CRF produced it. Delete or move public/videos/reels/*.hq.mp4 and re-run, which
   rebuilds only the hq variant and leaves tiles and posters alone. */
const HQ_CRF = 26;
const POSTER_QUALITY = 80;

/* HOW MUCH OF EACH CLIP IS KEPT, AND IT IS THE LARGEST DIAL IN THIS FILE.
   Bytes are bitrate times duration, and duration is the half that ran away: the
   library is 39 clips averaging 97 seconds, 25 of them over a minute, the
   longest 4m58s. That is 63 minutes of video behind a wall of tiles, and both
   variants were being encoded end to end.

   Measured at the settings above: hq costs 251 KB per second of video, tile 89
   KB/s. So the whole library is priced per second, and the only lever that
   moves it by a factor rather than a percentage is this one:

     uncapped   39 reels 1181 MB    68 reels 2059 MB
     60s cap    39 reels  779 MB    68 reels 1358 MB
     30s cap    39 reels  389 MB    68 reels  679 MB

   30s is what makes room for the 29 parked reels to come back — see
   docs/blob-store.md — and 68 of them still land under 700 MB.

   NOTHING EVER PLAYED PAST THIS ANYWAY. The tile cut is a silent, 158px,
   autoplaying background element that loops; the hq cut opens in a lightbox
   over a dimmed page. Encoding five minutes of either was paying full price for
   video no visitor reaches.

   THE MASTERS ARE UNTOUCHED. .source-videos/ still holds the full-length files,
   so raising or dropping this is a re-run, not a re-shoot.

   IT IS AN OUTPUT OPTION, placed after -i on both encoders. Before -i it would
   be an input limit, which reads the same here but does not survive someone
   later adding an -ss seek above it. */
const CLIP_SECONDS = 30;

/* THREADS PER ffmpeg, AND IT IS A MEMORY DIAL RATHER THAN A SPEED ONE.
   Left alone, x264 picks about 1.5 threads per core and each one holds its own
   reference and lookahead frames. On a 1080x1920 10-bit source that came to
   ~1GB per process, and two of those on a 16GB laptop that is already running
   an editor and a browser is how this job got killed by the OS twice. Capping
   threads caps the frame buffers. It costs wall-clock, not quality — CRF is
   unchanged, so the output is the same picture, encoded by fewer workers.

   Set on BOTH sides of -i on purpose: before it, it bounds the HEVC decoder;
   after it, the x264 encoder. Specifying it once only binds one of them. */
let THREADS = 4;

const tileArgs = (src, out) => [
  "-y", "-loglevel", "error", "-nostdin",
  "-threads", String(THREADS),
  "-i", src,
  "-threads", String(THREADS),
  "-map", "0:v:0",
  "-vf", `scale=${TILE_WIDTH}:-2`,
  "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
  "-crf", String(TILE_CRF), "-preset", "slow", "-g", "60",
  "-t", String(CLIP_SECONDS),
  "-an",
  "-movflags", "+faststart",
  out,
];

/* `0:a:0?` — the trailing ? makes the audio stream OPTIONAL. Several of these
   sources are silent screen recordings, and without it ffmpeg exits 1 on every
   one of them rather than producing a video-only hq cut. */
const hqArgs = (src, out) => [
  "-y", "-loglevel", "error", "-nostdin",
  "-threads", String(THREADS),
  "-i", src,
  "-threads", String(THREADS),
  "-map", "0:v:0", "-map", "0:a:0?",
  "-vf", `scale='min(${HQ_MAX_WIDTH},iw)':-2`,
  "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
  "-crf", String(HQ_CRF), "-preset", "slow",
  "-t", String(CLIP_SECONDS),
  "-c:a", "aac", "-b:a", "128k",
  "-movflags", "+faststart",
  out,
];

/* `-ss` BEFORE `-i` is the fast seek, and the frame it lands on is the nearest
   keyframe rather than the exact timestamp. That is what we want here — a
   poster is a representative frame, not a specific one, and the accurate seek
   costs a decode of everything up to it, 68 times. */
const posterArgs = (src, out, at) => [
  "-y", "-loglevel", "error", "-nostdin",
  "-ss", String(at),
  "-threads", String(THREADS),
  "-i", src,
  "-frames:v", "1",
  "-vf", `scale=${TILE_WIDTH}:-2`,
  "-c:v", "libwebp", "-quality", String(POSTER_QUALITY),
  out,
];

/* ---------------------------------------------------------------------------
   THE SLUG RULE, reverse-engineered from the 68 ids the old pipeline produced.

   Every one of them is [a-z0-9-]: no uppercase, no underscores, no dots, no
   leading or trailing hyphen. The rule that reproduces all 68 is the obvious
   one — drop the extension, lowercase, collapse every run of anything that is
   not a letter or digit into a single hyphen, trim.

   It round-trips the three shapes in the library:
     TK_AMA008C5_SL0455_SM0053_SC0057.mp4 -> tk-ama008c5-sl0455-sm0053-sc0057
     6th August MovesMethod.mp4           -> 6th-august-movesmethod
     V2702.MOV                            -> v2702

   NFKD FIRST so that an accented character decomposes and its base letter
   survives rather than the whole character becoming a hyphen. None of the
   current 68 need it; a future filename might, and losing a letter silently is
   the kind of drift this script exists to catch. */
export function slugify(filename) {
  return path
    .basename(filename, path.extname(filename))
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const VIDEO_EXT = new Set([".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi"]);

/* --------------------------------------------------------------------------- */

function parseArgs(argv) {
  const o = {
    source: ".source-videos",
    out: "public/videos",
    remote: null,
    rootFolderId: null,
    driveUrl: null,
    force: false,
    check: false,
    allowDrift: false,
    noEmit: false,
    jobs: Math.max(2, Math.min(4, Math.floor(os.cpus().length / 2))),
    threads: 4,
    limit: 0,
    ffmpeg: process.env.FFMPEG_PATH || "ffmpeg",
    ffprobe: process.env.FFPROBE_PATH || "ffprobe",
    rclone: process.env.RCLONE_PATH || "rclone",
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--source") o.source = next();
    else if (a === "--out") o.out = next();
    else if (a === "--remote") o.remote = next();
    else if (a === "--root-folder-id") o.rootFolderId = next();
    else if (a === "--drive-url") o.driveUrl = next();
    else if (a === "--jobs") o.jobs = Math.max(1, Number(next()) || 1);
    else if (a === "--threads") o.threads = Math.max(1, Number(next()) || 1);
    else if (a === "--limit") o.limit = Math.max(0, Number(next()) || 0);
    else if (a === "--ffmpeg") o.ffmpeg = next();
    else if (a === "--ffprobe") o.ffprobe = next();
    else if (a === "--rclone") o.rclone = next();
    else if (a === "--force") o.force = true;
    else if (a === "--check") o.check = true;
    else if (a === "--allow-drift") o.allowDrift = true;
    else if (a === "--no-emit") o.noEmit = true;
    else if (a === "--help" || a === "-h") o.help = true;
    else die(`unknown option: ${a}  (try --help)`);
  }
  return o;
}

const HELP = `
sync-videos — rebuild the reel library cache and lib/reels.generated.ts

  npm run sync:videos -- [options]

FETCH (optional; skipped unless --remote is given)
  --remote <spec>        rclone source, e.g. "gdrive:" or "gdrive:Reels"
  --root-folder-id <id>  Drive folder id, for a link-shared folder
  --drive-url <url>      a Drive folder URL; the id is parsed out of it

BUILD / EMIT
  --source <dir>         source videos            (default .source-videos)
  --out <dir>            transcode cache          (default public/videos)
  --force                re-encode even when outputs are current
  --check                report ids and plan, transcode nothing
  --allow-drift          write the manifest even if the id set changed
  --no-emit              transcode only; leave lib/reels.generated.ts alone
  --jobs <n>             parallel ffmpeg jobs
  --threads <n>          threads per ffmpeg (lower = less RAM)
  --limit <n>            stop after n reels that need work (resumable batches)
  --ffmpeg/--ffprobe/--rclone <path>   override binaries (or FFMPEG_PATH etc.)

This script never uploads. The upload runbook is docs/r2-upload.md.
`;

function die(msg) {
  console.error(`\n  ERROR  ${msg}\n`);
  process.exit(1);
}

function run(bin, args, { quiet = false } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { stdio: quiet ? ["ignore", "pipe", "pipe"] : "inherit" });
    let err = "";
    if (quiet) {
      p.stdout.on("data", () => {});
      p.stderr.on("data", (d) => (err += d));
    }
    p.on("error", (e) =>
      reject(new Error(e.code === "ENOENT" ? `${bin} not found on PATH` : e.message))
    );
    p.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${bin} exited ${code}${err ? `\n${err.trim()}` : ""}`))
    );
  });
}

function capture(bin, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.on("error", (e) =>
      reject(new Error(e.code === "ENOENT" ? `${bin} not found on PATH` : e.message))
    );
    p.on("close", (code) => (code === 0 ? resolve(out.trim()) : reject(new Error(`${bin} exited ${code}`))));
  });
}

const bytes = (n) =>
  n >= 1 << 30 ? `${(n / (1 << 30)).toFixed(2)} GB` : `${(n / (1 << 20)).toFixed(1)} MB`;

const sizeOf = (f) => (fs.existsSync(f) ? fs.statSync(f).size : 0);

/** Current is: exists, non-empty, and not older than its source. */
function isCurrent(out, srcMtime, force) {
  if (force || !fs.existsSync(out)) return false;
  const st = fs.statSync(out);
  return st.size > 0 && st.mtimeMs >= srcMtime;
}

/* --------------------------------------------------------------------------- */

async function main() {
  const opt = parseArgs(process.argv.slice(2));
  THREADS = opt.threads;

  if (opt.help) {
    console.log(HELP);
    return;
  }

  const sourceDir = path.resolve(REPO, opt.source);
  const outDir = path.resolve(REPO, opt.out, "reels");

  /* ---- 1. SOURCE --------------------------------------------------------
     `--check` LISTS THE REMOTE INSTEAD OF COPYING IT, which is the whole point
     of having a check mode. The sources are camera masters — 6.45 GB across 68
     of them, one of which is 537 MB — and the question check answers is "do the
     filenames still slug to the ids the site is built on". That is answerable
     from a listing. Downloading half a gigabyte per clip to read its NAME is
     the kind of dry run nobody runs twice. */
  let folderId = opt.rootFolderId;
  if (opt.driveUrl && !folderId) {
    const m = opt.driveUrl.match(new RegExp(String.raw`/folders/([A-Za-z0-9_-]+)`));
    if (!m) die(`could not find a folder id in --drive-url: ${opt.driveUrl}`);
    folderId = m[1];
  }
  if ((opt.driveUrl || opt.rootFolderId) && !opt.remote) {
    die("--drive-url / --root-folder-id need --remote too (the rclone remote name)");
  }
  const driveFlags = folderId ? ["--drive-root-folder-id", folderId] : [];

  let files;
  if (opt.check && opt.remote) {
    console.log(`
  LIST   ${opt.remote}${folderId ? ` (folder ${folderId})` : ""} — listing only, nothing downloaded`);
    const json = await capture(opt.rclone, [
      "lsjson", opt.remote, "--files-only", "-R", ...driveFlags,
    ]).catch((e) => die(`rclone lsjson failed: ${e.message}`));
    files = JSON.parse(json).map((e) => path.posix.basename(e.Path));
  } else {
    if (opt.remote) {
      fs.mkdirSync(sourceDir, { recursive: true });
      const args = ["copy", opt.remote, sourceDir, "--progress", "--transfers", "4", ...driveFlags];
      console.log(`
  FETCH  ${opt.remote}${folderId ? ` (folder ${folderId})` : ""} -> ${opt.source}`);
      console.log(`         ${opt.rclone} ${args.join(" ")}
`);
      await run(opt.rclone, args);
    }
    if (!fs.existsSync(sourceDir)) {
      die(
        `source directory not found: ${opt.source}
` +
          `         pull it first with --remote <rclone-remote>, or point --source at a local copy`
      );
    }
    files = fs
      .readdirSync(sourceDir, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name);
  }

  /* ---- 2. IDS ------------------------------------------------------------ */
  files = files
    .filter((n) => VIDEO_EXT.has(path.extname(n).toLowerCase()))
    .sort();

  if (!files.length) die(`no video files found in ${opt.check && opt.remote ? opt.remote : opt.source}`);

  const byId = new Map();
  const collisions = [];
  for (const f of files) {
    const id = slugify(f);
    if (!id) die(`filename slugs to an empty id: ${f}`);
    if (byId.has(id)) collisions.push([id, byId.get(id), f]);
    else byId.set(id, f);
  }
  if (collisions.length) {
    console.error("\n  TWO SOURCE FILES SLUG TO THE SAME ID — refusing to guess which one wins:\n");
    for (const [id, a, b] of collisions) console.error(`    ${id}\n      ${a}\n      ${b}`);
    die(`${collisions.length} collision(s)`);
  }

  /* Compare against the manifest that is live right now. */
  const generatedPath = path.join(REPO, GENERATED_PATH);
  const previous = fs.existsSync(generatedPath)
    ? [...fs.readFileSync(generatedPath, "utf8").matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1])
    : [];

  const found = [...byId.keys()].sort();
  const prevSet = new Set(previous);
  const missing = previous.filter((id) => !byId.has(id));
  const extra = found.filter((id) => !prevSet.has(id));

  console.log(`\n  IDS    ${files.length} source file(s) -> ${found.length} id(s)`);
  console.log(`         manifest currently has ${previous.length}`);
  console.log(`         round-trip: ${found.length - extra.length}/${previous.length} matched`);

  if (missing.length || extra.length) {
    console.error("\n  ID SET HAS DRIFTED FROM THE MANIFEST.");
    console.error("  lib/reelOrder.ts keys both walls' order on these, so this is not cosmetic.\n");
    if (missing.length) {
      console.error(`    IN MANIFEST, NOT IN DRIVE (${missing.length}):`);
      for (const id of missing) console.error(`      - ${id}`);
    }
    if (extra.length) {
      console.error(`\n    IN DRIVE, NOT IN MANIFEST (${extra.length}):`);
      for (const id of extra) console.error(`      + ${id}  <- ${byId.get(id)}`);
    }
    if (!opt.allowDrift) {
      die("stopping. Re-run with --allow-drift once you have checked the list above.");
    }
    console.error("\n  --allow-drift given; continuing.\n");
  }

  if (opt.check) {
    console.log("\n  --check given; nothing transcoded.\n");
    return;
  }

  /* ---- 3. BUILD ---------------------------------------------------------- */
  await capture(opt.ffmpeg, ["-version"]).catch(() =>
    die(`ffmpeg not runnable (${opt.ffmpeg}). Install it, or pass --ffmpeg <path> / FFMPEG_PATH.`)
  );

  fs.mkdirSync(outDir, { recursive: true });

  /* Anything left under a .part name is debris from a run that died. It is
     never valid and nothing reads it, but it is confusing to find later.

     THE UNLINK IS ALLOWED TO FAIL, AND ON WINDOWS IT WILL. When the OS kills
     this script it does not kill the ffmpeg processes it spawned — they keep
     running, keep their output handles open, and Windows refuses to unlink an
     open file with EBUSY. Sweeping debris is housekeeping; letting it abort the
     run means one orphan from an earlier crash permanently blocks every future
     sync. The stale file is reported and stepped over. A live orphan is worth
     knowing about anyway: it is holding a gigabyte and finishing an encode
     nothing will ever read. */
  const stuck = [];
  for (const n of fs.readdirSync(outDir)) {
    if (!n.includes(".part.")) continue;
    try {
      fs.unlinkSync(path.join(outDir, n));
    } catch {
      stuck.push(n);
    }
  }
  if (stuck.length) {
    console.log(`  NOTE   ${stuck.length} temp file(s) locked — an ffmpeg from an earlier run is still alive:`);
    for (const n of stuck) console.log(`         ${n}`);
    console.log(`         they will be re-encoded regardless; kill the stray ffmpeg to reclaim its memory`);
  }

  let tasks = [...byId.entries()].sort(([a], [b]) => (a < b ? -1 : 1));

  /* --limit EXISTS BECAUSE A LONG RUN IS A FRAGILE RUN. This transcode is an
     hour of pinned CPU and a gigabyte of resident memory, and anything that
     kills it partway — an OS memory watchdog, a closed terminal, a laptop lid —
     also orphans the ffmpeg it had spawned. Bounded batches finish cleanly and
     leave nothing behind, and because the build is idempotent, N batches of 5
     reach exactly the same place as one batch of 39.

     The cap counts reels that NEED work, not reels seen, so a batch is a real
     unit of progress rather than a scan over things already done. */
  if (opt.limit) {
    const needsWork = ([id, file]) => {
      const src = path.join(sourceDir, file);
      if (!fs.existsSync(src)) return false;
      const m = fs.statSync(src).mtimeMs;
      return (
        !isCurrent(path.join(outDir, `${id}.mp4`), m, opt.force) ||
        !isCurrent(path.join(outDir, `${id}.hq.mp4`), m, opt.force) ||
        !isCurrent(path.join(outDir, `${id}.webp`), m, opt.force)
      );
    };
    const pending = tasks.filter(needsWork);
    const take = pending.slice(0, opt.limit);
    const takeIds = new Set(take.map(([id]) => id));
    console.log(`  LIMIT  ${pending.length} reel(s) need work; doing ${take.length} this batch`);
    tasks = tasks.filter(([id]) => takeIds.has(id));
  }
  let built = 0;
  let skipped = 0;
  let done = 0;

  async function build([id, file]) {
    const src = path.join(sourceDir, file);
    const srcMtime = fs.statSync(src).mtimeMs;
    const tile = path.join(outDir, `${id}.mp4`);
    const hq = path.join(outDir, `${id}.hq.mp4`);
    const poster = path.join(outDir, `${id}.webp`);

    const todo = [];
    if (!isCurrent(tile, srcMtime, opt.force)) todo.push(["tile", tile, (o) => tileArgs(src, o)]);
    if (!isCurrent(hq, srcMtime, opt.force)) todo.push(["hq", hq, (o) => hqArgs(src, o)]);

    if (!isCurrent(poster, srcMtime, opt.force)) {
      /* One second in, unless the clip is shorter than two — then halfway, so a
         very short source still yields a frame rather than a black one past the
         end. Probe failures fall back to 0, which is always inside the file. */
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
      todo.push(["poster", poster, (o) => posterArgs(src, o, at)]);
    }

    if (!todo.length) {
      skipped++;
    } else {
      /* ENCODED TO A TEMP NAME AND RENAMED, WHICH IS NOT BELT AND BRACES.
         ffmpeg writes its output progressively, so a run that is interrupted —
         the OS killing it under memory pressure, a Ctrl-C, a full disk — leaves
         a file that EXISTS, is non-empty, and is newer than its source. That is
         exactly what isCurrent() calls current, so the next run skips it and the
         library ships a truncated video that plays for two seconds and stops.
         It happened: three hq cuts were lost that way. A rename is atomic, so a
         file under its real name is now always a file ffmpeg finished writing.

         The suffix goes BEFORE the extension because ffmpeg picks its muxer
         from the extension — `x.mp4.part` is a format it cannot guess. */
      for (const [, dest, mkArgs] of todo) {
        const tmp = dest.replace(/(.[^.]+)$/, ".part$1");
        await run(opt.ffmpeg, mkArgs(tmp), { quiet: true });
        fs.renameSync(tmp, dest);
      }
      built++;
    }

    done++;
    const tag = todo.length ? todo.map((t) => t[0]).join("+") : "current";
    process.stdout.write(
      `  [${String(done).padStart(3)}/${tasks.length}] ${id.padEnd(42)} ${tag}\n`
    );

    return {
      id,
      hq: fs.existsSync(hq) && fs.statSync(hq).size > 0,
      poster: fs.existsSync(poster) && fs.statSync(poster).size > 0,
    };
  }

  console.log(`\n  BUILD  ${tasks.length} reel(s) -> ${opt.out}/reels  (${opt.jobs} parallel)\n`);

  const entries = [];
  const queue = [...tasks];
  await Promise.all(
    Array.from({ length: Math.min(opt.jobs, queue.length) }, async () => {
      for (;;) {
        const t = queue.shift();
        if (!t) return;
        entries.push(await build(t));
      }
    })
  );

  /* ---- 4. EMIT -----------------------------------------------------------
     `--out` DOES NOT SCOPE THIS, AND THAT IS WHY --no-emit EXISTS. The manifest
     has one home, lib/reels.generated.ts, so a run pointed at a scratch --out
     directory would still rewrite the real one — which is how a one-clip pilot
     ends up claiming the library has one clip in it. Any run that is not the
     authoritative one should pass --no-emit. */
  const changed = opt.noEmit ? false : writeReels(entries, REPO);

  const totals = entries.reduce(
    (acc, e) => {
      acc.tile += sizeOf(path.join(outDir, `${e.id}.mp4`));
      acc.hq += sizeOf(path.join(outDir, `${e.id}.hq.mp4`));
      acc.poster += sizeOf(path.join(outDir, `${e.id}.webp`));
      return acc;
    },
    { tile: 0, hq: 0, poster: 0 }
  );
  const grand = totals.tile + totals.hq + totals.poster;
  const objects = entries.length + entries.filter((e) => e.hq).length + entries.filter((e) => e.poster).length;

  console.log(`\n  DONE   ${built} built, ${skipped} already current`);
  console.log(
    `         ${GENERATED_PATH} ${opt.noEmit ? "untouched (--no-emit)" : changed ? "rewritten" : "unchanged"}`
  );
  console.log(`\n  UPLOAD PAYLOAD  ${objects} objects, ${bytes(grand)}`);
  console.log(`         tiles   ${String(entries.length).padStart(3)}  ${bytes(totals.tile)}`);
  console.log(`         hq      ${String(entries.filter((e) => e.hq).length).padStart(3)}  ${bytes(totals.hq)}`);
  console.log(`         posters ${String(entries.filter((e) => e.poster).length).padStart(3)}  ${bytes(totals.poster)}`);
  console.log(`\n  Nothing was uploaded — that is a separate, deliberate step:`);
  console.log(`    node scripts/upload-blob.mjs --dry-run   (then without it)\n`);
}

/* Only when RUN, not when imported. slugify() is the piece worth testing on its
   own, and importing this file to reach it should not kick off a 68-clip
   transcode as a side effect. */
const invokedDirectly =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((e) => die(e.message));
}
