"use client";

import { useEffect, useRef } from "react";
import { HIT_LIFE, HIT_MAX, pruneHits, type ShotHit } from "./fx";
import { RAIN_FRAG, RAIN_VERT } from "./shaders";

export type Pointer = { x: number; y: number };

const GLYPHS =
  "ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFLAYER07#$+<>*";

const ATLAS_COLS = 16;
const ATLAS_CELL = 64;
const MAX_DEBRIS = 64;

type Debris = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createGlyphAtlas() {
  const rows = Math.ceil(GLYPHS.length / ATLAS_COLS);
  const canvas = document.createElement("canvas");
  canvas.width = ATLAS_COLS * ATLAS_CELL;
  canvas.height = rows * ATLAS_CELL;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { canvas, rows, count: GLYPHS.length };

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${ATLAS_CELL * 0.72}px "Geist Mono", "MS Gothic", "Noto Sans JP", ui-monospace, monospace`;

  for (let i = 0; i < GLYPHS.length; i += 1) {
    const x = (i % ATLAS_COLS) * ATLAS_CELL + ATLAS_CELL / 2;
    const y = Math.floor(i / ATLAS_COLS) * ATLAS_CELL + ATLAS_CELL / 2 + 2;
    ctx.fillText(GLYPHS[i] ?? "", x, y);
  }

  return { canvas, rows, count: GLYPHS.length };
}

function spawnDebris(hit: ShotHit, width: number, height: number, into: Debris[]) {
  const x = hit.x * width;
  const y = hit.y * height;
  const shards = 10;
  for (let i = 0; i < shards; i += 1) {
    const angle = (i / shards) * Math.PI * 2 + Math.random() * 0.35;
    const speed = 160 + Math.random() * 260;
    into.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      age: 0,
      life: 0.28 + Math.random() * 0.2,
      size: 1.5 + Math.random() * 2,
    });
  }
  if (into.length > MAX_DEBRIS) into.splice(0, into.length - MAX_DEBRIS);
}

export function RainGL({
  mouseRef,
  progressRef,
  hitsRef,
}: {
  mouseRef: React.RefObject<Pointer>;
  progressRef: React.RefObject<number>;
  hitsRef: React.RefObject<ShotHit[]>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, RAIN_VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, RAIN_FRAG);
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

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const atlas = createGlyphAtlas();
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uProgress = gl.getUniformLocation(program, "u_progress");
    const uAtlas = gl.getUniformLocation(program, "u_atlas");
    const uAtlasGrid = gl.getUniformLocation(program, "u_atlas_grid");
    const uGlyphCount = gl.getUniformLocation(program, "u_glyph_count");
    const uGrid = gl.getUniformLocation(program, "u_grid");
    const uHits = gl.getUniformLocation(program, "u_hits");
    const uHitCount = gl.getUniformLocation(program, "u_hit_count");

    gl.uniform1i(uAtlas, 0);
    gl.uniform2f(uAtlasGrid, ATLAS_COLS, atlas.rows);
    gl.uniform1f(uGlyphCount, atlas.count);

    let raf = 0;
    let running = true;
    let lastSeenHit = 0;
    let lastFx = performance.now();
    const start = performance.now();
    const packed = new Float32Array(HIT_MAX * 4);
    const debris: Debris[] = [];

    const overlay = fxRef.current;
    const fx = overlay?.getContext("2d", { alpha: true });
    let fxDirty = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const pw = Math.max(1, Math.floor(w * dpr));
      const ph = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
        gl.viewport(0, 0, pw, ph);
        gl.uniform2f(uRes, pw, ph);
        const cell = 14 * dpr;
        gl.uniform2f(uGrid, Math.max(18, pw / cell), Math.max(12, ph / (cell * 1.45)));
      }
      if (overlay && (overlay.width !== pw || overlay.height !== ph)) {
        overlay.width = pw;
        overlay.height = ph;
      }
    };

    const drawFx = (now: number) => {
      if (!overlay || !fx) return;
      const hits = hitsRef.current ?? [];
      pruneHits(hits, now);
      if (hits.length === 0 && debris.length === 0) {
        if (fxDirty) {
          fx.setTransform(1, 0, 0, 1, 0, 0);
          fx.clearRect(0, 0, overlay.width, overlay.height);
          fxDirty = false;
        }
        return;
      }
      fxDirty = true;
      const dpr = overlay.width / Math.max(overlay.clientWidth, 1);
      const w = overlay.clientWidth;
      const h = overlay.clientHeight;
      const dt = Math.min(0.033, (now - lastFx) / 1000);
      lastFx = now;
      for (let i = 0; i < hits.length; i += 1) {
        const hit = hits[i];
        if (hit && hit.t > lastSeenHit) spawnDebris(hit, w, h, debris);
      }
      lastSeenHit = hits.reduce((max, hit) => Math.max(max, hit.t), lastSeenHit);

      fx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fx.clearRect(0, 0, w, h);
      fx.lineWidth = 1.5;

      for (let i = 0; i < hits.length; i += 1) {
        const hit = hits[i];
        if (!hit) continue;
        const age = (now - hit.t) / 1000;
        if (age > HIT_LIFE) continue;
        const alpha = Math.exp(-age * 3.4) * hit.power;
        const radius = Math.max(0.5, age * 380 * hit.power);
        fx.beginPath();
        fx.arc(hit.x * w, hit.y * h, radius, 0, Math.PI * 2);
        fx.strokeStyle = `rgba(180,255,210,${alpha * 0.7})`;
        fx.stroke();
      }

      for (let i = debris.length - 1; i >= 0; i -= 1) {
        const p = debris[i];
        if (!p) continue;
        p.age += dt;
        if (p.age >= p.life) {
          debris.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 480 * dt;
        const t = 1 - p.age / p.life;
        fx.fillStyle = `rgba(210,255,230,${t})`;
        fx.fillRect(p.x, p.y, p.size, p.size);
      }
    };

    const draw = (now: number) => {
      if (!running) return;
      resize();
      const mouse = mouseRef.current;
      packed.fill(0);
      const hits = hitsRef.current ?? [];
      let slot = 0;
      for (let i = hits.length - 1; i >= 0 && slot < HIT_MAX; i -= 1) {
        const hit = hits[i];
        if (!hit) continue;
        const age = (now - hit.t) / 1000;
        if (age > HIT_LIFE) continue;
        packed[slot * 4] = hit.x;
        packed[slot * 4 + 1] = 1 - hit.y;
        packed[slot * 4 + 2] = age;
        packed[slot * 4 + 3] = hit.power;
        slot += 1;
      }
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse?.x ?? 0.5, mouse?.y ?? 0.5);
      gl.uniform1f(uProgress, progressRef.current ?? 0);
      gl.uniform4fv(uHits, packed);
      gl.uniform1f(uHitCount, slot);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      try {
        drawFx(now);
      } catch {
        debris.length = 0;
      }
      raf = requestAnimationFrame(draw);
    };

    const onVisible = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        return;
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisible);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
    };
  }, [hitsRef, mouseRef, progressRef]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      />
      <canvas
        ref={fxRef}
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
        aria-hidden
      />
    </>
  );
}
