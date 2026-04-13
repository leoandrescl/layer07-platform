"use client";
import { useEffect, useRef, useState } from "react";
import { useScroll, useVelocity, useSpring, useTransform, useMotionValueEvent } from "framer-motion";

const CODE_FRAGMENTS = [
  "import { NextConfig } from 'next';",
  "const nextConfig: NextConfig = { ... }",
  "export default nextConfig;",
  "const hash = (p: vec2) => fract(sin(dot(p, ...)))",
  "fn drawLayer(uv: vec2, scale: f32) -> vec3",
  "export type Layer = { id: string, version: string }",
  "struct Uniforms { time: f32, scroll: f32 }",
  "COMPOSABLE ARQ",
  "HEADLESS BOUTIQUE",
  "ISR REVALIDATION",
  "NEXT.JS 16 CORE",
  "LCP < 1.0s PERFORMANCE",
  "instance.render(data_nebula)",
  "const gl = canvas.getContext('webgl2')",
  "whileInView: { opacity: 1, y: 0 }",
  "ease: [0.22, 1, 0.36, 1]"
];

export const AmbientShader = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  
  // Custom Focus logic: 0 -> 0.5 via scroll, 0.5 -> 1.0 via event (interaction)
  const [interactionFocus, setInteractionFocus] = useState(0);
  
  // Converge nebula as we reach the end of the page (Briefing section)
  const scrollFocus = useTransform(scrollYProgress, [0.7, 1.0], [0, 0.5]);
  const smoothFocus = useSpring(scrollFocus, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleFocus = (e: any) => setInteractionFocus(e.detail.focus ? 0.5 : 0);
    window.addEventListener("nebula-focus", handleFocus);
    return () => window.removeEventListener("nebula-focus", handleFocus);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGL2RenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let animationFrame: number;

    // --- TEXTURE ATLAS GENERATION (4x4 Grid) ---
    const createCodeTexture = (gl: WebGL2RenderingContext) => {
      const texSize = 1024;
      const offscreen = document.createElement('canvas');
      offscreen.width = texSize;
      offscreen.height = texSize;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, texSize, texSize);
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const gridSize = 4;
      const cellSize = texSize / gridSize;

      CODE_FRAGMENTS.slice(0, 16).forEach((text, i) => {
        const x = (i % gridSize) * cellSize + cellSize / 2;
        const y = Math.floor(i / gridSize) * cellSize + cellSize / 2;
        
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        ctx.fillStyle = i % 3 === 0 ? '#10b981' : '#047857';
        ctx.fillText(text, x, y);
      });

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreen);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
      return texture;
    };

    const vsSource = `#version 300 es
      in vec2 position;
      out vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `#version 300 es
      precision highp float;
      uniform float uTime;
      uniform float uScroll;
      uniform float uVelocity;
      uniform float uFocus;
      uniform vec2 uResolution;
      uniform sampler2D uCodeTex;
      out vec4 fragColor;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        vec2 p = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
        
        // --- 1. DIGITAL NEBULA (FBM) ---
        // Focus effect: nebula converges to a central filament
        float focusScale = mix(1.0, 4.0, uFocus);
        vec2 nebulaP = p * focusScale * 0.5 + uTime * 0.02;
        float n = fbm(nebulaP + fbm(nebulaP + uTime * 0.05));
        
        // Calibrated Palette: Slightly brighter than 'Void' but still dark
        vec3 colLow = vec3(0.0); 
        vec3 colMid = vec3(0.0, 0.18, 0.1); 
        vec3 nebulaColor = mix(colLow, colMid, n);
        
        // Enhanced lens focus
        nebulaColor += mix(0.0, 0.04, uFocus) * exp(-length(p)*2.0);
        nebulaColor *= smoothstep(1.5, 0.2, length(p)); 

        // --- 2. CODE TUNNEL ---
        vec3 codeColor = vec3(0.0);
        float scroll = uScroll * 0.002;
        
        for(int i = 1; i <= 3; i++) {
          float fi = float(i);
          float z = fract(0.08 * uTime * 0.2 * fi + fi * 0.33);
          float scale = mix(8.0, 0.5, z);
          float fade = smoothstep(0.0, 0.3, z) * smoothstep(1.0, 0.7, z);
          
          vec2 focusOffset = p * uFocus * 0.5;
          vec2 codeUv = (p - focusOffset) * scale + vec2(sin(uTime * 0.1 * fi), scroll * fi);
          vec2 id = floor(codeUv);
          
          if(hash(id) > 0.85) {
            vec2 f = fract(codeUv);
            float stretch = 1.0 / (1.0 + abs(uVelocity) * 0.08);
            vec2 stretchUv = (f - 0.5) * vec2(1.0, stretch) + 0.5;
            vec2 atlasId = vec2(floor(hash(id + 1.0)*4.0), floor(hash(id + 2.0)*4.0));
            vec2 atlasUv = (stretchUv * 0.25) + (atlasId * 0.25);
            
            // Brightness boost for visibility (0.08 multiplier)
            codeColor += texture(uCodeTex, atlasUv).rgb * fade * 0.08;
          }
        }

        fragColor = vec4(nebulaColor + codeColor, 1.0);
      }
    `;

    const initWebGL = () => {
      gl = canvas.getContext("webgl2");
      if (!gl) return;
      console.log("GE_ENGINE: Digital Nebula Engine Active");

      const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
      };

      const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return;

      program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.useProgram(program);

      const codeTex = createCodeTexture(gl);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, codeTex);
      gl.uniform1i(gl.getUniformLocation(program, "uCodeTex"), 0);

      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const posLoc = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      const timeLoc = gl.getUniformLocation(program, "uTime");
      const scrollLoc = gl.getUniformLocation(program, "uScroll");
      const velLoc = gl.getUniformLocation(program, "uVelocity");
      const focusLoc = gl.getUniformLocation(program, "uFocus");
      const resLoc = gl.getUniformLocation(program, "uResolution");

      const render = (time: number) => {
        if (!gl || !program) return;
        gl.uniform1f(timeLoc, time * 0.001);
        gl.uniform1f(scrollLoc, scrollY.get());
        gl.uniform1f(velLoc, smoothVelocity.get());
        gl.uniform1f(focusLoc, smoothFocus.get() + interactionFocus);
        gl.uniform2f(resLoc, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animationFrame = requestAnimationFrame(render);
      };

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl?.viewport(0, 0, canvas.width, canvas.height);
      };
      window.addEventListener("resize", resize);
      resize();
      animationFrame = requestAnimationFrame(render);
      
      return resize; 
    };

    const cleanupResize = initWebGL();

    return () => {
      cancelAnimationFrame(animationFrame);
      if (cleanupResize) window.removeEventListener("resize", cleanupResize);
    };
  }, [smoothFocus, interactionFocus]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[-1] bg-black"
    />
  );
};
