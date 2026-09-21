"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { buildHeightField } from "./spec";
import { RELIEF_FRAG, RELIEF_VERT } from "./shaders";

const SCROLL_VH = 620;
const LEN = 18;
const AMP = 3.4;
const FOV_Y = (55 * Math.PI) / 180;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function lerp3(a: V3, b: V3, t: number): V3 {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  };
}

type V3 = { x: number; y: number; z: number };

function sub(a: V3, b: V3): V3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross(a: V3, b: V3): V3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function dot(a: V3, b: V3) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function normalize(a: V3): V3 {
  const l = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / l, y: a.y / l, z: a.z / l };
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
  const s = normalize(cross(f, up));
  const u = cross(s, f);
  const m = new Float32Array(16);
  m[0] = s.x;
  m[1] = u.x;
  m[2] = -f.x;
  m[3] = 0;
  m[4] = s.y;
  m[5] = u.y;
  m[6] = -f.y;
  m[7] = 0;
  m[8] = s.z;
  m[9] = u.z;
  m[10] = -f.z;
  m[11] = 0;
  m[12] = -dot(s, eye);
  m[13] = -dot(u, eye);
  m[14] = dot(f, eye);
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

function expandRGBA(source: Uint8Array) {
  const out = new Uint8Array(source.length * 4);
  for (let i = 0; i < source.length; i += 1) {
    const value = source[i];
    out[i * 4] = value;
    out[i * 4 + 1] = value;
    out[i * 4 + 2] = value;
    out[i * 4 + 3] = 255;
  }
  return out;
}

function compile(gl: WebGLRenderingContext | WebGL2RenderingContext, type: number, src: string) {
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

function createTexture(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  w: number,
  h: number,
  data: Uint8Array,
) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}

