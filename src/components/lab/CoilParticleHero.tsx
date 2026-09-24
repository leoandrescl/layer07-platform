"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  HalfFloatType,
  NoToneMapping,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Uniform,
  Vector2,
  WebGLRenderer,
} from "three";
import {
  BlendFunction,
  BloomEffect,
  ChromaticAberrationEffect,
  Effect,
  EffectComposer,
  EffectPass,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
} from "postprocessing";
import { detectCapability } from "@/lib/webgl/capability";
import { SEVEN_PATH, ZERO } from "@/components/hero/glyphs";
import { GALAXY, buildGalaxySeven, buildStarfield } from "@/components/hero/particles";
import {
  POINT_FRAG,
  STARFIELD_VERT,
  streakFragment,
} from "@/components/hero/hero-shaders";
import { COIL_VERT, CORE_FRAG, CORE_VERT } from "./coil-shaders";
import type { LabHeroProps } from "@/lib/lab/heroes";

function clamp(value: number, min = 0, max = 1) {
  return value < min ? min : value > max ? max : value;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

const BASE_Z = 9;
const GALAXY_DIAMETER = GALAXY.outerRadius * 2;
const VIEW_FILL = 0.92;

class StreakEffect extends Effect {
  constructor(samples: number) {
    const tint = new Color("#9fe3ff");
    super("StreakEffect", streakFragment(samples), {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["uStrength", new Uniform(0.6)],
        ["uThreshold", new Uniform(0.5)],
        ["uTintR", new Uniform(tint.r)],
        ["uTintG", new Uniform(tint.g)],
        ["uTintB", new Uniform(tint.b)],
        ["uVignette", new Uniform(0.55)],
        ["uGrain", new Uniform(0.03)],
      ]),
    });
  }
}

