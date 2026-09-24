"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { content } from "@/lib/content";
import { takeReels } from "@/lib/reelOrder";
import type { Reel } from "@/lib/reels.generated";
import { Button } from "@/components/ui/Button";
import { Lightbox } from "@/components/ui/Lightbox";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DRIVE_LIBRARY_URL } from "@/lib/site";
import { ANCHOR, SECTION, TEXT_META, WRAP } from "@/lib/ui";

const { work } = content;

/* THE WORK — DRIFTING THROUGH A FIELD OF REELS.

   ── WHY THE FIRST DRIFT CAME OUT AS A BLOB ──────────────────────────────────

   IT SPREAD PANELS BY A CONSTANT, AND A FRUSTUM IS NOT A BOX. The old placement
   scattered x and y across a fixed 11 x 6.4 span and nudged it by at most 1.9x
   with depth. But the visible width of a perspective camera grows LINEARLY with
   distance: at eight units out the frame was about twenty-one units across, and
   at thirty-two units out it was eighty-five. A span of twenty-one covered the
   near plane and a fifth of the far one — so everything deep fell into a clump
   in the middle of the screen, which is exactly what the screenshot showed.

   THIRTY-NINE PANELS ALSO CANNOT FILL A VOLUME. They can fill a surface. Spread
   through depth they stop touching, and the count that reads as "a lot" on a
   wall reads as "not many" as debris.

   ── THE TWO FIXES ───────────────────────────────────────────────────────────

   POSITION IS STORED IN FRAME COORDINATES, NOT WORLD ONES. Each panel keeps a
   ux/uy in -0.5..0.5 meaning "this fraction across the frame", and its world x
   and y are derived from the frustum's real width at its own depth. A panel at
   ux = 0.4 sits four tenths out from centre whether it is eight units away or
   forty. The field fills the screen at every depth and at every aspect ratio,
   and the derivation is redone on resize so it holds on a phone too.

   THE LIBRARY REPEATS, AS IT DOES IN THE TUNNEL. A hundred and fifty-six panels
   are drawn from thirty-nine clips with materials shared per clip, so the GPU
   still holds thirty-nine textures. In a field sorted by depth the copies of a
   clip are far apart and behind fog; the alternative is the empty space that
   made the first version fail.

   ── IT IS NOW A FLIGHT, NOT A HOVER ─────────────────────────────────────────

   The camera drifts slowly forward and any panel that passes behind it is sent
   to the back of the field — its ux/uy are kept, so it re-enters at the same
   place in frame and simply comes around again. The field is therefore endless
   without being longer, and nothing is created or destroyed after mount.

   FOG IS THE DEPTH CUE AND THE HORIZON. It takes the far end down to the
   section's own background before the recycling boundary is ever in view, which
   is the same trick the tunnel uses and the reason neither needs to be longer
   than it is.

   THE BREATHING IS A FUNCTION OF TIME, NOT AN INTEGRATION. Each panel's bob is
   sin(t * rate + phase) from its own constants, so nothing accumulates: a
   dropped frame changes nothing, and a tab returning from the background resumes
   where the clock says rather than wherever a sum of deltas landed.

   THE SCATTER IS A SEEDED HASH, NOT Math.random(). Random gives one arrangement
   on the server and another on the client — a visible jump on hydration — and a
   different one on every reload, so a composition could never be judged or
   tuned. */

const LIBRARY = content.reels.videos;
const ALL = takeReels(LIBRARY, 0, LIBRARY.length);

/* Four copies of the folder. Enough to fill the frustum front to back without
   the draw count getting silly. */
const COUNT = ALL.length * 4;

const TALL = 2.0;
const WIDE = TALL * (9 / 16);

/* Depth range, as positive distances from the camera. NEAR is far enough out
   that a panel arriving never fills the screen; FAR is inside the fog. */
const NEAR = 7;
const FAR = 40;
const SPAN = FAR - NEAR;

const SPEED = 1.5;
const FOV = 58;
const DPR_CAP = 2;
const BG = 0x17141b;

/* Deterministic, identical on server and client, and with no relationship
   between neighbouring indices — which is what makes the result read as
   scattered rather than as a sequence. */
