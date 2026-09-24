"use client";

import { useMemo } from "react";
import { content } from "@/lib/content";
import { takeReels } from "@/lib/reelOrder";
import type { FrameCtx, Placement } from "@/lib/reelStage";
import { StageSection } from "@/components/sections/StageSection";

/* VARIANT 02 — THE TUNNEL.

   Rings of panels receding into the dark, drifting toward the camera and past
   it. The library becomes something you are moving THROUGH rather than looking
   at, and because panels recycle it never ends — a folder of thirty-nine reads
   as endless without a single clip being duplicated in the DOM.

   ── THE RECYCLING IS THE WHOLE TRICK ────────────────────────────────────────

   Each panel carries its own z. Every frame z increases by SPEED * dt, and any
   panel that passes the camera is sent back to the far end by subtracting the
   full tunnel DEPTH. Nothing is created, nothing is destroyed, and the sequence
   loops seamlessly because the spacing is uniform.

   dt, NOT A FRAME COUNT. Integrating a position over frames rather than seconds
   makes the tunnel run at a different speed on a 60Hz and a 120Hz display. The
   stage clamps dt so a backgrounded tab cannot deliver one enormous step and
   fling every panel out the far side.

   ── WHY PANELS SIT ON THE WALL, NOT IN THE MIDDLE ───────────────────────────

   Each ring holds RING panels spaced evenly around a circle, angled to face the
   axis. Put them flat facing the camera instead and the near ones cover the far
   ones completely; on the wall of the tunnel they stay separate all the way
   down, and the ones nearest the camera slide past at the edges of frame, which
   is what sells the motion.

   THE TINT IS DISTANCE, RECOMPUTED PER FRAME — the one scene here where it has
   to be, because a panel's depth is what is changing. It is a colour multiply on
   a material that is already being touched, not an extra pass.

   REDUCED MOTION parks the drift and leaves a still tunnel, which is a perfectly
   good thing to look at and click through. */

const ALL = takeReels(content.reels.videos, 0, content.reels.videos.length);

const RING = 6;
const RING_R = 3.4;
const DEPTH = 46;
const SPEED = 2.6;

function place(i: number, n: number): Placement {
  const ring = Math.floor(i / RING);
  const slot = i % RING;
  /* Half a slot of twist per ring so the panels spiral instead of forming
     straight corridors that flicker as they pass. */
  const theta = (slot / RING) * Math.PI * 2 + ring * (Math.PI / RING) * 0.6;
  const rings = Math.ceil(n / RING);
  return {
    x: Math.cos(theta) * RING_R,
    y: Math.sin(theta) * RING_R,
    z: -DEPTH * (ring / rings),
    /* Panels face the tunnel's axis: rotate to the angle, then a quarter turn so
       the plane's normal points inward. */
    rz: theta + Math.PI / 2,
    ry: 0,
    tint: 1,
  };
}

function frame(ctx: FrameCtx) {
  const { meshes, base, tints, dt, hovered, reduce, camera, pointer, drag } = ctx;

  const step = reduce ? 0 : SPEED * dt;

  for (let i = 0; i < meshes.length; i++) {
    const m = meshes[i];
    let z = (m.userData.z as number) ?? base[i].z;
    /* The hovered panel holds still so it can be read and clicked — a target
       that is still moving toward you is a target you have to chase. */
    if (i !== hovered) z += step;
    if (z > 6) z -= DEPTH;
    m.userData.z = z;
    m.position.z = z;

    /* Fade in from the far end and out as it passes, so nothing ever pops. */
    const far = 1 - Math.min(1, Math.max(0, (-z - DEPTH * 0.55) / (DEPTH * 0.45)));
    const near = 1 - Math.min(1, Math.max(0, (z - 1) / 5));
    const k = far * near * (i === hovered ? 1.5 : 1);
    m.material.color.copy(tints[i]).multiplyScalar(0.35 + 0.65 * k);
  }

  /* The camera leans toward the pointer, so the tunnel banks as you look around
     it. Two properties on one object. */
  camera.position.x += (pointer.x * 1.6 + drag.x - camera.position.x) * 0.06;
  camera.position.y += (-pointer.y * 1.2 - camera.position.y) * 0.06;
  camera.lookAt(0, 0, -12);
}

export function WorkTunnel3D() {
  const options = useMemo(
    () => ({
      reels: ALL,
      panelW: 1.15,
      fov: 68,
      cameraZ: 4,
      place,
      frame,
      dragX: 0.004,
      rangeX: 1.4,
    }),
    []
  );

  return <StageSection hint="Move to steer" height="clamp(460px,72svh,820px)" options={options} />;
}