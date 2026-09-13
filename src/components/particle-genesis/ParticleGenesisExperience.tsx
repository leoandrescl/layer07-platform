"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { CONFIG, DEBUG, initialQuality, qualityFor, type QualityLevel } from "./config";
import { generateGalaxy } from "./galaxy";
import type { V3 } from "./math";
import { clamp, lerp, normalize, rand, sub } from "./math";
import { POINT_FRAG, POINT_VERT } from "./shaders";

const { scroll: SC } = CONFIG;

interface Particle {
  galaxy: V3;
  dispersed: V3;
  radial: V3;
  rand: number;
  phase: number;
  size: number;
  alpha: number;
  tint: number;
  radius: number;
  orbitSpeed: number;
  wobble: number;
  /** current radius while flowing inward (mutable) */
  curR: number;
  /** spiral arm index (for flowing particles) */
  arm: number;
  /** raw angular spread perpendicular to the arm */
  spreadTerm: number;
  /** arm/periphery particles drift toward the core along the log-spiral */
  flowing: boolean;
  /** skip position smoothing for one frame (after a radius respawn) */
  snap: boolean;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

const TIERS = CONFIG.particles.tiers;
const TIER_WEIGHTS = CONFIG.particles.tierWeights;

function pickSizeTier(coreStar: boolean): number {
  if (coreStar) {
    return TIERS[6] + Math.random() * (TIERS[7] - TIERS[6]);
  }
  let r = Math.random();
  for (let t = 0; t < TIER_WEIGHTS.length; t += 1) {
    if (r < TIER_WEIGHTS[t]) return TIERS[t];
    r -= TIER_WEIGHTS[t];
  }
  return TIERS[TIERS.length - 1];
}

function perspective(fovY: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) * nf;
  m[11] = -1;
  m[14] = 2 * far * near * nf;
  return m;
}

function lookAt(eye: V3, center: V3, up: V3) {
  const f = normalize(sub(center, eye));
  const s = normalize({ x: f.y * up.z - f.z * up.y, y: f.z * up.x - f.x * up.z, z: f.x * up.y - f.y * up.x });
  const u = { x: s.y * f.z - s.z * f.y, y: s.z * f.x - s.x * f.z, z: s.x * f.y - s.y * f.x };
  const m = new Float32Array(16);
  m[0] = s.x; m[1] = u.x; m[2] = -f.x; m[3] = 0;
  m[4] = s.y; m[5] = u.y; m[6] = -f.y; m[7] = 0;
  m[8] = s.z; m[9] = u.z; m[10] = -f.z; m[11] = 0;
  m[12] = -(s.x * eye.x + s.y * eye.y + s.z * eye.z);
  m[13] = -(u.x * eye.x + u.y * eye.y + u.z * eye.z);
  m[14] = f.x * eye.x + f.y * eye.y + f.z * eye.z;
  m[15] = 1;
  return m;
}

