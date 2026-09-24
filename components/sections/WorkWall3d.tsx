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

/* THE WORK — A REAL WEBGL WALL, WITH THE VISITOR STANDING INSIDE IT.

   EVERY EARLIER VERSION WAS CSS PRETENDING. `perspective` and `rotateY` give you
   a projected rectangle and nothing else: no depth buffer, no per-fragment
   anything, and — the reason the drum and the corridor both had to make every
   tile inert — a hit-test that is computed against the element's UNTRANSFORMED
   box. A rotated tile in CSS is clickable somewhere it is not drawn.

   THIS IS ACTUAL 3D. Thirty-nine planes on a concave cylindrical arc with the
   camera at its centre, so the wall curves AROUND the visitor rather than
   receding away from them. Dragging turns the wall; the panels at the edges of
   the arc are genuinely angled away and genuinely further from the camera. And
   picking is done with a RAYCAST against the real geometry, so a panel is
   clickable exactly where its pixels are, at any angle. The bug that made four
   CSS versions inert does not exist in a renderer.

   ── WHY THIS IS CHEAP, WHICH IS NOT OBVIOUS ─────────────────────────────────

   THIRTY-NINE POSTER TEXTURES, AND AT MOST ONE VIDEO TEXTURE. That ratio is the
   whole performance story. A still texture is uploaded to the GPU once and then
   costs nothing but a draw call. A VIDEO texture has to be re-uploaded EVERY
   FRAME — that is what made ninety-six autoplaying tiles the most expensive
   thing on this page — so exactly one exists here, on the panel under the
   pointer, and it is disposed the moment the pointer leaves.

   THIRTY-NINE DRAW CALLS IS NOTHING. Instancing with a texture atlas would cut
   it to one and would mean packing every poster into a single sheet at build
   time, re-packing whenever the folder changes, and losing per-panel lazy
   loading. Not worth it at this count. If the library ever reaches the low
   hundreds, an atlas is the next move.

   MeshBasicMaterial, NO LIGHTS, NO SHADOWS. The panels are screens: they emit
   rather than receive. Basic material means no lighting maths per fragment and
   no shadow pass, and the depth falloff at the arc's edges is done by tinting
   each material's colour ONCE at build time rather than by a light.

   THE LOOP STOPS WHEN NOBODY IS LOOKING. An IntersectionObserver cancels the
   rAF when the section leaves the viewport, and the renderer is not ticked
   again until it returns. A WebGL canvas left running off screen is the same
   mistake as an off-screen marquee, and more expensive.

   ANTIALIAS IS OFF and the device pixel ratio is capped at 2. On a wall of
   photographic panels neither is visible, and both are the usual reason a
   canvas section drops frames on a retina laptop.

   ── EVERYTHING IS DISPOSED ──────────────────────────────────────────────────

   Geometry, every material, every texture, the video element and the renderer
   itself are released on unmount. WebGL contexts are a limited resource — a
   browser will drop the OLDEST context when a page opens too many — and React
   in development mounts every effect twice, so a component that leaks one leaks
   one per navigation until the canvas goes blank. */

const LIBRARY = content.reels.videos;
const ALL = takeReels(LIBRARY, 0, LIBRARY.length);

const ROWS = 3;
const COLS = Math.ceil(ALL.length / ROWS);

/* THE ARC. Panel size is in world units and the radius is derived from it: the
   columns have to sit shoulder to shoulder around the curve, so the angular step
   is (panel + gap) / R. Change the panel and the wall re-forms itself. */
const PANEL_W = 1.0;
const PANEL_H = PANEL_W * (16 / 9);
const GAP_X = 0.1;
const GAP_Y = 0.1;
const RADIUS = 7.6;
const STEP = (PANEL_W + GAP_X) / RADIUS;

/* How far the wall can be turned. The camera sees roughly 60 degrees of a
   110-degree arc, so the drag range is what is left over — enough to reach
   either end and no further, so it can never be swung round to face its own
   back. */
const SWING = Math.max(0, (STEP * (COLS - 1)) / 2);

const DPR_CAP = 2;

