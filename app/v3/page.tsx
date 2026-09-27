import type { Metadata } from "next";
import { Nav } from "@/components/sections/Nav";
import { LogoWall } from "@/components/sections/LogoWall";
import { LogoWall3D } from "@/components/sections/LogoWall3D";
import { LogoWallBoard } from "@/components/sections/LogoWallBoard";
import { LogoWallGrid } from "@/components/sections/LogoWallGrid";
import { LogoWallLedger } from "@/components/sections/LogoWallLedger";
import { LogoWallMarquee } from "@/components/sections/LogoWallMarquee";
import { LogoWallOrbit } from "@/components/sections/LogoWallOrbit";
import { LogoWallScrub } from "@/components/sections/LogoWallScrub";
import { LogoWallSpotlight } from "@/components/sections/LogoWallSpotlight";
import { LogoWallTape } from "@/components/sections/LogoWallTape";
import { HeroTwinWalls } from "@/components/sections/HeroTwinWalls";
import { WhyUs } from "@/components/sections/WhyUs";
import { Work } from "@/components/sections/Work";
import { PricingV4 } from "@/components/sections/PricingV4";
import { Testimonials } from "@/components/sections/Testimonials";
import { FaqV4 } from "@/components/sections/FaqV4";
import { FooterV3 } from "@/components/sections/FooterV3";

/* V3 — the home page with one change: the hero's backdrop is two walls of four
   vertical lanes (HeroTwinWalls) instead of three horizontal rows. Every other
   band is the home page's own component, so it tracks the home page.

   Temporarily stacks every logo-wall variant after the hero, each under a
   labelled strip, so one can be picked side by side. */
export const metadata: Metadata = {
  title: "V3",
  robots: { index: false, follow: false },
};

const LOGO_WALLS = [
  { n: 1, name: "Marquee", from: "v3", Wall: LogoWallMarquee },
  { n: 2, name: "Board", from: "home", Wall: LogoWallBoard },
  { n: 3, name: "Ledger", from: "v2", Wall: LogoWallLedger },
  { n: 4, name: "Grid", from: "v4", Wall: LogoWallGrid },
  { n: 5, name: "Scrub", from: "v5", Wall: LogoWallScrub },
  { n: 6, name: "Spotlight", from: "v6", Wall: LogoWallSpotlight },
  { n: 7, name: "3D", from: "v7", Wall: LogoWall3D },
  { n: 8, name: "Orbit", from: "v8", Wall: LogoWallOrbit },
  { n: 9, name: "Tape", from: "v9", Wall: LogoWallTape },
  { n: 10, name: "Original", from: "unused", Wall: LogoWall },
];

export default function V3Page() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-3 focus:text-[0.85rem] focus:text-paper"
      >
        Skip to content
      </a>
      <Nav centered />

      <main id="main">
        <HeroTwinWalls />
        {LOGO_WALLS.map(({ n, name, from, Wall }) => (
          <div key={name}>
            <div className="flex items-center justify-between gap-4 bg-ink px-4 py-3 font-mono text-[0.8rem] uppercase tracking-wider text-paper">
              <span>
                #{n} — LogoWall{name === "Original" ? "" : name}
              </span>
              <span className="opacity-60">{from}</span>
            </div>
            <Wall />
          </div>
        ))}
        <WhyUs />
        <Work />
        <PricingV4 />
        <Testimonials />
        <FaqV4 />
      </main>

      <FooterV3 />
    </>
  );
}
