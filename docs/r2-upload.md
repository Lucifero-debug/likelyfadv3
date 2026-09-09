# R2 upload runbook

> **Not the current path.** The library is on Vercel Blob — see
> [`blob-store.md`](./blob-store.md). This document is the R2 move, kept because
> it is still the destination worth having (free egress through a custom domain)
> and because nothing in the code has to change to get there: `lib/cdn.ts` reads
> one base, the keys are already deterministic, so R2 is an upload and a variable
> change. Sections 3 and 4 — CORS and why not `*.r2.dev` — are the parts that
> have no Vercel Blob equivalent and are worth reading before committing to it.

The upload half of the Vercel Blob → Cloudflare R2 migration. `npm run sync:videos`
produces the payload in `public/videos/reels/`; everything below is run by hand,
because it needs credentials the repo does not and should not hold.

Placeholders to replace: `<ACCOUNT_ID>`, `<BUCKET>`, `<ACCESS_KEY_ID>`,
`<SECRET_ACCESS_KEY>`, `<CDN_DOMAIN>`.

---

## 1. Configure the R2 remote

R2 speaks the S3 API. Create the API token first in the Cloudflare dashboard —
**R2 → Manage R2 API Tokens → Create API Token**, permission **Object Read & Write**,
scoped to the one bucket.

```bash
rclone config create r2 s3 \
  provider=Cloudflare \
  access_key_id=<ACCESS_KEY_ID> \
  secret_access_key=<SECRET_ACCESS_KEY> \
  endpoint=https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  region=auto \
  acl=private \
  no_check_bucket=true
```

`no_check_bucket=true` matters: rclone otherwise issues a `CreateBucket` before
writing, which an object-scoped R2 token is not permitted to do, and the whole
transfer fails on the first object with a 403.

`acl=private` is correct even though the files are public — R2 has no per-object
ACLs. Public access is a property of the bucket and its custom domain, set in
step 4, not something carried on the objects.

Verify:

```bash
rclone lsd r2:
```

---

## 2. Upload

Two passes, because `Cache-Control` and `Content-Type` are set per-run and the
two media types need different `Content-Type` values.

Both `.mp4` and `.hq.mp4` are `video/mp4`, so one `*.mp4` filter covers them —
`--include "*.mp4"` matches `v2702.hq.mp4` as well as `v2702.mp4`.

**Videos**

```bash
rclone copy public/videos/reels r2:<BUCKET>/reels \
  --include "*.mp4" \
  --header-upload "Cache-Control: public, max-age=31536000, immutable" \
  --header-upload "Content-Type: video/mp4" \
  --s3-no-check-bucket \
  --transfers 8 \
  --checksum \
  --progress
```

**Posters**

```bash
rclone copy public/videos/reels r2:<BUCKET>/reels \
  --include "*.webp" \
  --header-upload "Cache-Control: public, max-age=31536000, immutable" \
  --header-upload "Content-Type: image/webp" \
  --s3-no-check-bucket \
  --transfers 8 \
  --checksum \
  --progress
```

`--checksum` compares by hash rather than by size-and-mtime. Object stores do not
preserve mtime, so without it a re-run re-uploads everything.

`max-age=31536000, immutable` is only safe because the keys are deterministic and
content-addressed by id — `reels/<id>.mp4` for one id is always the same cut. If a
clip is ever re-encoded under the same id, that object must be purged from the
Cloudflare cache explicitly; a year-long immutable cache will not notice on its
own.

**Verify before cutting over:**

```bash
# every local object exists remotely with a matching hash
rclone check public/videos/reels r2:<BUCKET>/reels --checksum

# object count and total size as R2 sees them
rclone size r2:<BUCKET>/reels

# spot-check the headers actually landed
rclone lsjson r2:<BUCKET>/reels --stat -M | head
```

---

## 3. CORS

Set on the bucket: **R2 → your bucket → Settings → CORS Policy**.

```json
[
  {
    "AllowedOrigins": [
      "https://likelyfad.vercel.app",
      "https://<CDN_DOMAIN>"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["Range", "Content-Type"],
    "ExposeHeaders": ["Content-Length", "Content-Range", "Accept-Ranges", "ETag"],
    "MaxAgeSeconds": 86400
  }
]
```

Add the production domain to `AllowedOrigins` when it replaces the `.vercel.app`
placeholder in `lib/site.ts`.

`Range` and the three range-related `ExposeHeaders` are the load-bearing part.
The lightbox seeks, and seeking is a ranged request; without `Accept-Ranges` and
`Content-Range` exposed, a cross-origin player can be forced to refetch a whole
clip to move the playhead.

Worth knowing: plain `<video src>` and `<img src>` load in **no-CORS** mode and do
not strictly require this policy — they will play without it. It is required the
moment anything requests the media with `crossorigin`, `fetch()`, or canvas
access, and it costs nothing to have in place first.

---

## 4. Why not `*.r2.dev`

Every bucket gets a `https://pub-<hash>.r2.dev` URL when you enable public access.
It is for development, and Cloudflare documents it as such. Four reasons it is
wrong here:

1. **It is rate-limited, deliberately and without a published number.** Cloudflare
   throttles r2.dev to discourage production use. A wall that opens 68 objects on
   first paint is close to a worst case for that.
2. **It is not cached at the edge the way a zone is.** Custom-domain traffic runs
   through the normal Cloudflare CDN — Cache Rules, Tiered Cache, the lot. r2.dev
   does not give you that, so you pay origin latency far more often.
3. **You cannot configure it.** No Cache Rules, no WAF, no Transform Rules, no
   header overrides. The `Cache-Control` set at upload is all you get.
4. **The hostname is not yours.** It is derived from the bucket, so it changes if
   the bucket ever does, and it welds the site's asset URLs to one vendor.

**What to set up instead:** a custom domain on the bucket.

- **R2 → your bucket → Settings → Public access → Custom domain → Connect domain**
- Enter `cdn.likelyfad.com` (or whichever subdomain). The zone must already be on
  Cloudflare; the DNS record is created for you.
- Leave the r2.dev URL disabled once the custom domain resolves.

Then set, in Vercel → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_CDN_BASE = https://<CDN_DOMAIN>
```

No trailing slash — `lib/cdn.ts` strips one if present, but the value should be
clean. This is a `NEXT_PUBLIC_*` variable, so it is **inlined at build time**:
setting it does nothing until the next deploy, and changing it requires a rebuild,
not just a restart.

Egress from R2 through a custom domain is free, which is the other half of why
this migration is worth doing.