export function SystemsExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const state = {
      reduced: reducedMq.matches,
    };
    const onReduced = () => {
      state.reduced = reducedMq.matches;
    };
    reducedMq.addEventListener("change", onReduced);

    let field;
    try {
      field = buildHeightField();
    } catch {
      return;
    }
    const aspect = field.height / field.width;
    const wid = LEN * aspect;

    const gl2 = canvas.getContext("webgl2", {
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    }) as WebGL2RenderingContext | null;
    const gl = (gl2 ?? canvas.getContext("webgl", { alpha: false, antialias: true })) as
      | WebGLRenderingContext
      | null;
    if (!gl) return;

    const useUint32 = gl2 !== null;

    const vs = compile(gl, gl.VERTEX_SHADER, RELIEF_VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, RELIEF_FRAG);
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

    const gridX = useUint32 ? 256 : 128;
    const gridY = 96;

    const vertCount = (gridX + 1) * (gridY + 1);
    const uv = new Float32Array(vertCount * 2);
    for (let j = 0; j <= gridY; j += 1) {
      for (let i = 0; i <= gridX; i += 1) {
        const idx = (j * (gridX + 1) + i) * 2;
        uv[idx] = i / gridX;
        uv[idx + 1] = j / gridY;
      }
    }
    const indexCount = gridX * gridY * 6;
    const indices = useUint32
      ? new Uint32Array(indexCount)
      : new Uint16Array(indexCount);
    let write = 0;
    for (let j = 0; j < gridY; j += 1) {
      for (let i = 0; i < gridX; i += 1) {
        const a = j * (gridX + 1) + i;
        const b = a + 1;
        const c = a + gridX + 1;
        const d = c + 1;
        indices[write++] = a;
        indices[write++] = c;
        indices[write++] = b;
        indices[write++] = b;
        indices[write++] = c;
        indices[write++] = d;
      }
    }

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
    const aUv = gl.getAttribLocation(program, "a_uv");
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const heightTex = createTexture(gl, field.width, field.height, expandRGBA(field.data));

    const emberW = 128;
    const emberH = 64;
    const emberBuffer = new Uint8Array(emberW * emberH * 4);
    const emberTex = createTexture(gl, emberW, emberH, emberBuffer);

    const uViewProj = gl.getUniformLocation(program, "u_viewProj");
    const uHeight = gl.getUniformLocation(program, "u_height");
    const uEmber = gl.getUniformLocation(program, "u_ember");
    const uLen = gl.getUniformLocation(program, "u_len");
    const uWid = gl.getUniformLocation(program, "u_wid");
    const uAmp = gl.getUniformLocation(program, "u_amp");
    const uTexel = gl.getUniformLocation(program, "u_texel");
    const uLight = gl.getUniformLocation(program, "u_light");
    const uEye = gl.getUniformLocation(program, "u_eye");
    const uInvRadius = gl.getUniformLocation(program, "u_invRadius");
    const uReveal = gl.getUniformLocation(program, "u_reveal");
    const uLightUV = gl.getUniformLocation(program, "u_lightUV");

    gl.uniform1i(uHeight, 0);
    gl.uniform1i(uEmber, 1);
    gl.uniform1f(uLen, LEN);
    gl.uniform1f(uWid, wid);
    gl.uniform1f(uAmp, AMP);
    gl.uniform2f(uTexel, 1 / field.width, 1 / field.height);

    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.clearColor(0.02, 0.02, 0.02, 1);

    const pointer = { x: 0.5, y: 0.5 };
    let pulse = 0;

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = clamp(event.clientX / window.innerWidth);
      pointer.y = clamp(event.clientY / window.innerHeight);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pulse = 1;
    };
    let touchTimer = 0;
    let touchX = 0;
    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      const t = event.touches[0];
      if (!t) return;
      pointer.x = clamp(t.clientX / window.innerWidth);
      pointer.y = clamp(t.clientY / window.innerHeight);
      touchX = t.clientX;
      touchY = t.clientY;
      touchTimer = window.setTimeout(() => {
        pulse = 1;
        touchTimer = 0;
      }, 320);
    };
    const onTouchMove = (event: TouchEvent) => {
      const t = event.touches[0];
      if (!t) return;
      pointer.x = clamp(t.clientX / window.innerWidth);
      pointer.y = clamp(t.clientY / window.innerHeight);
      if (touchTimer && Math.hypot(t.clientX - touchX, t.clientY - touchY) > 14) {
        window.clearTimeout(touchTimer);
        touchTimer = 0;
      }
    };
    const onTouchEnd = () => {
      if (touchTimer) {
        window.clearTimeout(touchTimer);
        touchTimer = 0;
      }
    };

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      autoRaf: false,
      respectReducedMotion: true,
    });

    const view = { w: 0, h: 0, dpr: 1 };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      view.w = Math.max(1, rect.width);
      view.h = Math.max(1, rect.height);
      view.dpr = dpr;
      canvas.width = Math.round(view.w * dpr);
      canvas.height = Math.round(view.h * dpr);
    };

    let lastTime = 0;
    let lastScroll = 0;
    let velocity = 0;
    let raf = 0;
    let alive = true;

    const tick = (time: number) => {
      lenis.raf(time);

      const dtSec = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0;
      lastTime = time;

      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      let p = clamp(window.scrollY / scrollable);
      if (state.reduced) p = 1;

      const speed = Math.abs(window.scrollY - lastScroll);
      velocity = lerp(velocity, speed, 0.15);
      lastScroll = window.scrollY;
      const speed01 = clamp(velocity / 80);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const travelT = smooth(clamp(p / 0.72));
      const revealT = smooth(clamp((p - 0.72) / 0.28));

      const eyeE0: V3 = { x: -LEN * 0.3, y: AMP * 0.55, z: wid * 0.5 + 2.8 };
      const eyeE1: V3 = { x: LEN * 0.34, y: AMP * 1.6, z: wid * 0.5 + 2.2 };
      let eye = lerp3(eyeE0, eyeE1, travelT);

      const tanH = Math.tan(FOV_Y / 2);
      const tanV = tanH;
      const aspectNow = view.w / view.h;
      const tanHNow = tanH * Math.max(aspectNow, 0.5);
      const fitHeight = Math.max((LEN * 0.5) / Math.max(tanHNow, 1e-4), 7);

      const eyeR: V3 = {
        x: 0,
        y: Math.min(42, Math.max(6, fitHeight * 1.05)),
        z: wid * 0.5 + 3.0,
      };
      eye = lerp3(eye, eyeR, revealT);

      const ctr0: V3 = { x: -LEN * 0.02, y: AMP * 0.3, z: 0 };
      const ctr1: V3 = { x: LEN * 0.34, y: AMP * 0.3, z: 0 };
      let center = lerp3(ctr0, ctr1, travelT);
      const ctrR: V3 = { x: 0, y: AMP * 0.35, z: 0 };
      center = lerp3(center, ctrR, revealT);

      const forward = normalize(sub(center, eye));
      const roll = Math.sin(p * Math.PI * 2) * 0.14 * (1 - revealT);
      const worldUp: V3 = { x: Math.sin(roll), y: Math.cos(roll), z: 0 };
      const right = normalize(cross(forward, worldUp));
      const up = cross(right, forward);
      const dist = Math.hypot(center.x - eye.x, center.y - eye.y, center.z - eye.z) || 1;

      const spanX = dist * tanHNow * 0.8;
      const spanY = dist * tanV * 0.8;

      const light: V3 = {
        x: eye.x + forward.x * dist * 0.5 + right.x * (pointer.x - 0.5) * spanX + up.x * (0.5 - pointer.y) * spanY,
        y: eye.y + forward.y * dist * 0.5 + right.y * (pointer.x - 0.5) * spanX + up.y * (0.5 - pointer.y) * spanY,
        z: eye.z + forward.z * dist * 0.5 + right.z * (pointer.x - 0.5) * spanX + up.z * (0.5 - pointer.y) * spanY,
      };

      if (pulse > 0) pulse = Math.max(0, pulse - dtSec / 0.7);
      const pulseBoost = 1 + smooth(pulse) * 1.4;
      const lightRadius =
        dist * 0.34 * lerp(1, 1.35, revealT) * pulseBoost * lerp(1, 0.72, speed01);

      const proj = perspective(FOV_Y, aspectNow, 0.05, 160);
      const viewMat = lookAt(eye, center, worldUp);
      const viewProj = multiply(proj, viewMat);

      gl.uniformMatrix4fv(uViewProj, false, viewProj);
      gl.uniform3f(uLight, light.x, light.y, light.z);
      gl.uniform3f(uEye, eye.x, eye.y, eye.z);
      gl.uniform1f(uInvRadius, 1 / Math.max(lightRadius, 0.05));
      gl.uniform1f(uReveal, revealT);
      gl.uniform2f(uLightUV, light.x / LEN + 0.5, light.z / wid + 0.5);

      // Ember accumulation (persistent memory of explored surface).
      const deposit = (0.22 + smooth(pulse) * 1.6) * dtSec;
      for (let j = 0; j < emberH; j += 1) {
        for (let i = 0; i < emberW; i += 1) {
          const idx = (j * emberW + i) * 4;
          const u = (i + 0.5) / emberW;
          const v = (j + 0.5) / emberH;
          const dx = (u - (light.x / LEN + 0.5)) * LEN;
          const dz = (v - (light.z / wid + 0.5)) * wid;
          const d = Math.hypot(dx, dz);
          const fall = clamp(1 - d / lightRadius) ** 2;
          let e = emberBuffer[idx] / 255;
          e += fall * deposit;
          e *= 0.9996;
          emberBuffer[idx] = Math.min(255, Math.round(e * 255));
        }
      }

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, emberTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, emberW, emberH, 0, gl.RGBA, gl.UNSIGNED_BYTE, emberBuffer);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, heightTex);

      gl.drawElements(gl.TRIANGLES, indexCount, useUint32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);

      if (startRef.current) {
        startRef.current.style.opacity = state.reduced ? "0" : String(clamp(1 - p / 0.04));
      }
      if (finalRef.current) {
        const fo = state.reduced ? 1 : smooth(clamp((p - 0.93) / 0.05));
        finalRef.current.style.opacity = String(fo);
        finalRef.current.style.pointerEvents = fo > 0.9 ? "auto" : "none";
      }

      if (alive) raf = requestAnimationFrame(tick);
    };

    resize();
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (alive) {
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      reducedMq.removeEventListener("change", onReduced);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="sys-root relative min-h-dvh">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 h-full w-full"
        aria-hidden
      />

      <div className="sys-vignette pointer-events-none fixed inset-0 z-10" aria-hidden />

      <div className="relative z-20" style={{ height: `${SCROLL_VH}vh` }} aria-hidden />

      <div
        ref={startRef}
        className="pointer-events-none fixed inset-x-0 bottom-[16vh] z-30 flex flex-col items-center gap-3"
        style={{ opacity: 1 }}
      >
        <span className="sys-hint size-1.5 rounded-full bg-[#ffb066]" aria-hidden />
        <p className="font-sys-mono text-[11px] tracking-[0.28em] text-[#8b9094]">
          muévete para ver
        </p>
      </div>

      <div
        ref={finalRef}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30"
        style={{ opacity: 0 }}
      >
        <div className="pointer-events-auto mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 pb-10 text-center">
          <p className="font-sys-sans text-2xl font-semibold tracking-[-0.02em] text-[#ECECE6]">
            layer07
          </p>
          <p className="font-sys-mono text-[11px] tracking-[0.24em] text-[#8b9094]">
            hecha con tu luz
          </p>
          <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-sys-mono text-[11px] tracking-[0.2em] text-[#8b9094]">
            <Link href="/portafolio" className="transition-colors hover:text-[#ECECE6]">
              WORK
            </Link>
            <Link href="/labs" className="transition-colors hover:text-[#ECECE6]">
              LAB
            </Link>
            <Link href="/nosotros" className="transition-colors hover:text-[#ECECE6]">
              ABOUT
            </Link>
            <Link href="/contacto" className="transition-colors hover:text-[#ECECE6]">
              CONTACT
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}