import { CDN_ORIGIN } from "./cdn";

/* ============================================================================
   Site constants + the one real outbound action: the X (Twitter) profile.
   Every other link in the UI is a clearly-marked placeholder.
   ========================================================================== */

export const SITE_URL = "https://likelyfad.vercel.app"; // PLACEHOLDER — swap when the custom domain goes live
export const SITE_NAME = "Likelyfad";
export const SITE_TAGLINE = "AI ads that look real";
export const SITE_DESCRIPTION =
  "Likelyfad makes AI video, UGC and statics that look shot on a real set. Fast enough to test every week, clean enough to run straight into paid.";

/* The parent company, named in the footer. */
export const PARENT_COMPANY = "Bright Life Creations";

/* THE FULL REEL LIBRARY, linked from the bottom of the work wall.

   PLACEHOLDER — swap for the real Drive folder link. It is the only thing in
   this feature that cannot be derived from the repo: the wall's clips come from
   a Drive folder by way of scripts/sync-drive-videos.mjs, but nothing checked in
   here records WHICH folder, and a link is not something to guess at. Until it
   is filled in the button points at Drive's own root, which is a dead end for a
   visitor rather than a wrong destination.

   IT MUST BE A LINK ANYONE CAN OPEN. A folder shared "restricted" sends every
   visitor to a request-access screen, which is worse than no button at all —
   set the folder to "anyone with the link can view" before shipping this.

   The `/view` suffix on a Drive folder URL opens the grid of thumbnails rather
   than the list, which is what a wall of vertical video wants. */
export const DRIVE_LIBRARY_URL = "https://drive.google.com/drive/u/0/folders/1agAIHY2kNdPEeobTfdlUnh4PHdHhBSTj"; // PLACEHOLDER — the real folder link goes here

/* Contact CTA → opens the X (Twitter) profile in a new tab. */
export const X_HANDLE = "amanxdesign";

export function contactUrl(): string {
  return `https://x.com/${X_HANDLE}`;
}

/* WHERE EVERY CLIP AND EVERY POSTER ACTUALLY COMES FROM. The reel manifest
   holds ids, not URLs: the library is served from lib/cdn.ts's base (public/
   videos is a gitignored local cache and is never deployed), so the first tile
   on the page is a THIRD-PARTY origin — a fresh DNS lookup, TCP handshake and
   TLS negotiation before a single byte of the first poster, all of it after the
   document has already been parsed.

   Named here so app/layout.tsx can warm it in the head.

   IT IS DERIVED NOW, AND IT USED TO BE A SECOND COPY OF THE HOST. This line
   held the blob store's origin as a literal while lib/reels.generated.ts held
   the same host 204 more times, and the note here said that a store move was
   "the one line that has to follow it". That was the trap: a move had two
   places to change, and missing this one costs nothing visible — the page still
   works, it just warms a host nobody uses and pays the full handshake on the
   real one. Reading it off CDN_ORIGIN means there is no second place left,
   which is what made moving to a new store a one-variable change.

   It is the ORIGIN only, deliberately: preconnect keys on origin, and pointing
   it at a path warms nothing extra. Empty in development, where the base is the
   relative /videos and there is no third party to warm — app/layout.tsx skips
   the hints when it is. */
export const MEDIA_ORIGIN = CDN_ORIGIN;
