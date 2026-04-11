"use client";

import { useEffect, useRef } from "react";
import { useScroll, useVelocity, useSpring, useTransform } from "framer-motion";

export const AmbientShader = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Motion integration
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGL2RenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let animationFrame: number;

    // --- SHARED SHADER LOGIC (PRO procedural starfield) ---
    // This GLSL code will be used for WebGL fallback. 
    // WebGPU WGSL will follow a similar logic.

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
      uniform vec2 uResolution;
      out vec4 fragColor;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      vec3 drawLayer(vec2 uv, float scale, float speed, float scroll, float velocity) {
        vec2 p = uv * scale;
        
        // Cinematic Sway (X-axis) - Extremely subtle cam float
        p.x += sin(uTime * 0.4 + scale) * 0.01;
        
        // Forward Drift + Scroll (Y-axis)
        float drift = uTime * 0.2 * speed;
        p.y += (scroll * speed * 0.001) + drift;
        
        vec2 id = floor(p);
        vec2 f = fract(p);
        
        float h = hash(id);
        if(h < 0.98) return vec3(0.0); // Density control
        
        vec2 offset = vec2(hash(id + 11.5), hash(id + 22.3)) - 0.5;
        vec2 pos = 0.5 + 0.4 * offset;
        
        // Twinkle
        float twinkle = sin(uTime * 2.0 + h * 6.28) * 0.5 + 0.5;
        
        // Motion Blur (React to combined velocity: drift + scroll)
        float totalVelocity = abs(velocity * 0.02) + (speed * 0.05);
        float d = length((f - pos) * vec2(1.0, 1.0 / (1.0 + totalVelocity)));
        
        // Glow / Soft edge
        float mask = smoothstep(0.04, 0.0, d);
        mask *= (0.2 + 0.8 * twinkle);
        
        // Emerald tactical star chance
        vec3 color = (hash(id * 1.5) > 0.95) ? vec3(0.06, 0.73, 0.51) * 0.4 : vec3(1.0);
        
        return color * mask;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
        
        vec3 color = vec3(0.0);
        
        // Parallax Layers
        color += drawLayer(uv, 4.0, 0.2, uScroll, uVelocity);  // Far
        color += drawLayer(uv, 8.0, 0.5, uScroll, uVelocity);  // Med
        color += drawLayer(uv, 12.0, 1.2, uScroll, uVelocity); // Near (Faster)
        
        // Atmospheric haze / fade at edges
        float edge = smoothstep(1.5, 0.0, length(uv));
        color *= edge;

        fragColor = vec4(color * 0.6, 1.0); // Final exposure
      }
    `;

    // --- WEBGL FALLBACK ---
    const initWebGL = () => {
      gl = canvas.getContext("webgl2");
      if (!gl) return;

      console.log("GE_WEBGL: Deep Space Engine Active");

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
      const resLoc = gl.getUniformLocation(program, "uResolution");

      const render = (time: number) => {
        if (!gl || !program) return;
        gl.uniform1f(timeLoc, time * 0.001);
        gl.uniform1f(scrollLoc, scrollY.get());
        gl.uniform1f(velLoc, smoothVelocity.get());
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
    };

    // --- WEBGPU (Priority) ---
    const initWebGPU = async () => {
      const nav = navigator as any;
      if (!nav.gpu) return false;
      const adapter = await nav.gpu.requestAdapter();
      if (!adapter) return false;
      const device = await adapter.requestDevice();
      const context = canvas.getContext("webgpu") as any;
      if (!context) return false;

      console.log("GE_WEBGPU: Deep Space Engine Active");

      const format = nav.gpu.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: "premultiplied" });

      const shaderCode = `
        struct Uniforms {
          time: f32,
          scroll: f32,
          velocity: f32,
          resolution: vec2<f32>,
        }
        @group(0) @binding(0) var<uniform> uniforms: Uniforms;

        struct VertexOutput {
          @builtin(position) position: vec4<f32>,
          @location(0) uv: vec2<f32>,
        }

        @vertex
        fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
          var pos = array<vec2<f32>, 4>(
            vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0),
            vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, 1.0)
          );
          var output: VertexOutput;
          output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
          output.uv = pos[vertexIndex] * 0.5 + 0.5;
          return output;
        }

        fn hash(p: vec2<f32>) -> f32 {
          var p3 = fract(p.xyx * vec3<f32>(0.1031, 0.1030, 0.0973));
          p3 = p3 + dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
        }

        fn drawLayer(uv: vec2<f32>, scale: f32, speed: f32) -> vec3<f32> {
          var p = uv * scale;
          
          // Cinematic Sway (X-axis)
          p.x = p.x + sin(uniforms.time * 0.4 + scale) * 0.01;
          
          // Forward Drift + Scroll (Y-axis)
          let drift = uniforms.time * 0.2 * speed;
          p.y = p.y + (uniforms.scroll * speed * 0.001) + drift;
          
          let id = floor(p);
          let f = fract(p);
          
          let h = hash(id);
          if (h < 0.98) { return vec3<f32>(0.0); }
          
          let offset = vec2<f32>(hash(id + 11.5), hash(id + 22.3)) - 0.5;
          let pos = 0.5 + 0.4 * offset;
          
          let twinkle = sin(uniforms.time * 2.0 + h * 6.28) * 0.5 + 0.5;
          
          // Motion Blur
          let totalVelocity = abs(uniforms.velocity * 0.02) + (speed * 0.05);
          let d = length((f - pos) * vec2<f32>(1.0, 1.0 / (1.0 + totalVelocity)));
          
          var mask = smoothstep(0.04, 0.0, d);
          mask = mask * (0.2 + 0.8 * twinkle);
          
          var color = vec3<f32>(1.0);
          if (hash(id * 1.5) > 0.95) {
            color = vec3<f32>(0.06, 0.73, 0.51) * 0.4;
          }
          
          return color * mask;
        }

        @fragment
        fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
          let uv = (input.uv * 2.0 - 1.0) * (uniforms.resolution / min(uniforms.resolution.x, uniforms.resolution.y));
          
          var color = vec3<f32>(0.0);
          color = color + drawLayer(uv, 4.0, 0.2);
          color = color + drawLayer(uv, 8.0, 0.5);
          color = color + drawLayer(uv, 12.0, 1.2);
          
          let edge = smoothstep(1.5, 0.0, length(uv));
          return vec4<f32>(color * edge * 0.6, 1.0);
        }
      `;

      const shaderModule = device.createShaderModule({ code: shaderCode });
      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module: shaderModule, entryPoint: "vs_main" },
        fragment: { module: shaderModule, entryPoint: "fs_main", targets: [{ format }] },
        primitive: { topology: "triangle-strip" }
      });

      const uniformBuffer = device.createBuffer({ 
        size: 32, 
        usage: 0x01 | 0x08 // UNIFORM | COPY_DST
      });

      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
      });

      const frame = (time: number) => {
        const uniformData = new Float32Array([
          time * 0.001, 
          scrollY.get(), 
          smoothVelocity.get(), 
          0, // padding
          canvas.width, 
          canvas.height, 
          0, 0 // padding
        ]);
        device.queue.writeBuffer(uniformBuffer, 0, uniformData);

        const commandEncoder = device.createCommandEncoder();
        const pass = commandEncoder.beginRenderPass({
          colorAttachments: [{ 
            view: context.getCurrentTexture().createView(), 
            loadOp: "clear", 
            clearValue: {r:0,g:0,b:0,a:1}, 
            storeOp: "store" 
          }]
        });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(4);
        pass.end();
        device.queue.submit([commandEncoder.finish()]);
        animationFrame = requestAnimationFrame(frame);
      };

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener("resize", resize);
      resize();
      animationFrame = requestAnimationFrame(frame);
      return true;
    };

    const start = async () => {
      try {
        const gpuSuccess = await initWebGPU();
        if (!gpuSuccess) initWebGL();
      } catch (e) {
        initWebGL();
      }
    };

    start();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", () => {});
    };
  }, []); // Re-run if scroll dependencies change? No, we use .get() in render loop.

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-black"
    />
  );
};
