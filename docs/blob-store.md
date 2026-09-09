# Standing up a new Vercel Blob store

What to do when the reel library moves to a different Blob store — a new Vercel
account, a new project, or a store that had to be replaced.

The site does not care which store it is. `lib/cdn.ts` builds every URL from one
base and the manifest holds ids rather than URLs, so a move is: upload the
objects under the same keys, change one environment variable, redeploy.

---

## 0. What has to be on disk first

`public/videos/reels/` is the payload. Three files per reel, named by id:

```
<id>.mp4        tile cut, silent, 720w      — what the walls autoplay
<id>.hq.mp4     lightbox cut, with audio    — also what Testimonials picks
<id>.webp       poster
```

`npm run sync:videos` produces them from the Drive masters in `.source-videos/`.
If a reel has no master and no local cut, it cannot be uploaded — see
**Reels with no local bytes** at the bottom, which is currently a live problem.

---

## 1. Create the store and take the token

**Vercel dashboard → Storage → Create → Blob**, then connect it to the project.

From the store's **`.env.local`** tab, copy the `BLOB_READ_WRITE_TOKEN=…` line
into `.env.local` at the repo root (`cp .env.example .env.local` first if it
does not exist). `.gitignore` already excludes it.

That token can overwrite and delete every object in the store. It is used by the
upload script on your machine and nowhere else — the site never reads it,
because the library is public to read. It must never be renamed to anything
starting with `NEXT_PUBLIC_`.

---

## 2. Upload

```bash
npm run upload:blob -- --dry-run     # what would go up, and what the manifest would still be missing
npm run upload:blob
```

Roughly 1.7 GB over 117 objects for the reels that currently have local bytes.

**On PowerShell, call the script directly.** `npm run … -- --flag` does not work
there: PowerShell strips the `--` before npm sees it, and the flags are silently
dropped rather than rejected — a `--dry-run` that quietly becomes a real upload.
Any comma-separated value needs quoting too, or PowerShell splits it into
separate arguments.

```powershell
node scripts/upload-blob.mjs --dry-run
node scripts/upload-blob.mjs --only "0616,v5304"
```

What the script does that matters:

- **`addRandomSuffix: false`.** This is the difference from the old store. Keys
  are `reels/<id>.mp4` exactly, so a URL is predictable from an id, re-uploading
  one clip does not change its URL, and the manifest never has to hold a URL
  again. The previous store was written with suffixes on, which is why moving
  off it meant regenerating 204 URLs.
- **`Cache-Control: max-age=31536000`.** Safe only because the keys are
  deterministic and each one is always the same cut. If a clip is ever re-encoded
  under an id it already had, that object must be purged deliberately — a
  year-long cache will not notice on its own. Prefer a new id.
- **Skips what is already current**, comparing local size against one `list()` of
  the store. An interrupted upload resumes; it does not start over. `--force`
  re-uploads regardless.
- **Multipart above 16 MB**, so a dropped connection costs a chunk rather than a
  40 MB hq cut.
- **Prints the base URL** at the end, read off the response rather than typed in.

---

## 3. Point the site at it

The last lines of the upload name the value. For the store the library is on
today it is:

```
NEXT_PUBLIC_CDN_BASE=https://yxt5gasvzrqh2ein.public.blob.vercel-storage.com
```

That is a public read origin, not a secret — it is in the HTML of every page.
The write token for the same store is not, and lives only in `.env.local`.

Set it in **two** places:

- `.env.local`, if you want a local `next build` to use the store rather than the
  local cache. Leave it out for normal development — the fallback is `/videos`.
- **Vercel → Project → Settings → Environment Variables**, for Production and
  Preview.

No trailing slash. `lib/cdn.ts` strips one, but the value should be clean.

**It is inlined at build time.** Setting or changing it does nothing until the
next deploy. A restart is not enough.

---

## 4. Verify before trusting it

```bash
node scripts/verify-library.mjs --base https://<store-id>.public.blob.vercel-storage.com
```

Every URL the manifest can produce, HEAD-checked, with a ranged GET fallback for
hosts that answer HEAD with 405. It reports dead URLs, wrong content types, weak
`Cache-Control`, and the real total byte count as the server sees it — which is
the number to check against the plan's included storage, not the one on disk.

---

## The 29 reels that are parked

**The manifest is 39 reels. It used to be 68.** The other 29 exist only as
objects in the old, blocked store, which answers every request with
`403 Your store is blocked` — so they could not be uploaded to the new store and
were dropped from the manifest rather than shipped as 404s.

The Drive folder holds 39 masters, so `sync:videos` cannot produce the rest, and
`restore:blob` — which pulls the old objects back down using the URLs recorded in
git history — fails on all of them for the same 403.

**Nothing else had to change to absorb this.** Every id pinned by name — the
hero (`v3532`), the closing clip (`ai-podcast`), the eight testimonial clips, the
four bento clips — is among the 39, so no `?? reelVideos[0]` fallback fired. Two
things did change and are worth knowing:

- **The walls now repeat clips.** The main page has 66 tile slots (18 in
  `ReelWall`, 48 in `Work`) over 39 clips, so `takeReels`' modulo engages and the
  guarantee in `Work.tsx` — that the two walls never run the same clip at once —
  no longer holds. Cosmetic, and it undoes itself when the 29 come back. Do not
  "fix" it by cutting `PER_ROW`: that number is a marquee width sum, not a taste
  call, and the comment above it explains what breaks.
- **The "Ads delivered" stat reads 39**, not 68. It is `reelVideos.length` in
  `lib/v2/data.ts`, `v3` and `v5`, so it follows the manifest automatically.

The 29:

```
6th-august-movesmethod   movesmethod-24th-july   movesmethod-30-july
movesmethod-7th-august   tk-ama008c5-sl0455-sm0053-sc0057
v4812 v4815 v4818 v5247 v5271 v5274 v5277 v5290 v5322 v6105 v6138 v6144
v6201 v6225 v6228 v6231 v6551 v6554 v6833 v6836 v6854 v6875 v7154 v7169
```

**Do not delete the old Vercel account.** The only two routes back both need
those bytes, and one of them needs that account:

1. **Unblock the old store long enough to drain it.** Then, from the repo root:

   ```powershell
   node scripts/restore-from-blob.mjs --ref 6a62d3e   # a commit with the old URL-bearing manifest
   node scripts/upload-blob.mjs                       # only the 87 new objects go up
   ```

   `restore:blob` reads the 204 old URLs out of git history, downloads the exact
   encoded bytes that were live — no re-encoding, no second-generation loss —
   and writes them into `public/videos/reels/` under the new keys. The pinned ref
   matters: once the manifest in `HEAD` is the id-and-flags form, the script has
   no URLs to read and will tell you to pass a pre-migration commit.

2. **Find the masters** for those 29, drop them into `.source-videos/`, then
   `node scripts/sync-videos.mjs`. The filenames must slug to the same ids or
   both walls reorder — `lib/reelOrder.ts` keys display order on the id, and
   `slugify()` in the sync script is the rule.

Either way it ends the same: `sync-videos` re-emits a 68-reel manifest (it will
stop and make you pass `--allow-drift`, which is the guard doing its job),
`upload-blob` skips the 117 objects already in the store and sends only the new
ones, and `verify-library` confirms all 204 resolve.