export function CoilParticleHero({ dict }: LabHeroProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const copy = dict?.home.hero;

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const root = rootRef.current;
    if (!canvas || !stage || !root) return;

    const cap = detectCapability();
    root.dataset.tier = String(cap.tier);
    if (cap.tier === 0 && !cap.software) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: false,
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
    renderer.setClearColor(0x000000, 1);

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 120);
    camera.position.set(0, 0, 9);

    const count = cap.tier === 2 ? 14000 : 7000;
    const buffers = buildGalaxySeven(count);
    const aCoil = new Float32Array(count);
    for (let i = 0; i < count; i += 1) aCoil[i] = Math.random();

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(buffers.position, 3));
    geometry.setAttribute("aScatter", new BufferAttribute(buffers.aScatter, 3));
    geometry.setAttribute("aLateral", new BufferAttribute(buffers.aLateral, 1));
    geometry.setAttribute("aZ", new BufferAttribute(buffers.aZ, 1));
    geometry.setAttribute("aGlyph", new BufferAttribute(buffers.aGlyph, 1));
    geometry.setAttribute("aPhase", new BufferAttribute(buffers.aPhase, 1));
    geometry.setAttribute("aSpeed", new BufferAttribute(buffers.aSpeed, 1));
    geometry.setAttribute("aArm", new BufferAttribute(buffers.aArm, 1));
    geometry.setAttribute("aSpread", new BufferAttribute(buffers.aSpread, 1));
    geometry.setAttribute("aHeight", new BufferAttribute(buffers.aHeight, 1));
    geometry.setAttribute("aSeed", new BufferAttribute(buffers.aSeed, 1));
    geometry.setAttribute("aSize", new BufferAttribute(buffers.aSize, 1));
    geometry.setAttribute("aColor", new BufferAttribute(buffers.aColor, 3));
    geometry.setAttribute("aBright", new BufferAttribute(buffers.aBright, 1));
    geometry.setAttribute("aCoil", new BufferAttribute(aCoil, 1));

    const coreColor = new Color("#ffd7a8");
    const uniforms = {
      uTime: new Uniform(0),
      uIntro: new Uniform(0),
      uForm: new Uniform(0),
      uMorph: new Uniform(0),
      uArms: new Uniform(GALAXY.arms),
      uCoreRadius: new Uniform(GALAXY.coreRadius),
      uOuterRadius: new Uniform(GALAXY.outerRadius),
      uTwist: new Uniform(GALAXY.twist),
      uRadialCurve: new Uniform(GALAXY.radialCurve),
      uThickness: new Uniform(GALAXY.thickness),
      uSpin: new Uniform<number>(GALAXY.spin),
      uFlowSpeed: new Uniform(GALAXY.flowSpeed),
      uFovScale: new Uniform(1000),
      uSizeScale: new Uniform(1),
      uCoilRadius: new Uniform(0.14),
      uCoilTurns: new Uniform(10),
      uCoilSpin: new Uniform(0.5),
      uCoilDepth: new Uniform(0.7),
      uCoreColor: new Uniform(coreColor),
      uP0: new Uniform(new Vector2(SEVEN_PATH.p0.x, SEVEN_PATH.p0.y)),
      uC1: new Uniform(new Vector2(SEVEN_PATH.c1.x, SEVEN_PATH.c1.y)),
      uP1: new Uniform(new Vector2(SEVEN_PATH.p1.x, SEVEN_PATH.p1.y)),
      uC2: new Uniform(new Vector2(SEVEN_PATH.c2.x, SEVEN_PATH.c2.y)),
      uP2: new Uniform(new Vector2(SEVEN_PATH.p2.x, SEVEN_PATH.p2.y)),
      uZeroCenter: new Uniform(new Vector2(ZERO.center.x, ZERO.center.y)),
      uZeroR: new Uniform(new Vector2(ZERO.rx, ZERO.ry)),
    };

    const material = new ShaderMaterial({
      uniforms,
      vertexShader: COIL_VERT,
      fragmentShader: POINT_FRAG,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });

    const points = new Points(geometry, material);
    points.frustumCulled = false;

    const tiltGroup = new Group();
    tiltGroup.rotation.x = 0.5;
    tiltGroup.add(points);
    const pivot = new Group();
    pivot.add(tiltGroup);
    scene.add(pivot);

    // ---- luminous nucleus inside the "0" ----
    const coreGeometry = new BufferGeometry();
    coreGeometry.setAttribute(
      "position",
      new BufferAttribute(
        new Float32Array([ZERO.center.x, ZERO.center.y, 0]),
        3,
      ),
    );
    const coreUniforms = {
      uFovScale: uniforms.uFovScale,
      uSize: new Uniform(0.7),
      uColor: new Uniform(new Color("#fff0d6")),
      uOpacity: new Uniform(0),
    };
    const coreMaterial = new ShaderMaterial({
      uniforms: coreUniforms,
      vertexShader: CORE_VERT,
      fragmentShader: CORE_FRAG,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    const corePoints = new Points(coreGeometry, coreMaterial);
    corePoints.frustumCulled = false;
    tiltGroup.add(corePoints);

    const starCount = cap.tier === 2 ? 2500 : 1200;
    const starBuffers = buildStarfield(starCount);
    const starGeometry = new BufferGeometry();
    starGeometry.setAttribute(
      "position",
      new BufferAttribute(starBuffers.position, 3),
    );
    starGeometry.setAttribute("aBase", new BufferAttribute(starBuffers.aBase, 3));
    starGeometry.setAttribute("aSize", new BufferAttribute(starBuffers.aSize, 1));
    starGeometry.setAttribute(
      "aBright",
      new BufferAttribute(starBuffers.aBright, 1),
    );
    starGeometry.setAttribute("aSeed", new BufferAttribute(starBuffers.aSeed, 1));
    starGeometry.setAttribute(
      "aSpeed",
      new BufferAttribute(starBuffers.aSpeed, 1),
    );
    starGeometry.setAttribute(
      "aColor",
      new BufferAttribute(starBuffers.aColor, 3),
    );

    const starUniforms = {
      uTime: uniforms.uTime,
      uReveal: new Uniform(0),
      uFovScale: uniforms.uFovScale,
    };
    const starMaterial = new ShaderMaterial({
      uniforms: starUniforms,
      vertexShader: STARFIELD_VERT,
      fragmentShader: POINT_FRAG,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    const starPoints = new Points(starGeometry, starMaterial);
    starPoints.frustumCulled = false;
    scene.add(starPoints);

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
          intensity: 1,
          luminanceThreshold: 0.1,
          luminanceSmoothing: 0.24,
          mipmapBlur: true,
          radius: 0.82,
          levels: cap.tier === 2 ? 7 : 5,
        }),
      ),
    );
    const streak = new StreakEffect(cap.tier === 2 ? 17 : 9);
    const chromatic = new ChromaticAberrationEffect({
      offset: new Vector2(0.0011, 0.0011),
      radialModulation: true,
      modulationOffset: 0.35,
    });
    const toneMapping = new ToneMappingEffect({
      mode: ToneMappingMode.ACES_FILMIC,
    });
    composer.addPass(new EffectPass(camera, streak, chromatic, toneMapping));

    const resize = () => {
      const w = Math.max(1, stage.clientWidth);
      const h = Math.max(1, stage.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const visibleHeight =
        2 * Math.tan((camera.fov * Math.PI) / 360) * BASE_Z;
      const visibleWidth = visibleHeight * camera.aspect;
      const needed = GALAXY_DIAMETER / (visibleWidth * VIEW_FILL);
      camera.position.z = BASE_Z * Math.max(1, needed);

      uniforms.uFovScale.value =
        (h * dpr) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    };
    resize();

    // ---- drag to rotate (hold left mouse button) ----
    const rot = { yaw: 0, yawTarget: 0, tiltOffset: 0, tiltTarget: 0 };
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const DRAG_SENSITIVITY = 1.6;
    const DAMPING = 0.05;
    const DRAG_DAMPING = 0.24;
    const MAX_TILT = 0.85;

    const canStartDrag = (target: EventTarget | null) =>
      target instanceof Element
        ? !target.closest("a, button, input, textarea, select")
        : true;

    const onDragDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (event.button !== 0) return;
      if (!canStartDrag(event.target)) return;
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.style.cursor = "grabbing";
    };
    const onDragMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = (event.clientX - lastX) / window.innerWidth;
      const dy = (event.clientY - lastY) / window.innerHeight;
      rot.yawTarget += dx * Math.PI * DRAG_SENSITIVITY;
      rot.tiltTarget = Math.max(
        -MAX_TILT,
        Math.min(MAX_TILT, rot.tiltTarget + dy * Math.PI * DRAG_SENSITIVITY),
      );
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onDragUp = () => {
      dragging = false;
      canvas.style.cursor = "";
    };

    let alive = true;
    let raf = 0;
    let elapsed = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!alive) return;

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      uniforms.uTime.value = elapsed;
      uniforms.uIntro.value = reduced ? 1 : smoothstep(0, 0.25, elapsed);
      uniforms.uForm.value = reduced ? 1 : smoothstep(0.3, 1.35, elapsed);
      uniforms.uSpin.value = reduced ? 0 : GALAXY.spin;
      starUniforms.uReveal.value = smoothstep(0, 0.7, elapsed);

      const damp = Math.min(1, (dragging ? DRAG_DAMPING : DAMPING) + dt * 3);
      rot.yaw += (rot.yawTarget - rot.yaw) * damp;
      rot.tiltOffset += (rot.tiltTarget - rot.tiltOffset) * damp;
      pivot.rotation.y = rot.yaw;
      tiltGroup.rotation.x = 0.5 + rot.tiltOffset;

      const scrollable = Math.max(1, root.offsetHeight - window.innerHeight);
      const progress = clamp(window.scrollY / scrollable);
      const morph = smoothstep(0.05, 0.5, progress);
      uniforms.uMorph.value = morph;

      const corePulse = 0.55 + 0.45 * Math.sin(elapsed * 1.5);
      coreUniforms.uOpacity.value = reduced
        ? morph
        : morph * corePulse * smoothstep(0.2, 1.0, elapsed);

      composer.render(dt);
    };

    canvas.style.opacity = "1";

    if (cap.software) {
      uniforms.uIntro.value = 1;
      uniforms.uForm.value = 1;
      uniforms.uMorph.value = 1;
      starUniforms.uReveal.value = 1;
      coreUniforms.uOpacity.value = 1;
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
    window.addEventListener("pointerdown", onDragDown);
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragUp);
    window.addEventListener("pointercancel", onDragUp);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      window.removeEventListener("pointerdown", onDragDown);
      window.removeEventListener("pointermove", onDragMove);
      window.removeEventListener("pointerup", onDragUp);
      window.removeEventListener("pointercancel", onDragUp);
      geometry.dispose();
      coreGeometry.dispose();
      starGeometry.dispose();
      material.dispose();
      coreMaterial.dispose();
      starMaterial.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, [dict]);

  return (
    <section
      ref={rootRef}
      id="hero"
      data-field="0"
      className="l07-hero l07-stage relative"
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] overflow-hidden mix-blend-screen"
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full cursor-grab opacity-0 transition-opacity duration-1000"
        />

        <div className="pointer-events-none absolute inset-0 z-10">
          <span className="hero-side hero-side-left">
            {copy?.studio ?? "Estudio de producto digital"}
          </span>
          <div className="hero-side hero-side-right">
            <span className="hero-side-dot" aria-hidden />
            {copy?.available ?? "Disponible para proyectos"}
          </div>
          <div className="hero-bottom">
            <span>{copy?.build ?? "Desliza para construir"}</span>
            <span>coil · lab</span>
          </div>
        </div>
      </div>
    </section>
  );
}
