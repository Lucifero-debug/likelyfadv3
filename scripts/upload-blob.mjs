#!/usr/bin/env node
/* PUSH THE REEL LIBRARY INTO A VERCEL BLOB STORE, ON DETERMINISTIC KEYS.

   The counterpart to scripts/sync-videos.mjs, which produces the payload in
   public/videos/reels/ and deliberately does not upload it. This is the upload,
   kept separate for the reason named there: a script that can write to the live
   library is one that can destroy it by accident, so it is never part of a
   transcode run.

     node scripts/upload-blob.mjs [--dry-run] [--only id,id] [--force]

   THE KEYS ARE `reels/<id>.mp4`, `reels/<id>.hq.mp4`, `reels/<id>.webp`, WHICH
   IS THE WHOLE POINT. The previous store was written with `addRandomSuffix`
   on, so every object carried a per-upload token — `0616-dnrEA5oJ2cq…mp4` — and
   a URL could not be derived from an id. That is why the old manifest held 204
   absolute URLs, why a re-sync of one clip rewrote the whole file, and why
   moving stores meant regenerating everything. Here the pathname IS the key,
   `addRandomSuffix` is off, and the base is the only variable — lib/cdn.ts.

   IT SKIPS WHAT IS ALREADY THERE, BY SIZE, VIA ONE LIST CALL. 117 objects and
   1.7 GB over a domestic uplink is not a transfer you want to restart from zero
   because it dropped at 90%. The remote inventory is read once up front and a
   local file whose size matches its remote object is left alone; `--force`
   re-uploads regardless. Size rather than a hash because Blob does not expose a
   content hash to `list()`, and re-reading 1.7 GB locally to compute one would
   cost more than it saves — these are immutable encoder outputs keyed by id, so
   same key plus same size is as strong a signal as it needs to be.

   IT PRINTS THE VALUE FOR NEXT_PUBLIC_CDN_BASE RATHER THAN ASKING YOU FOR IT.
   The store's public origin is not something you have to go and find: it comes
   back on the first `put`, and it is read off the response and echoed at the
   end. The run also cross-checks the manifest and names every id that has no
   object in the store, because a missing object is a URL that is perfectly
   well-formed and completely dead — see scripts/verify-library.mjs.

   THE TOKEN IS READ FROM .env.local AND IS NOT A NEXT_PUBLIC_ VARIABLE.
   BLOB_READ_WRITE_TOKEN grants write access to the whole store; inlining it
   into the client bundle would hand every visitor the ability to overwrite the
   library. It is used here, at build time, on your machine, and nowhere else. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { list, put } from "@vercel/blob";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(REPO, "public", "videos", "reels");
const PREFIX = "reels";

/* A YEAR, AND IT IS ONLY SAFE BECAUSE THE KEYS ARE DETERMINISTIC.
   `reels/<id>.mp4` is always the same cut, so there is nothing to revalidate.
   The trade is the other direction: if a clip is ever re-encoded under an id it
   already had, this header is a promise that caches will hold the old bytes for
   a year. Re-encode under a new id, or purge deliberately.

   Blob turns this into `public, max-age=31536000` — no `immutable` directive,
   which it does not expose. The practical difference is only on a reload, where
   `immutable` suppresses the revalidation request; the year still applies. */
const CACHE_MAX_AGE = 31536000;

/* Above this, `put` switches to a multipart upload: the file goes up in chunks
   that retry individually, so one dropped connection costs a chunk rather than
   the whole object. The hq cuts run to ~40 MB and are the reason this exists. */
const MULTIPART_ABOVE = 16 * 1024 * 1024;

const TYPES = new Map([
  [".mp4", "video/mp4"],
  [".webp", "image/webp"],
]);

function die(msg) {
  console.error(`\n  ERROR  ${msg}\n`);
  process.exit(1);
}

/* Three tiers, because two is not enough here: the posters are ~30 KB and a
   MB-floored formatter renders every one of them as "0.0 MB", which reads as a
   zero-byte file rather than as a small one. */
const bytes = (n) =>
  n >= 1 << 30
    ? `${(n / (1 << 30)).toFixed(2)} GB`
    : n >= 1 << 20
      ? `${(n / (1 << 20)).toFixed(1)} MB`
      : `${(n / (1 << 10)).toFixed(0)} KB`;