function multiply(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c += 1) {
    for (let r = 0; r < 4; r += 1) {
      out[c * 4 + r] =
        a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const TOTAL_VH = 220;

export function ParticleGenesisExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const debugRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
      depth: false,
    }) as WebGL2RenderingContext | null;
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, POINT_VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, POINT_FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // ---- quality / adaptive ----
    let level: QualityLevel = initialQuality();
    let quality = qualityFor(level);
    const particleCount = quality.count;

    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reducedMq.matches;
    const onReduced = () => {
      reduced = reducedMq.matches;
    };
    reducedMq.addEventListener("change", onReduced);

    // ---- build particles ----
    const galaxyPoints = generateGalaxy(particleCount);
    const particles: Particle[] = new Array(particleCount);

    const spaceRadius = CONFIG.galaxy.radius * 2.4;
    for (let i = 0; i < particleCount; i += 1) {
      const gp = galaxyPoints[i];

      // dispersed: particles pushed far out to the periphery so the center
      // is left clean for the / about content. Direction kept roughly radial
      // so the dispersion reads as matter expanding outward, not vanishing.
      const dirX = gp.pos.x || rand(-1, 1);
      const dirZ = gp.pos.z || rand(-1, 1);
      const dirL = Math.hypot(dirX, dirZ) || 1;
      const spread = spaceRadius * (0.9 + rand(0, 0.9));
      const dispersed: V3 = {
        x: (dirX / dirL) * spread + rand(-1, 1) * 1.2,
        y: rand(-1, 1) * spaceRadius * 0.12,
        z: (dirZ / dirL) * spread + rand(-1, 1) * 1.2,
      };

      // radial: outward direction for centrifugal dispersion
      const radial: V3 = normalize({
        x: gp.pos.x + rand(-0.2, 0.2),
        y: rand(-0.4, 0.4),
        z: gp.pos.z + rand(-0.2, 0.2),
      });

      // size: pick one of 8 discrete absolute tiers so sizes read clearly
      // distinct. Core stars always use the largest tiers; arm/tail particles
      // use the weighted distribution (mostly fine dust, few large stars).
      const tier = pickSizeTier(gp.coreStar);
      const radNorm = clamp(gp.radius / CONFIG.galaxy.radius, 0, 1);
      const flowing = gp.zone === "arm" || gp.zone === "periphery";
      particles[i] = {
        galaxy: gp.pos,
        dispersed,
        radial,
        rand: Math.random(),
        phase: rand(0, Math.PI * 2),
        size: tier * (1 + gp.brightness * CONFIG.particles.brightnessSize),
        alpha: gp.coreStar
          ? 0.95
          : clamp(0.25 + gp.brightness * 0.75, 0, 1) * (tier >= 0.62 ? 0.9 : rand(0.55, 1.0)),
        tint: gp.tint,
        radius: gp.radius,
        orbitSpeed: (1.4 - radNorm * 1.15) * rand(0.7, 1.4),
        wobble: rand(0.5, 2.0),
        curR: gp.radius,
        arm: gp.armIndex,
        spreadTerm: gp.armSpread,
        flowing,
        snap: false,
      };
    }

    // ---- buffers ----
    const posArray = new Float32Array(particleCount * 3);
    const sizeArray = new Float32Array(particleCount);
    const alphaArray = new Float32Array(particleCount);
    const tintArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i += 1) {
      sizeArray[i] = particles[i].size;
      alphaArray[i] = particles[i].alpha;
      tintArray[i] = particles[i].tint;
      // particles start as a scattered starfield; the intro formation pulls
      // them inward into the galaxy after a short delay
      posArray[i * 3] = particles[i].dispersed.x;
      posArray[i * 3 + 1] = particles[i].dispersed.y;
      posArray[i * 3 + 2] = particles[i].dispersed.z;
    }

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, particleCount * 3 * 4, gl.DYNAMIC_DRAW);

    const sizeBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuf);
    gl.bufferData(gl.ARRAY_BUFFER, sizeArray, gl.STATIC_DRAW);

    const alphaBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuf);
    gl.bufferData(gl.ARRAY_BUFFER, alphaArray, gl.STATIC_DRAW);

    const tintBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tintBuf);
    gl.bufferData(gl.ARRAY_BUFFER, tintArray, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "a_pos");
    const aSize = gl.getAttribLocation(program, "a_size");
    const aAlpha = gl.getAttribLocation(program, "a_alpha");
    const aTint = gl.getAttribLocation(program, "a_tint");
    const uViewProj = gl.getUniformLocation(program, "u_viewProj");
    const uPixelRatio = gl.getUniformLocation(program, "u_pixelRatio");

    gl.enableVertexAttribArray(aPos);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aSize);
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuf);
    gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aAlpha);
    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuf);
    gl.vertexAttribPointer(aAlpha, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTint);
    gl.bindBuffer(gl.ARRAY_BUFFER, tintBuf);
    gl.vertexAttribPointer(aTint, 1, gl.FLOAT, false, 0, 0);

    gl.clearColor(0.01, 0.012, 0.02, 1);

    // additive blending so overlapping particles glow like a real galaxy
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.DEPTH_TEST);

    // ---- camera (yaw / pitch, top-down spiral by default) ----
    const cam: {
      yaw: number;
      pitch: number;
      targetYaw: number;
      targetPitch: number;
    } = {
      yaw: CONFIG.camera.yaw,
      pitch: CONFIG.camera.pitch,
      targetYaw: CONFIG.camera.yaw,
      targetPitch: CONFIG.camera.pitch,
    };
    let dragging = false;
    let lastDragX = 0;
    let lastDragY = 0;

    const onPointerMove = (e: PointerEvent) => {
      if (dragging) {
        const dx = (e.clientX - lastDragX) / window.innerWidth;
        const dy = (e.clientY - lastDragY) / window.innerHeight;
        cam.targetYaw += dx * Math.PI * CONFIG.camera.dragSensitivityYaw;
        cam.targetPitch = clamp(
          cam.targetPitch - dy * Math.PI * CONFIG.camera.dragSensitivityPitch,
          CONFIG.camera.minPitch,
          CONFIG.camera.maxPitch,
        );
      }
      lastDragX = e.clientX;
      lastDragY = e.clientY;
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;
      // don't hijack drags that start on interactive elements (nav links)
      if (e.target instanceof Element && e.target.closest("a, button")) return;
      dragging = true;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
    };
    const onPointerUp = () => {
      dragging = false;
    };

    // ---- scroll / lenis ----
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, autoRaf: false, respectReducedMotion: true });

    const view = { w: 0, h: 0, dpr: 1 };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, quality.pixelRatio);
      view.w = Math.max(1, window.innerWidth);
      view.h = Math.max(1, window.innerHeight);
      view.dpr = dpr;
      canvas.width = Math.round(view.w * dpr);
      canvas.height = Math.round(view.h * dpr);
    };
    resize();

    // ---- adaptive FPS ----
    let fpsCount: number = 0;
    let fpsTime: number = 0;
    let lastTime: number = 0;

    const applyQuality = () => {
      quality = qualityFor(level);
      resize();
    };

    const downgrade = () => {
      if (level === "high" && window.innerWidth >= 640) {
        level = "medium";
        applyQuality();
      } else if (level === "medium") {
        level = "low";
        applyQuality();
      }
    };

    // ---- timeline ----
    let raf = 0;
    let alive = true;

    // galaxy weight: 1 at rest, 0 when fully dispersed; recovers on regroup
    const galaxyWeight = (p: number) => {
      const g = 1 - smoothstep(SC.dispersionStart, SC.scattered, p);
      const r = smoothstep(SC.regroupStart, SC.regrouped, p);
      return Math.max(g, r);
    };
    const dispersedWeight = (p: number) =>
      smoothstep(SC.dispersionStart, SC.scattered, p) *
      (1 - smoothstep(SC.regroupStart, SC.regrouped, p));

    const tick = (time: number) => {
      lenis.raf(time);

      const dtSec = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0;
      lastTime = time;

      // scroll progress
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      let p = clamp(window.scrollY / scrollable);
      if (reduced) p = Math.max(p, 0.55);

      // camera damping (stiffer while dragging so it feels responsive)
      const damp = Math.min(
        1,
        (dragging ? CONFIG.camera.dragDamping : CONFIG.camera.damping) + dtSec * 2,
      );
      cam.yaw = lerp(cam.yaw, cam.targetYaw, damp);
      cam.pitch = lerp(cam.pitch, cam.targetPitch, damp);

      const tw = galaxyWeight(p);
      const dw = dispersedWeight(p);

      // dispersion transient (outward burst) strength
      const dispersionT = smoothstep(SC.dispersionStart, SC.scattered, p);
      const timeNow = time / 1000;

      // ---- intro formation: scattered starfield -> galaxy ----
      // stars hang in space for a moment, then automatically flow toward the
      // center and wind up into the spiral
      const introRaw = reduced
        ? 1
        : clamp((timeNow - CONFIG.animation.formationDelay) / CONFIG.animation.formationDuration);
      const introK = introRaw * introRaw * (3 - 2 * introRaw);

      // flow constants
      const gRadius = CONFIG.galaxy.radius;
      const armStep = (Math.PI * 2) / CONFIG.galaxy.arms;
      const totalTurn = CONFIG.galaxy.twist;
      // exponential smoothing: every motion glides instead of snapping
      const smoothA = dtSec > 0 ? 1 - Math.exp(-dtSec * CONFIG.animation.positionSmoothing) : 1;

      for (let i = 0; i < particleCount; i += 1) {
        const pt = particles[i];

        // --- inward flow along the log-spiral (no rigid rotation): each arm
        // particle drifts toward the core; its angle derives from the current
        // radius, so the arms stay intact while matter streams inward ---
        let gx: number;
        let gz: number;
        if (pt.flowing) {
          const rn = clamp(pt.curR / gRadius);
          const flowSpd = CONFIG.galaxy.flowSpeed * (0.7 + pt.rand * 0.6);
          const speedFactor = 0.35 + 0.85 * (1 - rn);
          pt.curR -= flowSpd * speedFactor * dtSec;
          if (pt.curR < 0.3) {
            // reached the core: recycle to the outer edge
            pt.curR = gRadius * (0.9 + Math.random() * 0.22);
            pt.snap = true;
          }
          const ang =
            pt.arm * armStep + (pt.curR / gRadius) * totalTurn + pt.spreadTerm / Math.max(pt.curR, 0.35);
          gx = Math.cos(ang) * pt.curR;
          gz = Math.sin(ang) * pt.curR;
        } else {
          gx = pt.galaxy.x;
          gz = pt.galaxy.z;
        }
        const gy = pt.galaxy.y;

        // --- tiny independent shimmer so it feels alive, not rigid (kept small
        // so the arm silhouette never blurs) ---
        const shimmer = Math.sin(timeNow * 0.6 + pt.phase) * 0.015;
        const ox = gx + shimmer;
        const oz = gz + Math.cos(timeNow * 0.5 + pt.phase) * 0.015;
        const oy = gy + Math.sin(timeNow * 0.4 + pt.phase) * CONFIG.galaxy.thickness * 0.25;

        // --- intro blend: scattered starfield -> galaxy, with a gentle swirl
        // so the approach curves softly inward rather than moving straight ---
        let ix: number;
        let iy: number;
        let iz: number;
        if (introK < 1) {
          const sw = -1.1 * (1 - introK);
          const cs = Math.cos(sw);
          const sn = Math.sin(sw);
          const sx = pt.dispersed.x * cs - pt.dispersed.z * sn;
          const sz = pt.dispersed.x * sn + pt.dispersed.z * cs;
          ix = lerp(sx, ox, introK);
          iy = lerp(pt.dispersed.y, oy, introK);
          iz = lerp(sz, oz, introK);
        } else {
          ix = ox;
          iy = oy;
          iz = oz;
        }

        // blend: galaxy motion vs dispersed target
        let tx = lerp(ix, pt.dispersed.x, dw);
        let ty = lerp(iy, pt.dispersed.y, dw);
        let tz = lerp(iz, pt.dispersed.z, dw);

        // gentle transient outward burst during dispersion
        if (dw > 0.001) {
          const mix = dispersionT * (1 - smoothstep(SC.regroupStart, SC.regrouped, p));
          const burst = CONFIG.scatter.speed * (0.4 + pt.rand * 1.4);
          tx = lerp(tx, ix + pt.radial.x * burst, mix * 0.35);
          ty = lerp(ty, iy + pt.radial.y * burst * 0.5, mix * 0.35);
          tz = lerp(tz, iz + pt.radial.z * burst, mix * 0.35);
        }

        // exponential smoothing toward the target (bypassed right after a
        // radius respawn so recycled particles don't streak across the scene)
        const idx = i * 3;
        if (pt.snap || smoothA >= 1) {
          posArray[idx] = tx;
          posArray[idx + 1] = ty;
          posArray[idx + 2] = tz;
          pt.snap = false;
        } else {
          posArray[idx] += (tx - posArray[idx]) * smoothA;
          posArray[idx + 1] += (ty - posArray[idx + 1]) * smoothA;
          posArray[idx + 2] += (tz - posArray[idx + 2]) * smoothA;
        }
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, posArray);

      // ---- camera matrices ----
      const aspect = view.w / view.h;
      // camera only rotates while dragging — no free mouse-follow
      const yaw = cam.yaw;
      const pitch = cam.pitch;

      // eye orbits the galaxy; high pitch = top-down view of the spiral
      const eye: V3 = {
        x: Math.sin(yaw) * Math.cos(pitch) * CONFIG.camera.distance,
        y: Math.sin(pitch) * CONFIG.camera.distance,
        z: Math.cos(yaw) * Math.cos(pitch) * CONFIG.camera.distance,
      };
      const center: V3 = { x: 0, y: 0, z: 0 };
      // up vector: world +Y is safe except exactly top-down; we clamp pitch < 1.45
      const worldUp: V3 = { x: 0, y: 1, z: 0 };

      const proj = perspective((50 * Math.PI) / 180, aspect, 0.05, 200);
      const viewProj = multiply(proj, lookAt(eye, center, worldUp));

      gl.uniformMatrix4fv(uViewProj, false, viewProj);
      gl.uniform1f(uPixelRatio, view.dpr);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, particleCount);

      // hint opacity: fades once the user has begun to move
      if (hintRef.current) {
        const ho = reduced ? 0 : clamp(1 - p / 0.04);
        hintRef.current.style.opacity = String(ho);
      }

      if (DEBUG && debugRef.current) {
        debugRef.current.textContent = `p ${p.toFixed(3)} · tw ${tw.toFixed(2)} · dw ${dw.toFixed(2)} · fps ${(1 / Math.max(dtSec, 1e-4)).toFixed(0)} · n ${particleCount}`;
      }

      // adaptive FPS
      fpsCount += 1;
      fpsTime += dtSec;
      if (fpsTime >= CONFIG.performance.fpsSampleMs) {
        const fps = fpsCount / fpsTime;
        if (fps < CONFIG.performance.targetFps * CONFIG.performance.fpsDropThreshold) {
          downgrade();
        }
        fpsCount = 0;
        fpsTime = 0;
      }

      if (alive) raf = requestAnimationFrame(tick);
    };

    resize();
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (alive) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMq.removeEventListener("change", onReduced);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="pg-root relative select-none">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 h-full w-full cursor-grab active:cursor-grabbing"
        aria-hidden
      />

      {DEBUG && (
        <div
          ref={debugRef}
          className="fixed right-4 top-4 z-50 font-mono text-[11px] text-[#8fb8b0]"
        />
      )}

      <div
        ref={hintRef}
        className="pointer-events-none fixed inset-x-0 bottom-[18vh] z-30 flex flex-col items-center gap-3"
        style={{ opacity: 1 }}
      >
        <span className="pg-hint size-1.5 rounded-full bg-[#7fffd4]" aria-hidden />
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#8fb8b0]">
          arrastrar para explorar · scroll para avanzar
        </p>
      </div>

      <main className="relative z-20" style={{ height: `${TOTAL_VH}vh` }}>
        {/* spacer so the galaxy settles front-and-center first */}
        <section className="h-[60vh]" aria-hidden />

        {/* content — appears once the galaxy has dispersed and the center is clear */}
        <section className="content flex min-h-screen items-center">
          <div className="mx-auto w-full max-w-2xl px-6 py-24">
            <p className="font-mono text-[11px] tracking-[0.3em] text-[#7fffd4]">
              / about
            </p>
            <h2 className="pg-glow mt-4 font-sans text-3xl tracking-[0.05em] text-[#e8fff8] sm:text-4xl">
              tecnología creativa
            </h2>
            <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-[#8fb8b0]">
              Una escena 3D viva que acompaña todo el recorrido. Miles de
              partículas que se organizan, se dispersan y vuelven a reunirse
              mientras atraviesas la página.
            </p>
            <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-[#8fb8b0]">
              WebGL persistente, scroll como línea de tiempo y una cámara que
              responde a tu cursor. No es un fondo: es materia en movimiento.
            </p>
            <div className="mt-10 flex flex-wrap gap-6 font-mono text-[11px] tracking-[0.2em] text-[#00f0ff]">
              <span>WEBGL</span>
              <span>SHADERS</span>
              <span>PARTICLES</span>
            </div>
          </div>
        </section>

        {/* trailing space: particles regroup back into the galaxy */}
        <section className="h-[60vh]" aria-hidden />

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
          <nav className="pointer-events-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 pb-8 font-mono text-[11px] tracking-[0.2em] text-[#8fb8b0]">
            <Link href="/labs" className="transition-colors hover:text-[#e8fff8]">
              LABS
            </Link>
            <Link href="/" className="transition-colors hover:text-[#e8fff8]">
              LAYER07
            </Link>
          </nav>
        </div>
      </main>
    </div>
  );
}