"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { CONFIG, DEBUG, initialQuality, qualityFor, type QualityLevel } from "./config";
import { generateGalaxy } from "./galaxy";
import { generateLogoTargets } from "./logo";
import type { V3 } from "./math";
import { clamp, lerp, normalize, rand, sub } from "./math";
import { POINT_FRAG, POINT_VERT } from "./shaders";

const { scroll: SC } = CONFIG;

interface Particle {
  start: V3;
  galaxy: V3;
  logo: V3;
  dispersed: V3;
  radial: V3;
  current: V3;
  size: number;
  alpha: number;
  rand: number;
  phase: number;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
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

function buildSpinMat(angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return (p: V3): V3 => ({ x: p.x * c - p.z * s, y: p.y, z: p.x * s + p.z * c });
}

const TOTAL_VH = 640;

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
    const logoTargets = generateLogoTargets(particleCount);

    const particles: Particle[] = new Array(particleCount);
    const usedLogo = logoTargets.slice(0, particleCount).concat(
      Array.from({ length: Math.max(0, particleCount - logoTargets.length) }, (_, i) => logoTargets[i % logoTargets.length]),
    );

    const spaceRadius = CONFIG.galaxy.radius * 2.6;
    for (let i = 0; i < particleCount; i += 1) {
      const gp = galaxyPoints[i];
      // start: scattered 3D space
      const theta = rand(0, Math.PI * 2);
      const phi = Math.acos(rand(-1, 1));
      const r = spaceRadius * (0.35 + Math.pow(Math.random(), 0.7));
      const start: V3 = {
        x: Math.sin(phi) * Math.cos(theta) * r,
        y: Math.sin(phi) * Math.sin(theta) * r * 0.7,
        z: Math.cos(phi) * r,
      };
      // dispersed: ambient scattered positions around content plane
      const dispersed: V3 = {
        x: rand(-1, 1) * spaceRadius * 1.3,
        y: rand(-1, 1) * spaceRadius * 0.8,
        z: rand(-1, 1) * spaceRadius - 2,
      };
      // radial: unit-ish outward direction for centrifugal dispersion
      const radial: V3 = normalize({
        x: gp.pos.x + rand(-0.3, 0.3),
        y: gp.pos.y + rand(-0.3, 0.3),
        z: gp.pos.z + rand(-0.3, 0.3),
      });
      particles[i] = {
        start,
        galaxy: gp.pos,
        logo: usedLogo[i],
        dispersed,
        radial,
        current: { ...start },
        size: rand(CONFIG.particles.minSize, CONFIG.particles.maxSize),
        alpha: rand(0.4, 1),
        rand: Math.random(),
        phase: rand(0, Math.PI * 2),
      };
    }

