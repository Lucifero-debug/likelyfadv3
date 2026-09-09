/* WHERE THE REEL LIBRARY LIVES — one base, resolved once, used by everything.

   The library used to be 204 absolute Vercel Blob URLs baked into
   lib/reels.generated.ts, three per reel, each carrying a random per-sync
   suffix. Moving stores meant rewriting every one of them, and the host was
   ALSO hardcoded a second time in lib/site.ts for the preconnect — so a move
   had two places to miss and no way to notice it had missed one.

   Now the generated file stores ids and flags, this file stores the base, and
   the URLs are derived. A store move is one environment variable — which is
   exactly what the move to the new Vercel Blob store was, and what a later move
   to R2 or any other origin will be.

   IT IS NOT VERCEL-BLOB-SPECIFIC AND SHOULD NOT BECOME SO. The base is any
   origin that serves `reels/<id>.<ext>` over HTTPS. Today it is
   `https://<store>.public.blob.vercel-storage.com`; nothing here knows or cares.

   THE KEYS ARE DETERMINISTIC, WHICH IS THE OTHER HALF OF THE SAME CHANGE:
   `reels/<id>.mp4`, `reels/<id>.hq.mp4`, `reels/<id>.webp`. No suffixes, so a
   re-sync of one clip does not change its URL, and a URL can be predicted from
   an id without reading the manifest. Every id is [a-z0-9-] with no dots, so
   the `.hq.` infix can never be ambiguous.

   NO TRAILING SLASH, EVER. The value is normalised here rather than trusted,
   because a base with a trailing slash and a key without a leading one is the
   classic way to ship 68 URLs with a double slash in them — which Vercel Blob
   and every S3-compatible store treat as a DIFFERENT key and answer with 404.

   AN UNSET VARIABLE IS A BUILD FAILURE IN PRODUCTION, DELIBERATELY.
   `NEXT_PUBLIC_*` is inlined at build time, so an unset value does not throw at
   runtime, it silently interpolates the string "undefined" into all 204 URLs
   and ships a page where nothing loads and nothing errors. That is the exact
   failure this migration is repairing, so it is made loud: the build stops.

   IN DEVELOPMENT IT FALLS BACK TO `/videos`, which is what scripts/sync-videos
   writes into public/. So a fresh clone with no env file runs the whole wall
   off the local cache, and the same code path serves both. */

const RAW = process.env.NEXT_PUBLIC_CDN_BASE;

function resolveBase(): string {
  const trimmed = RAW?.trim();
  if (trimmed) return trimmed.replace(/\/+$/, "");

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_CDN_BASE is not set. It is the origin the reel library is " +
        "served from (e.g. https://cdn.example.com). Without it every clip and " +
        "poster URL would be built from the string 'undefined'."
    );
  }

  /* Dev only: public/videos, written by `npm run sync:videos`. */
  return "/videos";
}

export const CDN_BASE = resolveBase();

/* The origin on its own, for the preconnect in app/layout.tsx — that hint keys
   on origin, so handing it a path warms nothing extra. Empty string when the
   base is the dev-mode relative `/videos`, since there is no third party to
   warm and `<link rel="preconnect" href="">` would be a no-op at best. */
export const CDN_ORIGIN = CDN_BASE.startsWith("http") ? new URL(CDN_BASE).origin : "";

/** Absolute (or dev-relative) URL for a key like `reels/v2702.mp4`. */
export function cdnUrl(key: string): string {
  return `${CDN_BASE}/${key.replace(/^\/+/, "")}`;
}
