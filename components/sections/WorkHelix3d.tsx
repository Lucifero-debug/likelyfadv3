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

/* THE WORK — A COLUMN OF REELS, WOUND AS ONE CONTINUOUS RIBBON.

   ── WHY THE FIRST HELIX WAS INVISIBLE AS A HELIX ────────────────────────────

   IT HAD 39 PANELS TO COVER 3.5 TURNS AT A RADIUS OF 4.6. That is eleven panels
   around a circumference of 29 units — an arc of 2.6 units between panels that
   were 1.05 wide, so more than half of every ring was empty. The spiral could
   not be read because there was never enough of it on screen at once to trace.

   THE RISE MADE IT WORSE. 13 units of height over 39 panels is a third of a unit
   of vertical step, against panels nearly two units tall, so consecutive panels
   sat almost on top of each other vertically while being far apart
   horizontally. Neither spacing agreed with the panel's own size.

   ── THE GEOMETRY IS NOW DERIVED FROM THE PANEL ──────────────────────────────

   Both spacings come from the panel rather than being chosen next to it:

     AROUND — panels per turn is the circumference divided by the panel's width
     plus a gap, so a ring is tiled shoulder to shoulder with no arithmetic left
     over.

     ALONG — the rise per turn is the panel's HEIGHT plus a gap, so each wrap
     lands directly above the one below and the column has no horizontal seams
     through it.

   The result is a genuinely continuous surface: a ribbon of reels wound up a
   tower, with one spiral seam where the ribbon's own edges meet. It is
   cylindrical, and it is not the drum — a drum was twenty-four panels on a wide
   short barrel with gaps; this is a tiled column twice as tall as it is wide
   that you climb.

   ── THE LIBRARY REPEATS, AS IT DOES IN THE TUNNEL AND THE FIELD ─────────────

   Six turns at fifteen a turn is ninety panels from thirty-nine clips, with
   materials shared per clip so the GPU holds thirty-nine textures. The copies
   are a full turn apart and half of them are behind the column, which is a
   distance no visitor tracks — and the alternative is the empty spiral above.

   ── THE CLIMB IS THE CAMERA, NOT THE COLUMN ─────────────────────────────────

   Moving the column would run it out of panels at one end while the other end
   left frame. Raising the camera travels along something that stays put, and
   clamping to the column's own height means it can never climb off the end.

   FOG DOES THE FAR SIDE. The back half of a cylinder is visible through the
   gaps and would otherwise compete with the front; fog takes it down toward the
   section's background by distance, which is both the depth cue and the reason
   the near face reads as the subject. Cheaper and more correct than the
   per-panel colour maths the first version did every frame. */

const LIBRARY = content.reels.videos;
const ALL = takeReels(LIBRARY, 0, LIBRARY.length);

const PANEL_W = 1.2;
const PANEL_H = PANEL_W * (16 / 9);
const GAP = 0.12;

const RADIUS = 3.3;
/* Derived, not chosen: how many panels of this width fit around this circle. */
const PER_TURN = Math.max(6, Math.round((Math.PI * 2 * RADIUS) / (PANEL_W + GAP)));
/* Derived too: one wrap rises by exactly one panel, so turns stack flush. */
const RISE_PER_TURN = PANEL_H + GAP;
const TURNS = 6;
const COUNT = PER_TURN * TURNS;
const HEIGHT = RISE_PER_TURN * TURNS;

const FOV = 52;
const CAM_DIST = 8.6;
const DPR_CAP = 2;
const BG = 0x17141b;

