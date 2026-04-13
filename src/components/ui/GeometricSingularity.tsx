"use client";

import { useEffect, useRef } from "react";

export const GeometricSingularity = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    const vsSource = `#version 300 es
      in vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `#version 300 es
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;
      out vec4 fragColor;

      // Pseudo-random function
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        vec2 st = uv - 0.5;
        st.x *= uResolution.x / uResolution.y;

        // Convert to polar coordinates
        float radius = length(st);
        float angle = atan(st.y, st.x);

        // Apply Dynamics: Clockwise Rotation & Inward Pull
        angle -= uTime * 0.15;
        radius = mod(radius - uTime * 0.05, 1.0);

        // Convert back to transformed cartesian space for pattern generation
        vec2 transSt = vec2(cos(angle), sin(angle)) * radius;

        // Generate Geometric Pattern (Dots / Fractal-like logic)
        float pattern = 0.0;
        vec2 grid = fract(transSt * 20.0) - 0.5;
        float d = length(grid);
        
        // Sutil dots based on transformed space
        pattern = smoothstep(0.4, 0.38, d);
        
        // Randomize intensity slightly
        pattern *= hash(floor(transSt * 20.0)) * 0.5 + 0.5;

        // Color Palette: Esmeralda / Deep Shadow
        vec3 colorA = vec3(0.0, 0.1, 0.1); // Deep Esmeralda
        vec3 colorB = vec3(0.06, 0.72, 0.5); // Layer07 Emerald (#10b981)
        vec3 finalColor = mix(colorA, colorB, pattern);

        // Alpha & Edge Vignette
        float vignette = smoothstep(0.6, 0.1, length(uv - 0.5));
        float alpha = pattern * 0.12 * vignette; // Max alpha around 0.12 as requested

        fragColor = vec4(finalColor * alpha, alpha);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttrib = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "uTime")!;
    const resLoc = gl.getUniformLocation(program, "uResolution")!;

    const render = (time: number) => {
      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    requestAnimationFrame(render);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen"
      style={{ filter: "blur(2px)" }} // Sutil blur to avoid artifacts and soften geometry
    />
  );
};
