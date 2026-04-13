"use client";
import { useEffect, useRef } from "react";
import { useMotionValueEvent, MotionValue } from "framer-motion";

interface CyberNebulaProps {
  progress: MotionValue<number>;
}

export const CyberNebula = ({ progress }: CyberNebulaProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    // --- Shader Sources ---
    const vsSource = `
      attribute vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float uTime;
      uniform float uProgress;
      uniform vec2 uResolution;

      // Fractal Brownian Motion Noise
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        uv = uv * 2.0 - 1.0;
        uv.x *= uResolution.x / uResolution.y;

        float t = uTime * 0.2;
        float p = uProgress * 2.0;

        // Space Nebula Logic
        vec2 nebula_uv = uv * 1.5;
        float n1 = fbm(nebula_uv + vec2(t, t * 0.5));
        float n2 = fbm(nebula_uv * 2.0 - vec2(t * 0.8, -t * 0.3) + n1);
        
        float clouds = smoothstep(0.3, 0.7, n2);
        
        // Colors: Cyber Emerald & Deep Space Cian
        vec3 color1 = vec3(0.06, 0.72, 0.51); // Emerald
        vec3 color2 = vec3(0.0, 0.2, 0.4);   // Deep Void
        
        vec3 finalColor = mix(color2, color1, clouds * 0.4);
        
        // Additive glowing spots
        float glow = pow(n2, 3.0) * 0.6;
        finalColor += color1 * glow;

        // Depth mask (darker center for tunnel effect)
        float d = length(uv);
        finalColor *= 0.3 + 0.7 * smoothstep(0.0, 0.8, d);

        gl_FragColor = vec4(finalColor, clouds * 0.2);
      }
    `;

    // --- Initialization ---
    const loadShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const shaderProgram = gl.createProgram()!;
    gl.attachShader(shaderProgram, loadShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(shaderProgram, loadShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    const vertices = new Float32Array([
      -1, -1,  1, -1,  -1,  1,
      -1,  1,  1, -1,   1,  1,
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    const timeUniform = gl.getUniformLocation(shaderProgram, "uTime");
    const progressUniform = gl.getUniformLocation(shaderProgram, "uProgress");
    const resolutionUniform = gl.getUniformLocation(shaderProgram, "uResolution");

    let animationFrame: number;
    const start = Date.now();

    const render = () => {
      const time = (Date.now() - start) * 0.001;
      gl.uniform1f(timeUniform, time);
      gl.uniform1f(progressUniform, progress.get());
      gl.uniform2f(resolutionUniform, canvas.width, canvas.height);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrame = requestAnimationFrame(render);
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };

    window.addEventListener("resize", resize);
    resize();
    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none w-full h-full opacity-60 mix-blend-screen"
    />
  );
};
