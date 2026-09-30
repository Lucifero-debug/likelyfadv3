/* T-0088 round 7: How it works, rebuilt from the client lifecycle (Aman msgs
   2754-2767; copy: Alex, alex-steps.md FINAL). Two review options, labelled:
   A = Apple-style sticky scroll, B = inpublic-style cards. Same four scenes
   (StepScenes, built by Astra) and the same motion driver (StepsScrub). */
import type { ReactNode } from "react";
import { content } from "@/lib/content-v6";
import { reelVideos } from "@/lib/reels.generated";
import { Button } from "@/components/ui/Button";
import { SECTION, WRAP, HEAD_GAP } from "@/lib/ui";
import { SceneDM, SceneTrial, SceneRetainer, SceneAds } from "./StepScenes";
import { StepsScrub } from "./StepsScrub";
import { AdRing } from "./AdRing";

const RING_IDS = ["0616", "ai-podcast", "boyfriend-angle-ai", "hoodie-ad-podcast-style", "v2934", "v3057", "v3558", "doctor-in-office-ai-ugc-health-product", "perfume-blind-test-1", "v3183"];

function scenes(): ReactNode[] {
  const posters = RING_IDS.map(id => reelVideos.find(r => r.id === id)?.poster).filter((p): p is string => !!p);
  return [<SceneDM key="1" />, <SceneTrial key="2" />, <SceneRetainer key="3" />, <SceneAds key="4" ring={<AdRing posters={posters} />} />];
}

function Head() {
  const { steps } = content;
  return (
    <div className={`${HEAD_GAP} flex flex-col items-center text-center`}>
      <h2 className="max-w-[16em] text-balance font-display font-bold leading-[1.1] tracking-[-0.022em]">{steps.heading}</h2>
      <p className="v6-how-sub mt-4 max-w-[40ch] font-sans text-ink-soft">{steps.sub}</p>
    </div>
  );
}

function Close() {
  const { steps } = content;
  return (
    <div className="v6-st-close">
      <p className="font-sans">{steps.close}</p>
      <Button contact variant="grad" withArrow className="v6-cta-lg">{steps.cta}</Button>
    </div>
  );
}

const Num = ({ i }: { i: number }) => <span className="v6-st-num">Step {String(i + 1).padStart(2, "0")}</span>;

/** Option A: the step texts scroll; one pinned scene card beside them follows. */
export function HowStepsSticky() {
  const { steps } = content;
  const s = scenes(), s2 = scenes();
  return (
    <section id="how" aria-label="How it works" className={`${SECTION} v6-cta-option bg-paper text-ink`}>
      <div className={WRAP}>
        <p className="v6-option-label"><span>Steps option A</span> Apple-style scroll</p>
        <Head />
        <StepsScrub layout="sticky">
          <div className="v6-st">
            <ol className="v6-st-texts">
              {steps.items.map((it, i) => (
                <li key={it.heading} className="v6-st-step" data-v6s-step={i}>
                  <Num i={i} />
                  <h3 className="font-display font-bold">{it.heading}</h3>
                  <p className="font-sans">{it.sub}</p>
                  {/* Phones: each step carries its own scene inline. */}
                  <div className="v6-st-inline" data-v6s-host data-v6s-inline>{s2[i]}</div>
                </li>
              ))}
            </ol>
            <div className="v6-st-visual" aria-hidden="true">
              <div className="v6-st-pin">
                {s.map((sc, i) => <div key={i} className={`v6-st-layer${i === 0 ? " is-on" : ""}`} data-v6s-host data-v6s-layer={i}>{sc}</div>)}
                <div className="v6-st-rail">{steps.items.map((it, i) => <i key={it.heading} data-v6s-rail className={i === 0 ? "is-on" : ""} />)}</div>
              </div>
            </div>
          </div>
        </StepsScrub>
        <Close />
      </div>
    </section>
  );
}

/** Option B: four cards, inpublic-style; hover replays a scene on desktop, scroll drives it on phones. */
export function HowStepsCards() {
  const { steps } = content;
  const s = scenes();
  return (
    <section id="how-cards" aria-label="How it works, option B" className={`${SECTION} v6-cta-option bg-paper text-ink`}>
      <div className={WRAP}>
        <p className="v6-option-label"><span>Steps option B</span> Cards</p>
        <Head />
        <StepsScrub layout="cards">
          <ol className="v6-cards">
            {steps.items.map((it, i) => (
              <li key={it.heading} className="v6-card" data-v6s-card>
                <div className="v6-card-scene" data-v6s-host data-v6s-inline>{s[i]}</div>
                <Num i={i} />
                <h3 className="font-display font-bold">{it.heading}</h3>
                <p className="font-sans">{it.sub}</p>
              </li>
            ))}
          </ol>
        </StepsScrub>
        <Close />
      </div>
    </section>
  );
}
