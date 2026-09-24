import * as THREE from "three";

/* THE ONE WEBGL STAGE EVERY V7 SCENE MOUNTS INTO.

   Each scene on /v7 (the hero field, the work drum, the footer wave) gets its
   own renderer, and this is the part they would otherwise each write out:
   sizing to the host, a DPR cap, and — the part that matters for the frame
   budget — a render loop that only exists while the canvas is on screen AND the
   scene has asked for it. A scene that is off screen, in a hidden tab, or
   switched off by its owner costs nothing: no rAF is scheduled at all.

   Returns null when WebGL is unavailable, so the caller can fall back to its
   DOM version rather than rendering a blank box. */

export type Stage = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  size: { w: number; h: number };
  /** The owner's own gate, ANDed with visibility. */
  setActive: (on: boolean) => void;
  /** One frame now, loop or not — for reduced motion and texture loads. */
  renderOnce: () => void;
  dispose: () => void;
};

export const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function createStage(
  host: HTMLElement,
  {
    fov = 35,
    dprCap = 1.75,
    antialias = true,
    onFrame,
    onResize,
  }: {
    fov?: number;
    dprCap?: number;
    antialias?: boolean;
    onFrame: (t: number, dt: number) => void;
    onResize?: (w: number, h: number, camera: THREE.PerspectiveCamera) => void;
  }
): Stage | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  const size = { w: 1, h: 1 };

  let visible = false;
  let active = true;
  let pageVisible = !document.hidden;
  let raf = 0;
  let last = 0;
  const start = performance.now();

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    onFrame((now - start) / 1000, dt);
    renderer.render(scene, camera);
    if (visible && active && pageVisible) raf = requestAnimationFrame(frame);
  };

  const sync = () => {
    const run = visible && active && pageVisible;
    if (run && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const resize = () => {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    size.w = w;
    size.h = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    onResize?.(w, h, camera);
    if (!raf) renderer.render(scene, camera);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    sync();
  });
  io.observe(host);

  const onVis = () => {
    pageVisible = !document.hidden;
    sync();
  };
  document.addEventListener("visibilitychange", onVis);

  return {
    renderer,
    scene,
    camera,
    size,
    setActive(on) {
      active = on;
      sync();
    },
    renderOnce() {
      onFrame((performance.now() - start) / 1000, 0);
      renderer.render(scene, camera);
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        mats.forEach((m) => m.dispose());
      });
      renderer.dispose();
      canvas.remove();
    },
  };
}

/* The brand ramp, as linear colours for the shaders: flame, pink, violet. */
export const BRAND = {
  rose: new THREE.Color("#ff6a3d"),
  pink: new THREE.Color("#f0407f"),
  violet: new THREE.Color("#8a4fe0"),
  noir: new THREE.Color("#17141b"),
};