export function WorkHelix3D() {
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
    /* Starts just past the near face and reaches the back of the column, so the
       far side falls away instead of competing with the front. */
    scene.fog = new THREE.Fog(BG, CAM_DIST - RADIUS + 1.5, CAM_DIST + RADIUS * 1.4);

    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120);
    camera.position.z = CAM_DIST;

    const column = new THREE.Group();
    scene.add(column);

    const loader = new THREE.TextureLoader();
    const materials = ALL.map((reel) => {
      const m = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, fog: true });
      loader.load(reel.poster, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        m.map = tex;
        m.needsUpdate = true;
      });
      return m;
    });

    const geometry = new THREE.PlaneGeometry(PANEL_W, PANEL_H);
    const meshes: THREE.Mesh[] = [];

    for (let i = 0; i < COUNT; i++) {
      /* One continuous parameter: theta walks round and y climbs with it, so
         there are no rings — the panels are a single ribbon. */
      const turn = i / PER_TURN;
      const theta = turn * Math.PI * 2;
      const y = turn * RISE_PER_TURN - HEIGHT / 2;

      const mesh = new THREE.Mesh(geometry, materials[i % ALL.length]);
      mesh.position.set(Math.cos(theta) * RADIUS, y, Math.sin(theta) * RADIUS);
      /* Facing outward from the axis: the normal follows the radius, so one
         rotation about y does it and nothing is recomputed per frame. */
      mesh.rotation.y = Math.PI / 2 - theta;
      mesh.userData.reel = i % ALL.length;
      mesh.userData.base = mesh.position.clone();
      column.add(mesh);
      meshes.push(mesh);
    }

    /* ── THE ONE VIDEO ───────────────────────────────────────────────────── */
    let videoEl: HTMLVideoElement | null = null;
    let videoTex: THREE.VideoTexture | null = null;
    let videoOn = -1;

    const clearVideo = () => {
      if (videoOn >= 0) {
        const m = materials[videoOn];
        m.map = null;
        m.needsUpdate = true;
        loader.load(ALL[videoOn].poster, (tex) => {
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

    /* ── INPUT: drag spins on X and climbs on Y ───────────────────────────── */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let spinTarget = 0;
    let spin = 0;
    let climbTarget = 0;
    let climb = 0;
    let pressing = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let hovered = -1;
    let hoverMesh: THREE.Mesh | null = null;

    const el = renderer.domElement;
    el.style.cursor = "grab";
    /* The column is taller than the frame, so vertical drag has to belong to the
       canvas rather than to the page. */
    el.style.touchAction = "none";

    const limit = HEIGHT / 2 - 1.2;

    const pick = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      return (ray.intersectObjects(meshes, false)[0]?.object as THREE.Mesh) ?? null;
    };

    const onDown = (e: PointerEvent) => {
      pressing = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = "grabbing";
    };

    const onMove = (e: PointerEvent) => {
      if (pressing) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        spinTarget += dx * 0.006;
        climbTarget = THREE.MathUtils.clamp(climbTarget + dy * 0.02, -limit, limit);
        return;
      }
      const mesh = pick(e);
      const i = mesh ? (mesh.userData.reel as number) : -1;
      hoverMesh = mesh;
      if (i !== hovered) {
        hovered = i;
        hoverRef.current(i >= 0 ? i : null);
        el.style.cursor = i >= 0 ? "pointer" : "grab";
        if (i >= 0) playOn(i);
        else clearVideo();
      }
    };

    const onUp = (e: PointerEvent) => {
      pressing = false;
      el.releasePointerCapture?.(e.pointerId);
      el.style.cursor = hovered >= 0 ? "pointer" : "grab";
      /* Under six pixels of travel is a click, not a gesture. */
      if (moved < 6) {
        const mesh = pick(e);
        if (mesh) openRef.current(ALL[mesh.userData.reel as number]);
      }
    };

    const onLeave = () => {
      pressing = false;
      hovered = -1;
      hoverMesh = null;
      hoverRef.current(null);
      clearVideo();
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointerleave", onLeave);

    const fit = () => {
      const w = host.clientWidth;
      const h = Math.max(1, host.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    fit();

    /* ── LOOP ─────────────────────────────────────────────────────────────── */
    let raf = 0;
    let prev = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      const dt = Math.min(0.05, t - prev);
      prev = t;

      /* Slow drift, stopped while a panel is being read. */
      if (!reduce && hovered < 0 && !pressing) spinTarget += dt * 0.07;

      spin += (spinTarget - spin) * 0.08;
      climb += (climbTarget - climb) * 0.07;
      column.rotation.y = spin;
      camera.position.y += (climb - camera.position.y) * 0.1;
      camera.lookAt(0, camera.position.y * 0.85, 0);

      for (const m of meshes) {
        const want = m === hoverMesh ? 1 : 0;
        const have = (m.userData.pop as number) ?? 0;
        if (want === 0 && have < 0.001) continue;
        const k = have + (want - have) * 0.16;
        m.userData.pop = k;
        /* Out along its own radius — a real translation away from the axis, so
           the panel leaves the surface of the column toward the viewer. */
        const b = m.userData.base as THREE.Vector3;
        const push = 1 + (k * 0.9) / RADIUS;
        m.position.set(b.x * push, b.y, b.z * push);
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
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
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

      <div ref={hostRef} className="relative h-[clamp(480px,78svh,880px)] w-full" />

      <div className={`${WRAP} mt-[clamp(18px,2.4vw,32px)] flex flex-wrap items-center gap-4`}>
        <span
          className={`font-mono ${TEXT_META} tabular-nums tracking-[0.06em] text-white/70`}
          aria-live="polite"
        >
          {hover === null ? (
            <>Drag to turn and climb · {String(ALL.length).padStart(2, "0")} reels</>
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