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

/* THE WORK — A GLOBE MADE ENTIRELY OF REELS.

   ── WHY THE FIRST GLOBE LOOKED LIKE DEBRIS ──────────────────────────────────

   THIRTY-NINE PANELS ON A SPHERE OF RADIUS 6.2 COVERED TWELVE PER CENT OF IT.
   The surface area is 483 square units; thirty-nine panels of 0.92 x 1.64 are
   fifty-nine. Nine tenths of the globe was empty space, so what rendered was a
   loose ring of pictures rather than a ball.

   THE TINT WAS BAKED AT BUILD TIME AND THE GLOBE SPINS. Each panel's brightness
   was set once from its starting z, so the panels lit as "front" rotated round
   to the back and stayed bright there. The depth cue was actively wrong within
   a second of the animation starting.

   lookAt WAS UNSAFE AT THE POLES. It keeps world up as its reference, and a
   panel at the top of the sphere faces straight up — parallel to that reference
   — which is the degenerate case. Those panels got arbitrary roll.

   ── HOW IT IS SOLID NOW ─────────────────────────────────────────────────────

   THE PANEL SIZE IS SOLVED FROM THE COUNT. Each of N panels owns 4πR²/N of
   surface, and a 9:16 panel of width w has area 1.778w², so w = R√(4π/1.778N).
   At 273 panels on a radius of 6.2 that is almost exactly 1.0 — which is where
   the constant below comes from rather than from taste. Panels tile the sphere
   with a little overlap and no gaps.

   THE LIBRARY REPEATS, seven times over, with materials shared per clip so the
   GPU still holds thirty-nine textures. On a sphere the copies are scattered by
   the golden angle rather than adjacent, and half of them are behind the globe.

   ONLY THE NEAR HEMISPHERE EXISTS, AND IT COSTS NOTHING TO ARRANGE. Every panel
   faces outward, so the far ones present their back faces to the camera and
   MeshBasicMaterial's default FrontSide culls them — they are not drawn and the
   raycaster cannot reach them either. The globe is solid without a single
   depth-sorting decision.

   ORIENTATION IS BUILT FROM A BASIS, NOT FROM lookAt. The panel's normal is its
   own radius; a reference up is chosen away from that normal, and the third
   axis falls out of two cross products. Correct at the poles, correct
   everywhere, and computed once at mount.

   FOG REPLACES THE TINT. It is evaluated per fragment against the CURRENT
   camera distance, so the far side dims as it turns away and brightens as it
   comes round — which is what the baked tint was trying and failing to do.

   ── THE CAMERA IS SOLVED FROM THE VIEWPORT ──────────────────────────────────

   Distance is computed on every resize from the globe's diameter and the
   viewport's real aspect, taking whichever of the width and height constraints
   is tighter. The globe fills the frame on a wide monitor and on a phone, with
   no breakpoint anywhere. */

const LIBRARY = content.reels.videos;
const ALL = takeReels(LIBRARY, 0, LIBRARY.length);

/* Seven copies of the folder — enough to close the surface. */
const COUNT = ALL.length * 7;
const RADIUS = 6.2;

/* Solved, not chosen: the width at which COUNT panels tile a sphere of RADIUS.
   The 1.06 is a deliberate overlap so the flat chords leave no seams. */
const PANEL_W = RADIUS * Math.sqrt((4 * Math.PI) / (1.778 * COUNT)) * 1.06;
const PANEL_H = PANEL_W * (16 / 9);

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const FOV = 50;
const DPR_CAP = 2;
const BG = 0x17141b;

