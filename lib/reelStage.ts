import * as THREE from "three";
import type { Reel } from "@/lib/reels.generated";

/* THE SHARED STAGE FOR EVERY WEBGL REEL SCENE.

   Four variants sit on this, and the ONLY thing that differs between them is
   where a panel goes and what moves each frame. Everything else — context
   creation, texture loading, the one video texture, raycast picking, the
   visibility-gated loop, and disposal — is identical, and duplicating it four
   times would mean fixing every context leak four times.

   ── THE RULES THIS FILE EXISTS TO ENFORCE ───────────────────────────────────

   ONE VIDEO TEXTURE, EVER. A still texture uploads to the GPU once and then
   costs a draw call; a VIDEO texture re-uploads every single frame, which is
   exactly what made ninety-six autoplaying tiles the most expensive thing on
   this page. So exactly one exists, on the panel under the pointer, and it is
   torn down the moment the pointer moves off. No scene may create a second.

   ONE GEOMETRY, SHARED. Panels differ by transform and texture, not by
   vertices.

   MeshBasicMaterial, NO LIGHTS, NO SHADOWS. The panels are screens: they emit
   rather than receive. Basic material means no lighting maths per fragment and
   no shadow pass. Depth falloff is a per-material colour set once, not a light.

   THE LOOP STOPS WHEN THE SECTION LEAVES THE VIEWPORT. A WebGL canvas left
   running off screen is the same mistake as an off-screen marquee and costs
   more. The IntersectionObserver here cancels the rAF and drops the video.

   EVERYTHING IS DISPOSED. WebGL contexts are a limited resource — a browser
   drops the oldest when a page opens too many — and React remounts effects in
   development, so a component that leaks one leaks one per navigation until the
   canvas goes blank.

   ANTIALIAS OFF, DPR CAPPED AT 2. On photographic panels neither is visible,
   and both are the usual reason a canvas section drops frames on a retina
   laptop. */

const DPR_CAP = 2;

export type Placement = {
  x: number;
  y: number;
  z: number;
  rx?: number;
  ry?: number;
  rz?: number;
  /** 0–1 base brightness. The scene's own depth cue; no light does this. */
  tint?: number;
};

export type PanelMesh = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

export type FrameCtx = {
  /** Seconds since the stage started. */
  t: number;
  /** Seconds since the previous frame, clamped so a backgrounded tab cannot
      deliver a single enormous step. */
  dt: number;
  group: THREE.Group;
  camera: THREE.PerspectiveCamera;
  meshes: PanelMesh[];
  base: Placement[];
  tints: THREE.Color[];
  /** Index under the pointer, or -1. */
  hovered: number;
  /** Eased drag offset, in the units the scene asked for. */
  drag: { x: number; y: number };
  /** Pointer in -0.5..0.5 of the canvas, whether or not a panel is under it. */
  pointer: { x: number; y: number };
  reduce: boolean;
};

export type StageOptions = {
  reels: Reel[];
  /** Panel width in world units. Height follows at 9:16. */
  panelW?: number;
  fov?: number;
  cameraZ?: number;
  /** Where each panel sits at rest. Called once per reel at build time. */
  place: (i: number, total: number) => Placement;
  /** Runs every frame. Mutate meshes, the group or the camera here. */
  frame?: (ctx: FrameCtx) => void;
  /** Drag sensitivity per axis, in scene units per pixel. 0 disables the axis. */
  dragX?: number;
  dragY?: number;
  /** Clamp for the eased drag value. */
  rangeX?: number;
  rangeY?: number;
  onOpen: (reel: Reel) => void;
  onHover: (index: number | null) => void;
};

