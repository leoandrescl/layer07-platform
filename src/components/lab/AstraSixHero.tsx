"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  HalfFloatType,
  NoToneMapping,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Uniform,
  WebGLRenderer,
} from "three";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
} from "postprocessing";
import { detectCapability } from "@/lib/webgl/capability";
import {
  buildAstra6Ambient,
  buildAstraSixParticles,
} from "@/lib/lab/astra6-shapes";
import {
  ASTRA6_AMBIENT_VERT,
  ASTRA6_FRAG,
  ASTRA6_VERT,
} from "./astra6-shaders";
import type { LabHeroProps } from "@/lib/lab/heroes";

function clamp(value: number, min = 0, max = 1) {
  return value < min ? min : value > max ? max : value;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

const BASE_Z = 7.4;
const VIEW_FILL = 0.92;
const GALAXY_DIAMETER = 5.3;

// The intro choreography, in seconds from sequence start. Nothing here
// depends on scroll: the scene plays itself, then spins forever.
const INTRO_END = 1.4;
const FORM_START = 1.8;
const FORM_END = 6.2;

export function AstraSixHero({ dict }: LabHeroProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const replayRef = useRef<(() => void) | null>(null);

  const copy = dict?.lab?.astraSix;

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const root = rootRef.current;
    if (!canvas || !stage || !root) return;

    const cap = detectCapability();
    root.dataset.tier = String(cap.tier);
    root.dataset.software = cap.software ? "true" : "false";
    if (cap.tier === 0 && !cap.software) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "high-performance",
      });
    } catch {
      root.dataset.tier = "0";
      return;
    }

    const maxDpr = cap.tier === 2 ? 2 : 1.25;
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = NoToneMapping;
    renderer.setClearColor(0x000000, 0);
    // Screen-blended over the CSS cosmos: dithering would band on the
    // near-black frame.
    renderer.getContext().disable(renderer.getContext().DITHER);

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 120);
    camera.position.z = BASE_Z;

    // ---- the swarm: three states prebuilt per particle ----
    const count = cap.tier === 2 ? 16000 : 8000;
    const p = buildAstraSixParticles(count);

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(p.galaxy, 3));
    geometry.setAttribute("aField", new BufferAttribute(p.field, 3));
    // position is never written back into the source arrays; the aliasing
    // between `position` and the galaxy state is read-only
    geometry.setAttribute("aGalaxy", new BufferAttribute(p.galaxy, 3));
    geometry.setAttribute("aColor", new BufferAttribute(p.colors, 3));
    geometry.setAttribute("aSeed", new BufferAttribute(p.seeds, 1));
    geometry.setAttribute("aSize", new BufferAttribute(p.sizes, 1));
    geometry.setAttribute("aBright", new BufferAttribute(p.brights, 1));
    geometry.setAttribute("aStaggerF", new BufferAttribute(p.staggerF, 1));

    const uniforms = {
      uTime: new Uniform(0),
      uIntro: new Uniform(0),
      uForm: new Uniform(0),
      uFovScale: new Uniform(1000),
      uSizeScale: new Uniform(0.95),
    };

    const material = new ShaderMaterial({
      uniforms,
      vertexShader: ASTRA6_VERT,
      fragmentShader: ASTRA6_FRAG,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });

    const points = new Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    // ---- static far backdrop so the void keeps depth in every state ----
    const ambientCount = cap.tier === 2 ? 4200 : 2100;
    const ambient = buildAstra6Ambient(ambientCount);
    const ambientGeometry = new BufferGeometry();
    ambientGeometry.setAttribute(
      "position",
      new BufferAttribute(ambient.positions, 3),
    );
    ambientGeometry.setAttribute("aPosition", new BufferAttribute(ambient.positions, 3));
    ambientGeometry.setAttribute("aColor", new BufferAttribute(ambient.colors, 3));
    ambientGeometry.setAttribute("aSeed", new BufferAttribute(ambient.seeds, 1));
    ambientGeometry.setAttribute("aSize", new BufferAttribute(ambient.sizes, 1));
    ambientGeometry.setAttribute("aBright", new BufferAttribute(ambient.brights, 1));

    const ambientUniforms = {
      uTime: uniforms.uTime,
      uIntro: uniforms.uIntro,
      uFovScale: uniforms.uFovScale,
    };
    const ambientMaterial = new ShaderMaterial({
      uniforms: ambientUniforms,
      vertexShader: ASTRA6_AMBIENT_VERT,
      fragmentShader: ASTRA6_FRAG,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    const ambientPoints = new Points(ambientGeometry, ambientMaterial);
    ambientPoints.frustumCulled = false;
    scene.add(ambientPoints);

    const composer = new EffectComposer(renderer, {
      depthBuffer: false,
      frameBufferType: HalfFloatType,
      multisampling: 0,
    });
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new EffectPass(
        camera,
        new BloomEffect({
          intensity: 1.05,
          luminanceThreshold: 0.08,
          luminanceSmoothing: 0.28,
          mipmapBlur: true,
          radius: 0.85,
          levels: cap.tier === 2 ? 7 : 5,
        }),
      ),
    );
    composer.addPass(
      new EffectPass(
        camera,
        new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC }),
      ),
    );

    const resize = () => {
      const w = Math.max(1, stage.clientWidth);
      const h = Math.max(1, stage.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      // pull back until the galaxy fills the viewport without clipping
      const visibleHeight =
        2 * Math.tan((camera.fov * Math.PI) / 360) * BASE_Z;
      const visibleWidth = visibleHeight * camera.aspect;
      const needed = GALAXY_DIAMETER / (visibleWidth * VIEW_FILL);
      camera.position.z = BASE_Z * Math.max(1, needed);

      uniforms.uFovScale.value =
        (h * dpr) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    };
    resize();

    // ---- the clock: sequence time only accumulates while the tab is
    // visible (rAF drives it), so hiding the pane pauses the show instead
    // of skipping it. Replay restarts from zero. ----
    let elapsed = 0;
    replayRef.current = () => {
      elapsed = 0;
    };

    let alive = true;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!alive) return;

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      uniforms.uTime.value = elapsed;
      uniforms.uIntro.value = smoothstep(0, INTRO_END, elapsed);
      uniforms.uForm.value = smoothstep(FORM_START, FORM_END, elapsed);

      composer.render(dt);
    };

    canvas.style.opacity = "1";

    if (cap.software) {
      // one formed static frame: no per-frame rendering at all
      uniforms.uTime.value = 0;
      uniforms.uIntro.value = 1;
      uniforms.uForm.value = 1;
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(tick);
    }

    const onVisibility = () => {
      if (document.hidden) {
        alive = false;
        cancelAnimationFrame(raf);
      } else if (!alive) {
        alive = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      alive = false;
      cancelAnimationFrame(raf);
      canvas.style.opacity = "0";
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      replayRef.current = null;
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      geometry.dispose();
      ambientGeometry.dispose();
      material.dispose();
      ambientMaterial.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, [dict]);

  return (
    <section
      ref={rootRef}
      className="astra6-root relative h-[100svh] overflow-hidden"
    >
      <div ref={stageRef} className="absolute inset-0">
        <span className="astra6-fallback" aria-hidden />
        <canvas
          ref={canvasRef}
          aria-hidden
          className="astra6-canvas absolute inset-0 h-full w-full opacity-0 mix-blend-screen transition-opacity duration-1000"
        />
      </div>

      <span className="astra6-label astra6-label--left" aria-hidden>
        {copy?.brandLeft ?? "Layer"}
      </span>
      <span className="astra6-label astra6-label--right" aria-hidden>
        {copy?.brandRight ?? "07"}
      </span>

      <button
        type="button"
        className="astra6-replay"
        onClick={() => replayRef.current?.()}
      >
        <span aria-hidden>↻</span> {copy?.replay ?? "Repetir"}
      </button>

      <p className="astra6-note">{copy?.note ?? ""}</p>
    </section>
  );
}