export function WorkSphere3D() {
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
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120);

    const globe = new THREE.Group();
    scene.add(globe);

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

    const geometry = new THREE.PlaneGeometry(PANEL_W, PANEL_H);
    const meshes: THREE.Mesh[] = [];

    /* Reused across the loop rather than allocated per panel. */
    const n = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    const ref = new THREE.Vector3();
    const basis = new THREE.Matrix4();

    for (let i = 0; i < COUNT; i++) {
      /* The golden-angle spiral: y walks evenly pole to pole, the ring radius at
         that height keeps the spacing even, and the irrational angle stops
         successive points lining up into visible spokes. Equal spacing for ANY
         count, which matters when the count is the size of a Drive folder. */
      const yy = 1 - (i / (COUNT - 1)) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - yy * yy));
      const theta = GOLDEN * i;

      n.set(Math.cos(theta) * ring, yy, Math.sin(theta) * ring);

      /* A reference up that is never parallel to the normal — the pole case that
         breaks lookAt. */
      ref.set(0, 1, 0);
      if (Math.abs(n.y) > 0.98) ref.set(0, 0, 1);
      right.crossVectors(ref, n).normalize();
      up.crossVectors(n, right).normalize();
      basis.makeBasis(right, up, n);

      const mesh = new THREE.Mesh(geometry, materials[i % ALL.length]);
      mesh.quaternion.setFromRotationMatrix(basis);
      mesh.position.copy(n).multiplyScalar(RADIUS);
      mesh.userData.reel = i % ALL.length;
      mesh.userData.normal = n.clone();
      globe.add(mesh);
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

    /* ── INPUT: drag spins, and the spin CARRIES after release ────────────── */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let velX = 0;
    let velY = 0;
    let tiltY = -0.1;
    let pressing = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let hovered = -1;
    let hoverMesh: THREE.Mesh | null = null;

    const el = renderer.domElement;
    el.style.cursor = "grab";
    el.style.touchAction = "none";

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
        velX = dx * 0.004;
        velY = dy * 0.002;
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

    /* ── THE CAMERA, SOLVED ───────────────────────────────────────────────── */
    const fit = () => {
      const w = host.clientWidth;
      const h = Math.max(1, host.clientHeight);
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;

      const tan = Math.tan((FOV * Math.PI) / 360);
      const need = RADIUS * 2 * 1.12;
      const forHeight = need / (2 * tan);
      const forWidth = need / (2 * tan * aspect);
      camera.position.z = Math.max(forHeight, forWidth);
      camera.updateProjectionMatrix();

      /* Fog spans exactly the globe, so the far side falls to the background
         and the near face is at full strength — recomputed here because it
         depends on where the camera ended up. */
      scene.fog = new THREE.Fog(
        BG,
        camera.position.z - RADIUS * 0.9,
        camera.position.z + RADIUS * 1.05
      );
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

      if (!pressing) {
        /* Inertia: the throw carries and decays, and a slow drift takes over
           once it has. Stopped while a panel is being read. */
        velX *= 0.94;
        velY *= 0.9;
        if (!reduce && hovered < 0 && Math.abs(velX) < 0.0015) velX = 0.0012;
      }

      globe.rotation.y += velX;
      tiltY = THREE.MathUtils.clamp(tiltY + velY, -0.55, 0.55);
      globe.rotation.x += (tiltY - globe.rotation.x) * 0.1;

      for (const m of meshes) {
        const want = m === hoverMesh ? 1 : 0;
        const have = (m.userData.pop as number) ?? 0;
        if (want === 0 && have < 0.001) continue;
        const k = have + (want - have) * 0.16;
        m.userData.pop = k;
        /* Straight out along its own radius, so the panel lifts off the surface
           toward the viewer rather than sliding across it. */
        m.position.copy(m.userData.normal as THREE.Vector3).multiplyScalar(RADIUS + k * 1.1);
        m.scale.setScalar(1 + k * 0.35);
      }

      renderer.render(scene, camera);
      void dt;
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

      <div ref={hostRef} className="relative h-[clamp(460px,74svh,860px)] w-full" />

      <div className={`${WRAP} mt-[clamp(18px,2.4vw,32px)] flex flex-wrap items-center gap-4`}>
        <span
          className={`font-mono ${TEXT_META} tabular-nums tracking-[0.06em] text-white/70`}
          aria-live="polite"
        >
          {hover === null ? (
            <>Drag to spin · {String(ALL.length).padStart(2, "0")} reels</>
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