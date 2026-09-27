"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LOGOS, logoSrc, logoWidth } from "@/lib/logos";
import { ANCHOR, SECTION, WRAP } from "@/lib/ui";

/* LOGO WALL 05 — THE ARC.  (v7)

   THE ONE WALL THAT BELONGS ON /v7, because /v7 is the WebGL page: an aurora
   under the hero, an orb beside Why Us, a point-field horizon in the footer.
   A flat CSS strip between those would read as the one band that forgot. So
   the nine marks stand on a shallow arc in a Three.js scene, the arc leans
   toward the pointer, and each mark floats on its own slow sine.

   NINE PLANES, NINE TEXTURES, NO VIDEO. This is the cheapest scene on the
   page by a wide margin — nine static uploads and nine draw calls, and the
   loop is cancelled outright when the section leaves the viewport.

   WHITE CARDS, DRAWN AT MOUNT. On a dark ground a black wordmark does not
   exist, and the logos' own colours are never altered — so each logo is drawn
   in its true colours onto a white rounded card on a canvas, and that card
   becomes the texture. One file per brand on disk, nothing recoloured. Lit
   as screens: MeshBasicMaterial with `transparent` so the card's rounded
   corners carry, no lights, no shadows, and no fog on the marks (fog would
   shade their colours) — the depth cue is the arc's foreshortening.

   THE ARC IS THE WORK WALL'S, SCALED DOWN: centre behind the camera, the ends
   bowing away, camera distance SOLVED on resize from the arc's width and the
   viewport's aspect so the row fills the frame at any size. Each plane is
   sized from the logo's measured aspect, so a wide wordmark and a compact one
   sit at the same optical weight — the same rule the CSS walls apply via
   `logoWidth`. */

const COPY = {
  kicker: "Clients",
  heading: "Nine brands, one studio.",
};

const FOV = 46;
/* Half the arc's sweep, in radians. The radius is solved from this and the
   row's length, so the arc stays shallow however many brands are on it — a
   fixed radius let nine marks wrap ~144 degrees, turning the ends edge-on. */
const ARC = 0.45;
const UNIT = 0.032;
const GAP = 1.4;
const DPR_CAP = 2;
const BG = 0x17141b;

export function LogoWall3D() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, DPR_CAP));
    renderer.domElement.className = "block size-full";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    /* Set in fit(), from the camera distance: fixed numbers fogged the ends out. */
    const fog = new THREE.Fog(BG, 14, 34);
    scene.fog = fog;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    const group = new THREE.Group();
    scene.add(group);

    const meshes: THREE.Mesh[] = [];

    /* Load the colour file, lay it on a white card, hand back a texture.
       Done once per logo; the canvas is garbage the moment the texture exists. */
    const cardTexture = (src: string, onReady: (t: THREE.Texture) => void) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const g = c.getContext("2d")!;
        g.fillStyle = "#ffffff";
        g.beginPath();
        g.roundRect(0, 0, c.width, c.height, c.height * 0.08);
        g.fill();
        g.drawImage(img, 0, 0);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        onReady(tex);
      };
      img.src = src;
    };
    const rest: THREE.Vector3[] = [];

    /* Widths in world units from each logo's optical width, laid shoulder to
       shoulder along the arc. The total is what sizes the camera. */
    const widths = LOGOS.map((l) => logoWidth(l) * 1.3 * UNIT);
    const total = widths.reduce((a, b) => a + b, 0) + GAP * (LOGOS.length - 1);

    const RADIUS = total / (2 * ARC);

    let cursor = -total / 2;
    LOGOS.forEach((l, i) => {
      const w = widths[i];
      const h = l.h * 1.3 * UNIT;
      const centre = cursor + w / 2;
      cursor += w + GAP;

      const theta = centre / RADIUS;
      const mat = new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, fog: false, depthWrite: false });
      cardTexture(logoSrc(l), (tex) => {
        mat.map = tex;
        mat.needsUpdate = true;
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      mesh.position.set(RADIUS * Math.sin(theta), 0, -RADIUS * (1 - Math.cos(theta)));
      mesh.rotation.y = theta;
      mesh.userData.phase = i * 0.8;
      group.add(mesh);
      meshes.push(mesh);
      rest.push(mesh.position.clone());
    });

    /* Pointer → lean, one rAF loop. */
    let px = 0;
    let py = 0;
    const el = renderer.domElement;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 2 - 1;
      py = -((e.clientY - r.top) / r.height) * 2 + 1;
    };
    const onLeave = () => {
      px = 0;
      py = 0;
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);

    let baseZ = 10;
    const fit = () => {
      const w = host.clientWidth;
      const h = Math.max(1, host.clientHeight);
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;
      const tan = Math.tan((FOV * Math.PI) / 360);
      /* Fill the width; the row is one line tall so height never binds. */
      baseZ = (total * 1.04) / (2 * tan * aspect);
      /* Fog runs on view depth. The ends sit RADIUS*(1-cos ARC) behind the
         centre, so this dims them a touch for depth without losing them. */
      fog.near = baseZ;
      fog.far = baseZ + 24;
      camera.updateProjectionMatrix();
    };
    fit();

    let raf = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      group.rotation.y += ((reduce ? 0 : px * 0.16) - group.rotation.y) * 0.06;
      group.rotation.x += ((reduce ? 0 : -py * 0.08) - group.rotation.x) * 0.06;
      camera.position.z += (baseZ - camera.position.z) * 0.12;
      camera.lookAt(0, 0, -3);

      if (!reduce) {
        for (let i = 0; i < meshes.length; i++) {
          const m = meshes[i];
          m.position.y = rest[i].y + Math.sin(t * 0.7 + (m.userData.phase as number)) * 0.16;
        }
      }
      renderer.render(scene, camera);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!raf) tick();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
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
      el.removeEventListener("pointerleave", onLeave);
      meshes.forEach((m) => {
        const mat = m.material as THREE.MeshBasicMaterial;
        mat.map?.dispose();
        mat.dispose();
        m.geometry.dispose();
      });
      renderer.dispose();
      el.remove();
    };
  }, []);

  return (
    <section
      id="clients"
      aria-label={COPY.kicker}
      data-nav-dark
      className={`${SECTION} ${ANCHOR} relative overflow-hidden bg-[#17141b] text-[#f5f3f0]`}
    >
      <div className={`${WRAP} mb-[clamp(20px,3vw,40px)]`}>
        <SectionHeading kicker={COPY.kicker} heading={COPY.heading} tone="bright" />
      </div>

      <div ref={hostRef} className="relative h-[clamp(160px,22vw,260px)] w-full" />

      {/* The list, for readers who do not get the canvas. */}
      <ul className="sr-only">
        {LOGOS.map((l) => (
          <li key={l.slug}>{l.name}</li>
        ))}
      </ul>
    </section>
  );
}
