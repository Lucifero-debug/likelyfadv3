import * as THREE from "three";
import { BRAND, createStage, reducedMotion } from "./stage";

/* THE HERO FIELD — what the copy lands on.

   In HeroReel the wall blurs and a flat 62% dim fades in over it, so the
   headline arrives against a soft grey-violet nothing. Here the same crossfade
   brings in a LIVING field: a slow domain-warped aurora in the brand ramp, and
   a drift of sparks rising through it, both leaning toward the pointer. The dim
   and blur are still underneath, so contrast is unchanged — this only replaces
   "nothing" with something.

   IT COSTS NOTHING UNTIL THE VISITOR SCROLLS. The level `b` is the hero's blur
   progress; at b = 0 the canvas is transparent and the loop is switched off, so
   the resting hero (the wall playing, the copy peeking) pays for no GL frame. */

const AURORA_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const AURORA_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uLevel;
uniform vec2 uPointer;
uniform vec2 uRes;
uniform vec3 uRose;
uniform vec3 uPink;
uniform vec3 uViolet;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}

void main() {
  vec2 p = vUv;
  p.x *= uRes.x / uRes.y;
  vec2 m = uPointer * 0.18;
  float t = uTime * 0.05;

  vec2 q = vec2(fbm(p * 1.4 + t + m), fbm(p * 1.4 - t + 3.1));
  float n = fbm(p * 1.8 + q * 1.6 + vec2(t * 2.0, -t) + m);

  vec3 col = mix(uViolet, uPink, smoothstep(0.25, 0.65, n));
  col = mix(col, uRose, smoothstep(0.55, 0.9, n + q.x * 0.25));

  /* Ribbons, not fog: a band of the noise is lifted into light. */
  float band = smoothstep(0.42, 0.62, n) * (1.0 - smoothstep(0.62, 0.82, n));
  /* Heavier toward the top and the edges, clear behind the centred copy. */
  float centre = 1.0 - smoothstep(0.0, 0.55, length((vUv - vec2(0.5, 0.48)) * vec2(1.3, 1.0)));
  float a = (0.08 + band * 0.34) * (1.0 - centre * 0.7) * uLevel;

  gl_FragColor = vec4(col * a, a);
  #include <colorspace_fragment>
}`;

const SPARK_VERT = /* glsl */ `
uniform float uTime;
uniform float uPx;
uniform vec2 uPointer;
attribute float aSeed;
varying float vSeed;
varying float vFade;
void main() {
  vSeed = aSeed;
  vec3 p = position;
  /* Each spark rises on its own clock and wraps top to bottom. */
  float speed = 0.12 + aSeed * 0.22;
  p.y = mod(p.y + uTime * speed + 4.0, 8.0) - 4.0;
  p.x += sin(uTime * 0.4 + aSeed * 40.0) * 0.12;
  /* Nearer sparks lean further with the pointer: parallax from one uniform. */
  p.xy += uPointer * (0.15 + (p.z + 3.0) * 0.12);
  vFade = smoothstep(-4.0, -2.6, p.y) * (1.0 - smoothstep(2.6, 4.0, p.y));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uPx * (1.0 + aSeed * 2.2) * (6.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const SPARK_FRAG = /* glsl */ `
precision highp float;
uniform float uLevel;
uniform vec3 uRose;
uniform vec3 uPink;
uniform vec3 uViolet;
varying float vSeed;
varying float vFade;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float glow = smoothstep(0.5, 0.0, d);
  glow *= glow;
  vec3 col = vSeed < 0.33 ? uRose : vSeed < 0.66 ? uPink : uViolet;
  float a = glow * vFade * uLevel * 0.85;
  gl_FragColor = vec4(col * a + vec3(a * 0.35), a);
  #include <colorspace_fragment>
}`;

const SPARKS = 420;

export function mountHeroField(host: HTMLElement) {
  const still = reducedMotion();
  const pointer = new THREE.Vector2();
  const target = new THREE.Vector2();

  const shared = {
    uTime: { value: 0 },
    uLevel: { value: 0 },
    uPointer: { value: pointer },
    uRose: { value: BRAND.rose },
    uPink: { value: BRAND.pink },
    uViolet: { value: BRAND.violet },
  };

  const aurora = new THREE.ShaderMaterial({
    vertexShader: AURORA_VERT,
    fragmentShader: AURORA_FRAG,
    uniforms: { ...shared, uRes: { value: new THREE.Vector2(1, 1) } },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
  });

  const sparkMat = new THREE.ShaderMaterial({
    vertexShader: SPARK_VERT,
    fragmentShader: SPARK_FRAG,
    uniforms: { ...shared, uPx: { value: 2 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const stage = createStage(host, {
    fov: 50,
    antialias: false,
    dprCap: 1.25,
    onFrame: (t) => {
      pointer.lerp(target, 0.05);
      shared.uTime.value = still ? 12 : t;
    },
    onResize: (w, h) => {
      aurora.uniforms.uRes.value.set(w, h);
      sparkMat.uniforms.uPx.value = (Math.min(w, h) / 360) * Math.min(window.devicePixelRatio || 1, 1.25);
    },
  });

  if (!stage) return null;

  stage.camera.position.set(0, 0, 6);

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), aurora);
  quad.frustumCulled = false;
  quad.renderOrder = -1;
  stage.scene.add(quad);

  const pos = new Float32Array(SPARKS * 3);
  const seed = new Float32Array(SPARKS);
  for (let i = 0; i < SPARKS; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const sparks = new THREE.Points(geo, sparkMat);
  sparks.frustumCulled = false;
  stage.scene.add(sparks);

  const onMove = (e: PointerEvent) => {
    target.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
  };
  if (!still) window.addEventListener("pointermove", onMove, { passive: true });

  stage.setActive(false);
  let level = -1;

  return {
    /** The hero's blur progress, 0..1. */
    setLevel(b: number) {
      if (b === level) return;
      level = b;
      shared.uLevel.value = b;
      host.style.opacity = b > 0 ? "1" : "0";
      if (still) stage.renderOnce();
      else stage.setActive(b > 0.001);
    },
    dispose() {
      window.removeEventListener("pointermove", onMove);
      stage.dispose();
    },
  };
}