function hash(n: number, salt: number) {
  let h = (n + 1) * 374761393 + salt * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

export function WorkDrift3D() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Reel | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const openRef = useRef(setOpen);
  const hoverRef = useRef(setHover);
  openRef.current = setOpen;
  hoverRef.current = setHover;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, DPR_CAP));
    renderer.domElement.className = "block size-full";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(BG, NEAR + 6, FAR);
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120);

    /* ── MATERIALS: ONE PER CLIP, SHARED BY EVERY PANEL SHOWING IT ────────── */
    const loader = new THREE.TextureLoader();
    const materials = ALL.map((reel) => {
      const m = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, fog: true });
      if (reel.poster) loader.load(reel.poster, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        m.map = tex;
        m.needsUpdate = true;
      });
      return m;
    });

    const geometry = new THREE.PlaneGeometry(WIDE, TALL);
    const meshes: THREE.Mesh[] = [];

    for (let i = 0; i < COUNT; i++) {
      const idx = i % ALL.length;
      const mesh = new THREE.Mesh(geometry, materials[idx]);
      mesh.userData.reel = idx;
      /* Frame coordinates, not world ones: "this far across the frame", resolved
         against the frustum's real width at whatever depth the panel is at. */
      mesh.userData.ux = hash(i, 1) - 0.5;
      mesh.userData.uy = hash(i, 2) - 0.5;
      /* Depth is stratified — each panel owns a slice of the range, so the field
         is evenly populated front to back rather than clumping. Only the jitter
         inside the slice is arbitrary. */
      mesh.userData.d = NEAR + SPAN * ((i + hash(i, 3) * 0.9) / COUNT);
      mesh.userData.rate = 0.16 + hash(i, 6) * 0.2;
      mesh.userData.phase = hash(i, 7) * Math.PI * 2;
      /* A few degrees of arbitrary tilt so the field is not a stack of parallel
         billboards — but small, because a plane has no thickness and anything
         near side-on becomes a hairline. */
      mesh.rotation.y = (hash(i, 4) - 0.5) * 0.36;
      mesh.rotation.z = (hash(i, 5) - 0.5) * 0.14;
      scene.add(mesh);
      meshes.push(mesh);
    }

    /* ── THE ONE VIDEO, on the shared material, so every copy of the hovered
       clip plays at once off a single texture. ──────────────────────────── */
    let videoEl: HTMLVideoElement | null = null;
    let videoTex: THREE.VideoTexture | null = null;
    let videoOn = -1;

    const clearVideo = () => {
      if (videoOn >= 0) {
        const m = materials[videoOn];
        m.map = null;
        m.needsUpdate = true;
        const poster = ALL[videoOn].poster;
        if (poster) loader.load(poster, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          m.map = tex;
          m.needsUpdate = true;
        });
      }
      videoTex?.dispose();
      videoTex = null;
      if (videoEl) {
        videoEl.pause();
        videoEl.removeAttribute("src");
        videoEl.load();
        videoEl = null;
      }
      videoOn = -1;
    };

    const playOn = (i: number) => {
      if (i === videoOn || reduce) return;
      clearVideo();
      const el = document.createElement("video");
      el.src = ALL[i].src;
      el.muted = true;
      el.loop = true;
      el.playsInline = true;
      el.crossOrigin = "anonymous";
      el.play().catch(() => {});
      const tex = new THREE.VideoTexture(el);
      tex.colorSpace = THREE.SRGBColorSpace;
      materials[i].map = tex;
      materials[i].needsUpdate = true;
      videoEl = el;
      videoTex = tex;
      videoOn = i;
    };

    /* ── INPUT ────────────────────────────────────────────────────────────── */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let px = 0;
    let py = 0;
    let hovered = -1;
    let hoverMesh: THREE.Mesh | null = null;

    const el = renderer.domElement;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      px = ndc.x;
      py = ndc.y;
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(meshes, false)[0];
      const mesh = (hit?.object as THREE.Mesh) ?? null;
      const i = mesh ? (mesh.userData.reel as number) : -1;
      hoverMesh = mesh;
      if (i !== hovered) {
        hovered = i;
        hoverRef.current(i >= 0 ? i : null);
        el.style.cursor = i >= 0 ? "pointer" : "default";
        if (i >= 0) playOn(i);
        else clearVideo();
      }
    };

    const onClick = () => {
      if (hovered >= 0) openRef.current(ALL[hovered]);
    };

    const onLeave = () => {
      px = 0;
      py = 0;
      hovered = -1;
      hoverMesh = null;
      hoverRef.current(null);
      clearVideo();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("click", onClick);
    el.addEventListener("pointerleave", onLeave);

    /* THE FRUSTUM, RESOLVED ON RESIZE. halfH at unit distance times the aspect
       is all the placement below needs, and it is the only thing that has to
       change when the viewport does. */
    let tanHalf = Math.tan((FOV * Math.PI) / 360);
    let aspect = 1;
    const fit = () => {
      const w = host.clientWidth;
      const h = Math.max(1, host.clientHeight);
      renderer.setSize(w, h, false);
      aspect = w / h;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      tanHalf = Math.tan((FOV * Math.PI) / 360);
    };
    fit();

    /* ── THE LOOP ─────────────────────────────────────────────────────────── */
    let raf = 0;
    let prev = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      const dt = Math.min(0.05, t - prev);
      prev = t;

      /* Travel stops on hover: a panel still coming toward you is one you have
         to chase. */
      const step = reduce || hovered >= 0 ? 0 : SPEED * dt;

      camera.position.x += (px * 1.4 - camera.position.x) * 0.045;
      camera.position.y += (py * 0.9 - camera.position.y) * 0.045;
      camera.lookAt(camera.position.x * 0.35, camera.position.y * 0.35, -FAR * 0.5);

      for (const m of meshes) {
        let d = (m.userData.d as number) - step;
        /* Past the camera: send it to the back. ux and uy are kept, so it
           re-enters at the same place in frame and simply comes round again. */
        if (d < NEAR) d += SPAN;
        m.userData.d = d;

        /* Frame coordinates resolved against the frustum at THIS depth. 0.96 so
           the field runs a little past the edges rather than stopping inside
           them. */
        const halfH = d * tanHalf * 0.96;
        const halfW = halfH * aspect;
        const rate = m.userData.rate as number;
        const phase = m.userData.phase as number;

        const want = m === hoverMesh ? 1 : 0;
        const have = (m.userData.pop as number) ?? 0;
        const k = Math.abs(want - have) < 0.001 ? want : have + (want - have) * 0.16;
        m.userData.pop = k;

        m.position.set(
          (m.userData.ux as number) * 2 * halfW + Math.cos(t * rate * 0.7 + phase) * 0.18,
          (m.userData.uy as number) * 2 * halfH + Math.sin(t * rate + phase) * 0.3,
          -d + k * 2.2
        );
        m.scale.setScalar(1 + k * 0.1);
      }

      renderer.render(scene, camera);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!raf) {
          prev = clock.getElapsedTime();
          tick();
        }
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        clearVideo();
      }
    });
    io.observe(host);

    const ro = new ResizeObserver(fit);
    ro.observe(host);

    return () => {
      io.disconnect();
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("click", onClick);
      el.removeEventListener("pointerleave", onLeave);
      clearVideo();
      materials.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      geometry.dispose();
      renderer.dispose();
      el.remove();
    };
  }, []);

  return (
    <section
      id="work"
      aria-label={work.kicker}
      data-nav-dark
      className={`${SECTION} ${ANCHOR} relative overflow-hidden bg-[#17141b] text-[#f5f3f0]`}
    >
      <div className={`${WRAP} mb-[clamp(20px,3vw,40px)]`}>
        <SectionHeading kicker={work.kicker} heading={work.heading} tone="bright" />
        <p
          className={`mt-3 text-center font-mono ${TEXT_META} leading-1.2 tracking-[0.04em] text-ink-dim`}
        >
          {work.sub}
        </p>
      </div>

      <div ref={hostRef} className="relative h-[clamp(480px,76svh,880px)] w-full" />

      <div className={`${WRAP} mt-[clamp(18px,2.4vw,32px)] flex flex-wrap items-center gap-4`}>
        <span
          className={`font-mono ${TEXT_META} tabular-nums tracking-[0.06em] text-white/70`}
          aria-live="polite"
        >
          {hover === null ? (
            <>Move to look around · {String(ALL.length).padStart(2, "0")} reels</>
          ) : (
            <>
              {String(hover + 1).padStart(2, "0")}
              <span className="text-white/35"> / {String(ALL.length).padStart(2, "0")}</span>
            </>
          )}
        </span>
        <span className="h-px flex-1 bg-white/12" />
        <Button href={DRIVE_LIBRARY_URL} external variant="light" withArrow ariaLabel={work.ctaAria}>
          {work.cta}
        </Button>
      </div>

      <p className="sr-only">{work.description}</p>

      {open && <Lightbox reel={open} onClose={() => setOpen(null)} />}
    </section>
  );
}