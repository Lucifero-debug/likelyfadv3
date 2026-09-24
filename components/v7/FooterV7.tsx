"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FooterV3 } from "@/components/sections/FooterV3";
import { BRAND, createStage, reducedMotion } from "./stage";

/* THE FOOTER — FooterV3, under a horizon.

   A field of points laid flat and rolled by a few slow sine swells, coloured
   across the brand ramp and fading into the noir at the back. The pointer drops
   a ripple where it passes over the field. It is the page's last image and it
   is only decoration: aria-hidden, no copy on it, and the loop only runs while
   the band is on screen. */

const VERT = /* glsl */ `
uniform float uTime;
uniform float uPx;
uniform vec2 uPointer;
uniform float uPointerOn;
uniform vec3 uRose;
uniform vec3 uPink;
uniform vec3 uViolet;
varying vec3 vCol;
varying float vFade;
void main() {
  vec3 p = position;
  float t = uTime;
  float h = sin(p.x * 0.55 + t * 0.6) * 0.35
          + sin(p.z * 0.8 - t * 0.45 + p.x * 0.2) * 0.28
          + sin((p.x + p.z) * 1.4 + t * 1.1) * 0.08;
  float d = distance(p.xz, uPointer);
  h += uPointerOn * sin(d * 3.2 - t * 5.0) * 0.22 * exp(-d * 0.55);
  p.y += h;

  float k = clamp(p.x / 18.0 + 0.5, 0.0, 1.0);
  vCol = k < 0.5 ? mix(uRose, uPink, k * 2.0) : mix(uPink, uViolet, (k - 0.5) * 2.0);
  vCol *= 0.7 + h * 0.6;
  vFade = smoothstep(-9.0, -2.0, p.z) * (1.0 - smoothstep(0.5, 3.5, p.z));

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uPx * (8.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vCol;
varying float vFade;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.15, d) * vFade;
  gl_FragColor = vec4(vCol * a, a);
  #include <colorspace_fragment>
}`;

const COLS = 140;
const ROWS = 56;

export function FooterV7() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const still = reducedMotion();

    const pointer = new THREE.Vector2(0, 0);
    const pointerTarget = new THREE.Vector2(0, 0);
    const on = { value: 0 };
    let onTarget = 0;

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uPx: { value: 2 },
        uPointer: { value: pointer },
        uPointerOn: on,
        uRose: { value: BRAND.rose },
        uPink: { value: BRAND.pink },
        uViolet: { value: BRAND.violet },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const stage = createStage(host, {
      fov: 40,
      dprCap: 1.5,
      antialias: false,
      onFrame: (t, dt) => {
        mat.uniforms.uTime.value = still ? 4 : t;
        pointer.lerp(pointerTarget, Math.min(1, dt * 5));
        on.value += (onTarget - on.value) * Math.min(1, dt * 3);
      },
      onResize: (w, h) => {
        mat.uniforms.uPx.value = Math.max(1.5, Math.min(w, h * 3) / 520) * Math.min(window.devicePixelRatio || 1, 1.5);
      },
    });
    if (!stage) return;

    const pos = new Float32Array(COLS * ROWS * 3);
    let k = 0;
    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS; i++) {
        pos[k++] = (i / (COLS - 1) - 0.5) * 18;
        pos[k++] = 0;
        pos[k++] = (j / (ROWS - 1)) * 16 - 10;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    stage.scene.add(points);
    stage.camera.position.set(0, 2.4, 6.5);
    stage.camera.lookAt(0, 0.9, -3);

    /* Pointer → a point on the y=0 plane, which is where the ripple centres. */
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    const ndc = new THREE.Vector2();
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      ray.setFromCamera(ndc, stage.camera);
      if (ray.ray.intersectPlane(plane, hit)) {
        pointerTarget.set(hit.x, hit.z);
        onTarget = 1;
      }
    };
    const onLeave = () => {
      onTarget = 0;
    };

    if (still) {
      stage.setActive(false);
      stage.renderOnce();
    } else {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
    }

    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      stage.dispose();
    };
  }, []);

  return (
    <div data-nav-dark className="bg-noir">
      <div
        ref={hostRef}
        aria-hidden
        className="relative h-[clamp(160px,22vw,300px)] overflow-hidden"
      />
      <FooterV3 />
    </div>
  );
}