    // ---- buffers ----
    const posArray = new Float32Array(particleCount * 3);
    const sizeArray = new Float32Array(particleCount);
    const alphaArray = new Float32Array(particleCount);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, particleCount * 3 * 4, gl.DYNAMIC_DRAW);

    const sizeBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuf);
    gl.bufferData(gl.ARRAY_BUFFER, particleCount * 4, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, sizeArray.fill(0) ? sizeArray : sizeArray);
    for (let i = 0; i < particleCount; i += 1) sizeArray[i] = particles[i].size;
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, sizeArray);

    const alphaBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuf);
    gl.bufferData(gl.ARRAY_BUFFER, particleCount * 4, gl.STATIC_DRAW);
    for (let i = 0; i < particleCount; i += 1) alphaArray[i] = particles[i].alpha;
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, alphaArray);

    const aPos = gl.getAttribLocation(program, "a_pos");
    const aSize = gl.getAttribLocation(program, "a_size");
    const aAlpha = gl.getAttribLocation(program, "a_alpha");
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

    gl.clearColor(0.012, 0.015, 0.02, 1);

    // ---- camera ----
    const cam: {
      rotX: number;
      rotY: number;
      targetRotX: number;
      targetRotY: number;
    } = {
      rotX: CONFIG.camera.rotationX,
      rotY: CONFIG.camera.rotationY,
      targetRotX: CONFIG.camera.rotationX,
      targetRotY: CONFIG.camera.rotationY,
    };
    const pointerNDC = { x: 0, y: 0 };
    let dragging = false;
    let lastDragX = 0;
    let lastDragY = 0;

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointerNDC.x = nx;
      pointerNDC.y = ny;
      if (dragging) {
        const dx = (e.clientX - lastDragX) / window.innerWidth;
        const dy = (e.clientY - lastDragY) / window.innerHeight;
        cam.targetRotY += dx * Math.PI * CONFIG.camera.dragSensitivityX;
        cam.targetRotX = clamp(
          cam.targetRotX + dy * Math.PI * CONFIG.camera.dragSensitivityY,
          -1.1,
          1.1,
        );
      }
      lastDragX = e.clientX;
      lastDragY = e.clientY;
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
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

    const downgrade = () => {
      if (level === "high" && window.innerWidth >= 640) {
        level = "medium";
        applyQuality();
      } else if (level === "medium") {
        level = "low";
        applyQuality();
      }
    };

    const applyQuality = () => {
      quality = qualityFor(level);
      resize();
    };

    // ---- timeline ----
    let raf = 0;
    let alive = true;
    let autoplay: boolean = CONFIG.animation.formationAuto;
    let autoT = 0;
    let scrollProgress = 0;

    const buildStateWeights = (p: number) => {
      // named phases -> [space, galaxy, dispersed, logo] weights summing ~1
      const space = 1 - smoothstep(SC.spaceEnd, SC.galaxyFormed, p);
      const galaxy =
        smoothstep(SC.spaceEnd, SC.galaxyFormed, p) *
        (1 - smoothstep(SC.dispersionStart, SC.scattered, p));
      const dispersed =
        smoothstep(SC.dispersionStart, SC.scattered, p) *
        (1 - smoothstep(SC.transitionStart, SC.logoForming, p));
      const logo = smoothstep(SC.transitionStart, SC.logoComplete, p);
      return { space, galaxy, dispersed, logo };
    };

    const tick = (time: number) => {
      lenis.raf(time);

      const dtSec = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0;
      lastTime = time;

      // scroll progress
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      let p = clamp(window.scrollY / scrollable);
      if (reduced) p = 1;

      if (autoplay) {
        autoT += dtSec;
        const onset = CONFIG.animation.formationDelay;
        const ft = clamp((autoT - onset) / CONFIG.animation.formationDuration);
        scrollProgress = ft * SC.galaxyFormed;
        if (window.scrollY > 8) {
          autoplay = false;
          scrollProgress = p;
        }
      } else {
        scrollProgress = p;
      }
      p = scrollProgress;

      // camera damping
      cam.rotX = lerp(cam.rotX, cam.targetRotX, CONFIG.camera.damping + dtSec);
      cam.rotY = lerp(cam.rotY, cam.targetRotY, CONFIG.camera.damping + dtSec);

      const weights = buildStateWeights(p);
      const timeNow = time / 1000;

      // determine dispersion progress for radial burst
      const dispersionT = smoothstep(SC.dispersionStart, SC.scattered, p);
      // regroup/logo progress
      const regT = smoothstep(SC.transitionStart, SC.logoComplete, p);

      const spinFn = buildSpinMat(timeNow * CONFIG.galaxy.rotationSpeed);

      for (let i = 0; i < particleCount; i += 1) {
        const pt = particles[i];
        const g = pt.galaxy;

        // rotate galaxy base position by time (orbital motion)
        const gSpin = spinFn(g);

        // centrifugal dispersion: push outward along each particle's own radial
        const burst = CONFIG.scatter.speed * (0.5 + pt.rand * 1.5);
        const dispX = gSpin.x + pt.radial.x * burst;
        const dispY = gSpin.y + pt.radial.y * burst * 0.55;
        const dispZ = gSpin.z + pt.radial.z * burst;

        // blend targets across the named states
        let tx =
          gSpin.x * weights.galaxy +
          pt.dispersed.x * weights.dispersed +
          pt.logo.x * weights.logo +
          pt.start.x * weights.space;
        let ty =
          gSpin.y * weights.galaxy +
          pt.dispersed.y * weights.dispersed +
          pt.logo.y * weights.logo +
          pt.start.y * weights.space;
        let tz =
          gSpin.z * weights.galaxy +
          pt.dispersed.z * weights.dispersed +
          pt.logo.z * weights.logo +
          pt.start.z * weights.space;

        // transient radial burst during dispersion
        if (weights.dispersed > 0) {
          tx = lerp(tx, dispX, dispersionT * 0.5);
          ty = lerp(ty, dispY, dispersionT * 0.5);
          tz = lerp(tz, dispZ, dispersionT * 0.5);
        }

        // subtle living noise
        const noiseT = timeNow * 0.5 + pt.phase;
        tx += Math.sin(noiseT) * 0.02 * (1 - regT);
        ty += Math.cos(noiseT * 1.3) * 0.02 * (1 - regT);
        tz += Math.sin(noiseT * 0.7) * 0.02 * (1 - regT);

        // logo breathing
        if (weights.logo > 0) {
          const breathe = Math.sin(timeNow * 1.2 + pt.phase) * CONFIG.logo.breathing;
          tx += breathe * weights.logo;
          ty += breathe * 0.5 * weights.logo;
        }

        // per-particle easing toward its blend target
        const k = 0.05 + (1 - pt.rand) * 0.12;
        pt.current.x = lerp(pt.current.x, tx, k);
        pt.current.y = lerp(pt.current.y, ty, k);
        pt.current.z = lerp(pt.current.z, tz, k);

        // write position
        posArray[i * 3] = pt.current.x;
        posArray[i * 3 + 1] = pt.current.y;
        posArray[i * 3 + 2] = pt.current.z;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, posArray);

      // ---- camera matrices ----
      const aspect = view.w / view.h;
      // eye position: user controls rotation; subtle parallax from pointer
      const rotY = cam.rotY + pointerNDC.x * CONFIG.camera.parallax * (dragging ? 0 : 1);
      const rotX = cam.rotX + pointerNDC.y * CONFIG.camera.parallax * (dragging ? 0 : 1);

      const eye: V3 = {
        x: Math.sin(rotY) * Math.cos(rotX) * CONFIG.camera.z,
        y: Math.sin(rotX) * CONFIG.camera.z,
        z: Math.cos(rotY) * Math.cos(rotX) * CONFIG.camera.z,
      };
      const center: V3 = { x: 0, y: 0, z: 0 };
      const worldUp: V3 = { x: 0, y: 1, z: 0 };

      const proj = perspective((55 * Math.PI) / 180, aspect, 0.05, 120);
      const lk = lookAt(eye, center, worldUp);
      const viewProj = multiply(proj, lk);

      gl.uniformMatrix4fv(uViewProj, false, viewProj);
      gl.uniform1f(uPixelRatio, view.dpr);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, particleCount);

      // hint opacity
      if (hintRef.current) {
        const ho = reduced ? 0 : clamp(1 - p / 0.03) * clamp(1 - (autoT - 0.6) / 2);
        hintRef.current.style.opacity = String(ho);
      }

      // debug
      if (DEBUG && debugRef.current) {
        debugRef.current.textContent = `p ${p.toFixed(3)} · state ${level} · fps ${(1 / Math.max(dtSec, 1e-4)).toFixed(0)} · n ${particleCount}`;
      }

      // adaptive FPS
      fpsCount += 1;
      fpsTime += dtSec;
      if (fpsTime >= CONFIG.performance.fpsSampleMs) {
        const fps = fpsCount / fpsTime;
        if (fps < CONFIG.performance.targetFps * CONFIG.performance.fpsDropThreshold) {
          downgrade();
          applyQuality();
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

    const cleanup = () => {
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

    return cleanup;
  }, []);

  return (
    <div className="pg-root relative">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 h-full w-full" aria-hidden />

      {DEBUG && (
        <div
          ref={debugRef}
          className="fixed right-4 top-4 z-50 font-mono text-[11px] text-[#8fb8b0]"
        />
      )}

      <div ref={hintRef} className="pointer-events-none fixed inset-x-0 bottom-[18vh] z-30 flex flex-col items-center gap-3" style={{ opacity: 1 }}>
        <span className="pg-hint size-1.5 rounded-full bg-[#7fffd4]" aria-hidden />
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#8fb8b0]">
          arrastrar para explorar · scroll para avanzar
        </p>
      </div>

      <main className="relative z-20" style={{ height: `${TOTAL_VH}vh` }}>
        {/* hero / space */}
        <section className="hero flex min-h-screen items-center justify-center">
          <div className="pointer-events-none text-center">
            <p className="font-mono text-[11px] tracking-[0.3em] text-[#7fffd4]/80">
              LAYER07
            </p>
            <h1 className="pg-glow mt-4 font-sans text-4xl tracking-[0.08em] text-[#e8fff8] sm:text-6xl">
              particle genesis
            </h1>
          </div>
        </section>

        {/* content */}
        <section className="content min-h-screen">
          <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-32">
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

        {/* transition space */}
        <section className="transition min-h-screen" aria-hidden />

        {/* logo section */}
        <section className="logo flex min-h-screen items-center justify-center">
          <div className="pb-32 text-center">
            <h2 className="pg-glow font-sans text-5xl tracking-[0.14em] text-[#e8fff8] sm:text-7xl">
              L07
            </h2>
            <p className="mt-4 font-mono text-[11px] tracking-[0.24em] text-[#8fb8b0]">
              forma viva
            </p>
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] tracking-[0.2em] text-[#8fb8b0]">
              <Link href="/labs" className="transition-colors hover:text-[#e8fff8]">
                LABS
              </Link>
              <Link href="/" className="transition-colors hover:text-[#e8fff8]">
                LAYER07
              </Link>
            </nav>
          </div>
        </section>
      </main>
    </div>
  );
}