export function createReelStage(host: HTMLElement, o: StageOptions) {
  const {
    reels,
    panelW = 1,
    fov = 55,
    cameraZ = 0,
    place,
    frame,
    dragX = 0,
    dragY = 0,
    rangeX = Infinity,
    rangeY = Infinity,
    onOpen,
    onHover,
  } = o;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, DPR_CAP));
  renderer.setSize(host.clientWidth, Math.max(1, host.clientHeight), false);
  renderer.domElement.className = "block size-full touch-pan-y";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    fov,
    host.clientWidth / Math.max(1, host.clientHeight),
    0.1,
    200
  );
  camera.position.z = cameraZ;

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.PlaneGeometry(panelW, panelW * (16 / 9));
  const loader = new THREE.TextureLoader();
  const meshes: PanelMesh[] = [];
  const base: Placement[] = [];
  const tints: THREE.Color[] = [];

  reels?.forEach((reel, i) => {
    const p = place(i, reels.length);
    const v = p.tint ?? 1;
    const tint = new THREE.Color(v, v, v);
    const material = new THREE.MeshBasicMaterial({ color: tint, toneMapped: false });
    const mesh = new THREE.Mesh(geometry, material) as PanelMesh;
    mesh.position.set(p.x, p.y, p.z);
    mesh.rotation.set(p.rx ?? 0, p.ry ?? 0, p.rz ?? 0);
    mesh.userData.index = i;
    group.add(mesh);
    meshes.push(mesh);
    base.push(p);
    tints.push(tint);

    /* Posters arrive in their own time; a panel is its tint until one lands,
       which reads as a wall powering on rather than as a hole. */
    loader.load(reel.poster, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      material.map = tex;
      material.needsUpdate = true;
    });
  });

  /* ── THE ONE VIDEO ──────────────────────────────────────────────────────── */
  let videoEl: HTMLVideoElement | null = null;
  let videoTex: THREE.VideoTexture | null = null;
  let videoOn = -1;

  const clearVideo = () => {
    if (videoOn >= 0) {
      const m = meshes[videoOn].material;
      const poster = reels[videoOn].poster;
      m.map = null;
      m.needsUpdate = true;
      /* Re-requested from cache rather than held: the browser has it, and
         keeping every decoded raster alive to save one cache hit is the wrong
         trade at this count. */
      loader.load(poster, (tex) => {
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
    el.src = reels[i].src;
    el.muted = true;
    el.loop = true;
    el.playsInline = true;
    el.crossOrigin = "anonymous";
    el.play().catch(() => {});
    const tex = new THREE.VideoTexture(el);
    tex.colorSpace = THREE.SRGBColorSpace;
    const m = meshes[i].material;
    m.map = tex;
    m.needsUpdate = true;
    videoEl = el;
    videoTex = tex;
    videoOn = i;
  };

  /* ── INPUT ──────────────────────────────────────────────────────────────── */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pointer = { x: 0, y: 0 };
  const drag = { x: 0, y: 0 };
  const dragTarget = { x: 0, y: 0 };
  let hovered = -1;
  let pressing = false;
  let moved = 0;
  let lastX = 0;
  let lastY = 0;

  const el = renderer.domElement;
  el.style.cursor = dragX || dragY ? "grab" : "default";

  const pick = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    pointer.x = ndc.x / 2;
    pointer.y = ndc.y / 2;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(meshes, false)[0];
    return hit ? (hit.object.userData.index as number) : -1;
  };

  const onDown = (e: PointerEvent) => {
    pressing = true;
    moved = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    el.setPointerCapture?.(e.pointerId);
  };

  const onMove = (e: PointerEvent) => {
    if (pressing && (dragX || dragY)) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      dragTarget.x = THREE.MathUtils.clamp(dragTarget.x + dx * dragX, -rangeX, rangeX);
      dragTarget.y = THREE.MathUtils.clamp(dragTarget.y + dy * dragY, -rangeY, rangeY);
      return;
    }
    const i = pick(e);
    if (i !== hovered) {
      hovered = i;
      onHover(i >= 0 ? i : null);
      el.style.cursor = i >= 0 ? "pointer" : dragX || dragY ? "grab" : "default";
      if (i >= 0) playOn(i);
      else clearVideo();
    }
  };

  const onUp = (e: PointerEvent) => {
    pressing = false;
    el.releasePointerCapture?.(e.pointerId);
    /* A pointer that barely moved is a click, not a gesture. Six pixels is what
       keeps a slightly shaky click from being swallowed as a drag. */
    if (moved < 6) {
      const i = pick(e);
      if (i >= 0) onOpen(reels[i]);
    }
  };

  const onLeave = () => {
    pressing = false;
    hovered = -1;
    onHover(null);
    clearVideo();
  };

  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointerleave", onLeave);

  /* ── THE LOOP ───────────────────────────────────────────────────────────── */
  let raf = 0;
  let prev = 0;
  const clock = new THREE.Clock();

  const tick = () => {
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    /* Clamped: a backgrounded tab can otherwise deliver one enormous step and
       fling anything integrating dt across the scene. */
    const dt = Math.min(0.05, t - prev);
    prev = t;

    drag.x += (dragTarget.x - drag.x) * 0.08;
    drag.y += (dragTarget.y - drag.y) * 0.08;

    frame?.({ t, dt, group, camera, meshes, base, tints, hovered, drag, pointer, reduce });
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
}

/* The pop-out every scene shares: the hovered panel eases out along its own
   direction from the origin and brightens, everything else eases home. Kept here
   because all four want it and none of them wants to write it. */
export function easeHoverPop(ctx: FrameCtx, distance = 0.5, lift = 0.45) {
  const { meshes, base, tints, hovered } = ctx;
  for (let i = 0; i < meshes.length; i++) {
    const m = meshes[i];
    const want = i === hovered ? 1 : 0;
    const have = (m.userData.pop as number) ?? 0;
    const k = have + (want - have) * 0.14;
    m.userData.pop = k;
    if (k > 0.001 || have > 0.001) {
      const b = base[i];
      const len = Math.hypot(b.x, b.y, b.z) || 1;
      const s = 1 - (k * distance) / len;
      m.position.set(b.x * s, b.y * s, b.z * s);
      m.material.color.copy(tints[i]).multiplyScalar(1 + k * lift);
    }
  }
}