/* Node does not read .env files on its own, and this script runs outside Next,
   so the token has to be picked up by hand. .env.local first: that is the file
   Next treats as machine-local and .gitignore already excludes, which is where
   a write token belongs. Existing process.env always wins, so
   `BLOB_READ_WRITE_TOKEN=… npm run upload:blob` overrides the file. */
function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const file = path.join(REPO, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = /^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (!m) continue;
      const key = m[1];
      if (key in process.env) continue;
      let value = m[2].trim();
      if (/^(".*"|'.*')$/s.test(value)) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

/** Ids and flags out of lib/reels.generated.ts — the same parse verify-library
    does, and for the same reason: importing it would pull in lib/cdn.ts. */
function readManifest() {
  const file = path.join(REPO, "lib", "reels.generated.ts");
  const src = fs.readFileSync(file, "utf8");
  const rows = [
    ...src.matchAll(/\{\s*id:\s*"([^"]+)",\s*hq:\s*(true|false),\s*poster:\s*(true|false)\s*\}/g),
  ].map((m) => ({ id: m[1], hq: m[2] === "true", poster: m[3] === "true" }));
  if (!rows.length) {
    die(
      `no entries parsed from lib/reels.generated.ts. If it still holds absolute ` +
        `URLs it is the pre-migration file — run \`npm run sync:videos\` to re-emit it.`
    );
  }
  return rows;
}

/** Every object already in the store under `reels/`, as pathname -> { size, url }. */
async function inventory(token) {
  const found = new Map();
  let cursor;
  do {
    const page = await list({ token, prefix: `${PREFIX}/`, limit: 1000, cursor });
    for (const b of page.blobs) found.set(b.pathname, { size: b.size, url: b.url });
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return found;
}

/* The public origin, recovered from any absolute blob URL by chopping the key
   off the end. Every object in a store shares it, so one URL is enough — and
   reading it back beats hardcoding a host that changes with the store. */
function baseFromUrl(url, key) {
  const suffix = `/${key}`;
  return url.endsWith(suffix) ? url.slice(0, -suffix.length) : new URL(url).origin;
}

async function main() {
  const argv = process.argv.slice(2);
  let only = null;
  let force = false;
  let dryRun = false;
  let concurrency = 4;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--only") only = new Set(argv[++i].split(",").map((s) => s.trim()));
    else if (argv[i] === "--force") force = true;
    else if (argv[i] === "--dry-run") dryRun = true;
    else if (argv[i] === "--concurrency") concurrency = Math.max(1, Number(argv[++i]) || 4);
    else die(`unknown option: ${argv[i]}`);
  }

  loadEnv();
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token && !dryRun) {
    die(
      `BLOB_READ_WRITE_TOKEN is not set.\n\n` +
        `         Vercel dashboard -> Storage -> your Blob store -> the ".env.local" tab,\n` +
        `         then paste the line into .env.local at the repo root. It is a WRITE\n` +
        `         token for the whole store: never commit it, never prefix it NEXT_PUBLIC_.`
    );
  }
  if (!fs.existsSync(DIR)) die(`${path.relative(REPO, DIR)} does not exist — run \`npm run sync:videos\` first.`);

  let files = fs
    .readdirSync(DIR)
    .filter((f) => TYPES.has(path.extname(f).toLowerCase()))
    .sort();
  if (only) {
    files = files.filter((f) => only.has(f.replace(/\.hq\.mp4$|\.mp4$|\.webp$/, "")));
  }
  if (!files.length) die(`nothing to upload in ${path.relative(REPO, DIR)}`);

  const jobs = files.map((f) => ({
    file: f,
    key: `${PREFIX}/${f}`,
    src: path.join(DIR, f),
    size: fs.statSync(path.join(DIR, f)).size,
    type: TYPES.get(path.extname(f).toLowerCase()),
  }));
  const payload = jobs.reduce((n, j) => n + j.size, 0);

  console.log(`\n  UPLOAD  ${jobs.length} objects, ${bytes(payload)} -> blob store\n`);

  const remote = dryRun && !token ? new Map() : await inventory(token);
  if (remote.size) console.log(`  ${remote.size} object(s) already in the store under ${PREFIX}/\n`);

  /* Seeded from whatever is already in the store, so a re-run that uploads
     nothing still ends by telling you the base. Otherwise the second, correct
     run of this script is the one that cannot answer the question it exists to
     answer. */
  let base = null;
  for (const b of remote.values()) {
    base = new URL(b.url).origin;
    break;
  }

  const queue = [...jobs];
  const failures = [];
  let done = 0;
  let uploaded = 0;
  let uploadedBytes = 0;
  let skipped = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      for (;;) {
        const j = queue.shift();
        if (!j) return;
        done++;

        if (!force && remote.get(j.key)?.size === j.size) {
          skipped++;
          continue;
        }
        if (dryRun) {
          process.stdout.write(`  [${String(done).padStart(3)}/${jobs.length}] would upload ${j.key}  ${bytes(j.size)}\n`);
          uploaded++;
          uploadedBytes += j.size;
          continue;
        }

        try {
          const res = await put(j.key, fs.createReadStream(j.src), {
            token,
            access: "public",
            addRandomSuffix: false,
            allowOverwrite: true,
            contentType: j.type,
            cacheControlMaxAge: CACHE_MAX_AGE,
            multipart: j.size > MULTIPART_ABOVE,
          });
          base ??= baseFromUrl(res.url, j.key);
          uploaded++;
          uploadedBytes += j.size;
          process.stdout.write(`  [${String(done).padStart(3)}/${jobs.length}] ${j.key}  ${bytes(j.size)}\n`);
        } catch (e) {
          failures.push({ ...j, error: e.message });
          process.stdout.write(`  [${String(done).padStart(3)}/${jobs.length}] ${j.key}  FAILED: ${e.message}\n`);
        }
      }
    })
  );

  console.log(
    `\n  ${uploaded} ${dryRun ? "to upload" : "uploaded"} (${bytes(uploadedBytes)}), ` +
      `${skipped} already current, ${failures.length} failed`
  );

  if (failures.length) {
    console.error(`\n  ${failures.length} object(s) did not go up:`);
    for (const f of failures.slice(0, 10)) console.error(`    ${f.key}: ${f.error}`);
    if (failures.length > 10) console.error(`    ... and ${failures.length - 10} more`);
  }

  /* WHAT THE MANIFEST ASKS FOR VERSUS WHAT THE STORE NOW HOLDS. Uploading every
     local file is not the same as being able to serve the site: the manifest is
     the list of reels the walls will actually request, and an id in it with no
     object behind it is a dead tile. Named here rather than discovered in
     production. */
  const failedKeys = new Set(failures.map((f) => f.key));
  const have = new Set([...remote.keys(), ...jobs.filter((j) => !failedKeys.has(j.key)).map((j) => j.key)]);
  const gaps = [];
  for (const r of readManifest()) {
    if (!have.has(`${PREFIX}/${r.id}.mp4`)) gaps.push(`${r.id} (tile)`);
    if (r.hq && !have.has(`${PREFIX}/${r.id}.hq.mp4`)) gaps.push(`${r.id} (hq)`);
    if (r.poster && !have.has(`${PREFIX}/${r.id}.webp`)) gaps.push(`${r.id} (poster)`);
  }
  if (gaps.length) {
    console.log(`\n  MANIFEST GAPS — ${gaps.length} object(s) the site will request and the store does not have:`);
    for (const g of gaps.slice(0, 12)) console.log(`    ${g}`);
    if (gaps.length > 12) console.log(`    ... and ${gaps.length - 12} more`);
    console.log(`    Those tiles will 404. Either get the bytes into public/videos/reels`);
    console.log(`    and re-run, or drop the ids from the manifest.`);
  }

  if (base) {
    console.log(`\n  SET THIS, then redeploy — NEXT_PUBLIC_* is inlined at build time:\n`);
    console.log(`    NEXT_PUBLIC_CDN_BASE=${base}\n`);
    console.log(`  Verify once it is live:\n`);
    console.log(`    node scripts/verify-library.mjs --base ${base}\n`);
  } else if (!dryRun) {
    console.log(`\n  Nothing new was uploaded, so no URL came back to read the base from.`);
    console.log(`  Run with --force on one id to get it, or copy it from the Vercel dashboard.\n`);
  }

  if (failures.length) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => die(e.message));
}
