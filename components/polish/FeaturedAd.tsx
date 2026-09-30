import { reelVideos } from "@/lib/reels.generated";
import { FEATURED_REEL_ID } from "./motion";
import { ScrollExpand } from "./reactbits/ScrollExpand";

export function FeaturedAd() {
  // Manifest URLs already use cdnUrl, including the audio-bearing HQ cut.
  const reel = reelVideos.find(({ id }) => id === FEATURED_REEL_ID);
  if (!reel?.poster) throw new Error(`Featured reel needs a poster: ${FEATURED_REEL_ID}`);
  return <ScrollExpand useWindowScroll mediaType="video" src={reel.hq ?? reel.src} poster={reel.poster} />;
}