export function WorkWall3D() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Reel | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  /* The click handler runs inside the renderer's own listener, which is outside
     React's render cycle, so the reel it needs is read from a ref rather than
     captured. */
  const openRef = useRef(setOpen);
  openRef.current = setOpen;

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
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.domElement.className = "block size-full touch-pan-y";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      host.clientWidth / Math.max(1, host.clientHeight),
      0.1,
      100
    );
    camera.position.set(0, 0, 0.6);

    const wall = new THREE.Group();
    scene.add(wall);

    /* One geometry, shared by every panel. Thirty-nine planes that differ only
       in transform and texture have no business owning thirty-nine copies of the
       same four vertices. */
    const geometry = new THREE.PlaneGeometry(PANEL_W, PANEL_H);
    const loader = new THREE.TextureLoader();
    const meshes: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
    const baseTints: THREE.Color[] = [];

    ALL.forEach((reel, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const theta = (col - (COLS - 1) / 2) * STEP;

      /* Dim with distance from the centre of the arc, baked into the material's
         colour rather than lit. A panel at the far edge is both further away and
         steeply angled, and this is what sells that without a light in the
         scene. */
      const fall = 1 - Math.min(1, Math.abs(theta) / (SWING + STEP)) * 0.55;
      const tint = new THREE.Color(fall, fall, fall);

      const material = new THREE.MeshBasicMaterial({
        color: tint,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(
        RADIUS * Math.sin(theta),
        ((ROWS - 1) / 2 - row) * (PANEL_H + GAP_Y),
        -RADIUS * Math.cos(theta)
      );
      /* Negative theta so the panel's +z normal turns to face the origin — a
         concave wall, not a drum seen from outside. */
      mesh.rotation.y = -theta;
      mesh.userData.index = i;

      wall.add(mesh);
      meshes.push(mesh);
      baseTints.push(tint);

      /* Posters load in their own time; a panel is its tint until one arrives,
         which reads as a wall powering on rather than as a gap. */
      if (reel.poster) loader.load(reel.poster, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        material.map = tex;
        material.needsUpdate = true;
      });
    });

    /* ── THE ONE VIDEO ──────────────────────────────────────────────────────
       Created on demand, moved between panels, and torn down on leave. A second
       one is never allowed to exist. */
    let videoEl: HTMLVideoElement | null = null;
    let videoTex: THREE.VideoTexture | null = null;
    let videoOn = -1;

    const clearVideo = () => {
      if (videoOn >= 0) {
        const m = meshes[videoOn].material;
        m.map = null;
        m.needsUpdate = true;
        /* The poster is re-requested from cache rather than kept in memory: the
           browser has it, and holding thirty-nine decoded rasters to avoid one
           cache hit is the wrong trade. */
        const poster = ALL[videoOn].poster;
        if (poster) loader.load(poster, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          if (videoOn !== meshes[videoOn].userData.index || true) {
            m.map = tex;
            m.needsUpdate = true;
          }
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
      videoEl = document.createElement("video");
      videoEl.src = ALL[i].src;
      videoEl.muted = true;
      videoEl.loop = true;
      videoEl.playsInline = true;
      videoEl.crossOrigin = "anonymous";
      videoEl.play().catch(() => {});
      videoTex = new THREE.VideoTexture(videoEl);
      videoTex.colorSpace = THREE.SRGBColorSpace;
      const m = meshes[i].material;
      m.map = videoTex;
      m.needsUpdate = true;
      videoOn = i;
    };

    /* ── INPUT ──────────────────────────────────────────────────────────────
       Drag turns the wall, and a pointer that has not moved far enough to count
       as a drag is a click. The threshold is what stops a slightly shaky click
       from being swallowed as a gesture. */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let target = 0;
    let current = 0;
    let dragging = false;
    let dragged = 0;
    let lastX = 0;
    let hovered = -1;

    const pick = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(meshes, false)[0];
      return hit ? (hit.object.userData.index as number) : -1;
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      dragged = 0;
      lastX = e.clientX;
      renderer.domElement.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (dragging) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        dragged += Math.abs(dx);
        target = THREE.MathUtils.clamp(target + dx * 0.0022, -SWING, SWING);
        return;
      }
      const i = pick(e);
      if (i !== hovered) {
        hovered = i;
        setHover(i >= 0 ? i : null);
        renderer.domElement.style.cursor = i >= 0 ? "pointer" : "grab";
        if (i >= 0) playOn(i);
        else clearVideo();
      }
    };

    const onUp = (e: PointerEvent) => {
      dragging = false;
      renderer.domElement.releasePointerCapture?.(e.pointerId);
      if (dragged < 6) {
        const i = pick(e);
        if (i >= 0) openRef.current(ALL[i]);
      }
    };

    const onLeave = () => {
      dragging = false;
      hovered = -1;
      setHover(null);
      clearVideo();
    };

    const el = renderer.domElement;
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointerleave", onLeave);

    /* ── THE LOOP, WHICH ONLY RUNS WHEN THE SECTION IS ON SCREEN ────────────── */
    let raf = 0;
    let visible = false;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      current += (target - current) * 0.08;
      wall.rotation.y = current;

      /* The hovered panel leans out of the wall — a real translation along its
         own normal, not a scale. Everything else eases home. */
      for (let i = 0; i < meshes.length; i++) {
        const m = meshes[i];
        const want = i === hovered ? 0.55 : 0;
        const have = m.userData.pop ?? 0;
        const next = have + (want - have) * 0.14;
        m.userData.pop = next;
        const theta = ((i % COLS) - (COLS - 1) / 2) * STEP;
        m.position.x = (RADIUS - next) * Math.sin(theta);
        m.position.z = -(RADIUS - next) * Math.cos(theta);
        const lift = 1 + (next / 0.55) * 0.45;
        m.material.color.copy(baseTints[i]).multiplyScalar(lift);
      }

      renderer.render(scene, camera);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) tick();
      if (!visible && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        clearVideo();
      }
    });
    io.observe(host);

    const ro = new ResizeObserver(() => {
      const w = host.clientWidth;
      const h = Math.max(1, host.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(host);

    return () => {
      io.disconnect();
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointerleave", onLeave);
      clearVideo();
      meshes.forEach((m) => {
        m.material.map?.dispose();
        m.material.dispose();
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
      className={`${SECTION} ${ANCHOR} relative overflow-hidden bg-[radial-gradient(120%_80%_at_50%_-5%,#241d2b,#17141b_70%)] text-[#f5f3f0]`}
    >
      <div className={`${WRAP} mb-[clamp(20px,3vw,40px)]`}>
        <SectionHeading kicker={work.kicker} heading={work.heading} tone="bright" />
        <p
          className={`mt-3 text-center font-mono ${TEXT_META} leading-1.2 tracking-[0.04em] text-ink-dim`}
        >
          {work.sub}
        </p>
      </div>

      {/* THE CANVAS. Full bleed and a fixed viewport height, because the wall's
          scale is set by the camera rather than by the box — a shorter box crops
          the arc instead of shrinking it. */}
      <div
        ref={hostRef}
        className="relative h-[clamp(420px,62svh,720px)] w-full"
        /* The canvas paints its own content; nothing in the DOM sits over it, so
           it needs no stacking context of its own. */
      />

      {/* The read-out lives in the DOM rather than in the scene: text rendered
          into WebGL is a texture, and a texture cannot be selected, translated
          or read by a screen reader. */}
      <div className={`${WRAP} mt-[clamp(18px,2.4vw,32px)] flex flex-wrap items-center gap-4`}>
        <span
          className={`font-mono ${TEXT_META} tabular-nums tracking-[0.06em] text-white/70`}
          aria-live="polite"
        >
          {hover === null ? (
            <>Drag to pan · {String(ALL.length).padStart(2, "0")} reels</>
          ) : (
            <>
              {String(hover + 1).padStart(2, "0")}
              <span className="text-white/35"> / {String(ALL.length).padStart(2, "0")}</span>
            </>
          )}
        </span>
        <span className="h-px flex-1 bg-white/12" />
        <Button
          href={DRIVE_LIBRARY_URL}
          external
          variant="light"
          withArrow
          ariaLabel={work.ctaAria}
        >
          {work.cta}
        </Button>
      </div>

      <p className="sr-only">{work.description}</p>

      {open && <Lightbox reel={open} onClose={() => setOpen(null)} />}
    </section>
  );
}