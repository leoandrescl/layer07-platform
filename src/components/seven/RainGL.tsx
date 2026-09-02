"use client";

import { useEffect, useRef } from "react";
import { RAIN_FRAG, RAIN_VERT } from "./shaders";

export type Pointer = { x: number; y: number };

const GLYPHS =
  "ｦｧｨｩｪｫｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝWIREDNAVI LAYER07#_+<>";

const ATLAS_COLS = 16;
const ATLAS_CELL = 64;

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
  ctx.font = `500 ${ATLAS_CELL * 0.7}px "Courier Prime", "Courier New", "MS Gothic", "Noto Sans JP", ui-monospace, monospace`;

  for (let i = 0; i < GLYPHS.length; i += 1) {
    const x = (i % ATLAS_COLS) * ATLAS_CELL + ATLAS_CELL / 2;
    const y = Math.floor(i / ATLAS_COLS) * ATLAS_CELL + ATLAS_CELL / 2 + 2;
    ctx.fillText(GLYPHS[i] ?? "", x, y);
  }

  return { canvas, rows, count: GLYPHS.length };
}

export function RainGL({
  mouseRef,
  progressRef,
}: {
  mouseRef: React.RefObject<Pointer>;
  progressRef: React.RefObject<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    gl.uniform1i(uAtlas, 0);
    gl.uniform2f(uAtlasGrid, ATLAS_COLS, atlas.rows);
    gl.uniform1f(uGlyphCount, atlas.count);

    let raf = 0;
    let running = true;
    const start = performance.now();

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
        const cell = 20 * dpr;
        gl.uniform2f(uGrid, Math.max(14, pw / cell), Math.max(10, ph / (cell * 1.55)));
      }
    };

    const draw = (now: number) => {
      if (!running) return;
      resize();
      const mouse = mouseRef.current;
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse?.x ?? 0.5, mouse?.y ?? 0.5);
      gl.uniform1f(uProgress, progressRef.current ?? 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
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
  }, [mouseRef, progressRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
