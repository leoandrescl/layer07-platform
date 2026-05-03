"use client";
import { useEffect, useRef, useState } from "react";
import { useScroll, useVelocity, useSpring, useTransform } from "framer-motion";

export const AmbientShader = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll();
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

  const [interactionFocus, setInteractionFocus] = useState(0);
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

    const vsSource = `#version 300 es
      in vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;

    // Pure midnight void — extremely subtle stars, no plasma globally
    const fsSource = `#version 300 es
      precision highp float;
      uniform float uTime;
      uniform float uFocus;
      uniform vec2  uResolution;
      out vec4 fragColor;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;

        // Midnight void base
        vec3 col = vec3(0.0);

        // Minimal starfield — sparse circular dots
        vec2 sg  = floor(uv * 300.0);
        vec2 sc  = fract(uv * 300.0) - 0.5;
        float ss = hash(sg);
        float tw = 0.5 + 0.5 * sin(uTime * (1.2 + ss * 2.5) + ss * 6.28);
        float d  = smoothstep(0.15, 0.0, length(sc));
        col += vec3(d * tw * step(0.997, ss) * 0.06);

        // Subtle focus perimeter glow (terminal interaction only)
        float peri = smoothstep(0.5, 1.0, length(uv - 0.5) * 1.4);
        col += vec3(0.0, 0.08, 0.05) * peri * uFocus * 0.3;

        fragColor = vec4(col, 1.0);
      }
    `;

    const initWebGL = () => {
      gl = canvas.getContext("webgl2");
      if (!gl) return;

      const mkShader = (type: number, src: string) => {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS))
          console.error(gl!.getShaderInfoLog(s));
        return s;
      };

      program = gl.createProgram()!;
      gl.attachShader(program, mkShader(gl.VERTEX_SHADER, vsSource));
      gl.attachShader(program, mkShader(gl.FRAGMENT_SHADER, fsSource));
      gl.linkProgram(program);
      gl.useProgram(program);

      const verts = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
      const pos = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

      const timeLoc  = gl.getUniformLocation(program, "uTime");
      const focusLoc = gl.getUniformLocation(program, "uFocus");
      const resLoc   = gl.getUniformLocation(program, "uResolution");

      const render = (t: number) => {
        if (!gl || !program) return;
        gl.uniform1f(timeLoc,  t * 0.001);
        gl.uniform1f(focusLoc, smoothFocus.get() + interactionFocus);
        gl.uniform2f(resLoc,   canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animationFrame = requestAnimationFrame(render);
      };

      const resize = () => {
        canvas.width  = Math.floor(window.innerWidth  * 0.5);
        canvas.height = Math.floor(window.innerHeight * 0.5);
        gl?.viewport(0, 0, canvas.width, canvas.height);
      };
      window.addEventListener("resize", resize);
      resize();
      animationFrame = requestAnimationFrame(render);
      return resize;
    };

    const cleanup = initWebGL();
    return () => {
      cancelAnimationFrame(animationFrame);
      if (cleanup) window.removeEventListener("resize", cleanup);
    };
  }, [smoothFocus, interactionFocus]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[-1] bg-black"
    />
  );
};
