"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { BRAND, createStage, reducedMotion } from "./stage";

/* THE WHY-US ORB. The heading block is capped at 62ch, which leaves the right
   half of the band empty on a desktop; this fills it with one slow object: a
   sphere whose surface is pushed around by 3D noise, lit only by a fresnel
   ramp in the brand colours, so it reads as a soft iridescent drop on paper.

   The pointer tilts it and speeds the swell a little; scrolling through the
   band turns it. Hidden below `lap:`, where there is no empty half to fill. */

const VERT = /* glsl */ `
uniform float uTime;
uniform float uAmp;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;

// Ashima 3D simplex noise.
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

void main() {
  float n = snoise(normal * 0.9 + uTime * 0.18);
  vNoise = n;
  vec3 p = position + normal * n * uAmp;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uRose;
uniform vec3 uPink;
uniform vec3 uViolet;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
void main() {
  float f = 1.0 - max(dot(normalize(vNormal), vView), 0.0);
  float k = clamp(vNoise * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(uRose, uPink, smoothstep(0.1, 0.6, k));
  col = mix(col, uViolet, smoothstep(0.55, 1.0, k + f * 0.4));
  /* Pale in the middle, saturated at the rim: a drop, not a ball. */
  col = mix(vec3(1.0, 0.93, 0.95), col, 0.6 + pow(f, 1.2) * 0.4);
  float a = 0.55 + pow(f, 2.0) * 0.45;
  gl_FragColor = vec4(col * a, a);
  #include <colorspace_fragment>
}`;

export function WhyOrb({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!window.matchMedia("(min-width: 961px)").matches) return;
    const still = reducedMotion();

    const target = new THREE.Vector2();
    const lean = new THREE.Vector2();
    let spin = 0;
    let scrollSpin = 0;
    let amp = 0.14;
    let ampTarget = 0.14;

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmp: { value: amp },
        uRose: { value: BRAND.rose },
        uPink: { value: BRAND.pink },
        uViolet: { value: BRAND.violet },
      },
      transparent: true,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });

    let mesh: THREE.Mesh | null = null;
    const stage = createStage(host, {
      fov: 35,
      dprCap: 1.5,
      onFrame: (t, dt) => {
        mat.uniforms.uTime.value = still ? 3 : t;
        lean.lerp(target, Math.min(1, dt * 3));
        amp += (ampTarget - amp) * Math.min(1, dt * 2);
        mat.uniforms.uAmp.value = amp;
        spin += dt * 0.15;
        if (mesh) mesh.rotation.set(0.3 + lean.y * 0.4, spin + scrollSpin + lean.x * 0.6, 0);
      },
    });
    if (!stage) return;

    mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 48), mat);
    stage.scene.add(mesh);
    stage.camera.position.set(0, 0, 4.2);

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const ny = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      target.set(nx, ny);
      /* Closer pointer, livelier surface. */
      ampTarget = 0.14 + Math.max(0, 0.08 - Math.hypot(nx, ny) * 0.15);
    };
    const onScroll = () => {
      scrollSpin = window.scrollY * 0.0012;
    };

    if (still) {
      stage.setActive(false);
      stage.renderOnce();
    } else {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      stage.dispose();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className={`pointer-events-none ${className}`} />;
}
