"use client";

import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";
import {
  BlendFunction,
  BloomEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  VignetteEffect,
} from "postprocessing";
import gsap from "gsap";
import { Button } from "@/components/ui/Button";
import { detectCapability } from "@/lib/webgl/capability";
import { setHeroActive } from "@/lib/hero-state";
import { SITE } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { WORD_WIDTH } from "./glyphs";
import { buildFormation, buildStarfield } from "./particles";
import { FORMATION_VERT, POINT_FRAG, STARFIELD_VERT } from "./hero-shaders";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

export function L07ParticleHero({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackRef = useRef<HTMLDivElement | null>(null);

  const { hero } = dict.home;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const active = entry.isIntersecting;
        setHeroActive(active);
        document.documentElement.dataset.hero = active ? "active" : "";
      },
      { threshold: 0 },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      setHeroActive(false);
      delete document.documentElement.dataset.hero;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const root = rootRef.current;
    if (!canvas || !stage || !root) return;

    const cap = detectCapability();
    root.dataset.tier = String(cap.tier);
    if (cap.tier === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      root.dataset.tier = "0";
      return;
    }

    const ratio = Math.min(cap.dpr * cap.resolutionScale, cap.tier === 2 ? 1.5 : 1.15);
    renderer.setPixelRatio(ratio);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setClearAlpha(0);

    const scene = new Scene();
    const camera = new PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const shared = {
      uTime: { value: 0 },
      uIntro: { value: 0 },
      uReveal: { value: 0 },
      uFovScale: { value: 1 },
      uPointer: { value: new Vector2(999, 999) },
      uPointerStrength: { value: 0 },
    };

    const formationCount = cap.tier === 2 ? 20000 : 8000;
    const starfieldCount = cap.tier === 2 ? 16000 : 6000;

    const formation = buildFormation(formationCount);
    const formationGeometry = new BufferGeometry();
    formationGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(formation.position, 3),
    );
    formationGeometry.setAttribute(
      "aTarget",
      new Float32BufferAttribute(formation.aTarget, 3),
    );
    formationGeometry.setAttribute(
      "aPhase",
      new Float32BufferAttribute(formation.aPhase, 1),
    );
    formationGeometry.setAttribute(
      "aSpeed",
      new Float32BufferAttribute(formation.aSpeed, 1),
    );
    formationGeometry.setAttribute(
      "aSize",
      new Float32BufferAttribute(formation.aSize, 1),
    );
    formationGeometry.setAttribute(
      "aBright",
      new Float32BufferAttribute(formation.aBright, 1),
    );
    formationGeometry.setAttribute(
      "aSeed",
      new Float32BufferAttribute(formation.aSeed, 1),
    );
    formationGeometry.setAttribute(
      "aColor",
      new Float32BufferAttribute(formation.aColor, 3),
    );
    formationGeometry.setAttribute(
      "aRadius0",
      new Float32BufferAttribute(formation.aRadius0, 1),
    );
    formationGeometry.setAttribute(
      "aSpin",
      new Float32BufferAttribute(formation.aSpin, 1),
    );
    formationGeometry.setAttribute(
      "aDepth",
      new Float32BufferAttribute(formation.aDepth, 1),
    );

    const formationMaterial = new ShaderMaterial({
      vertexShader: FORMATION_VERT,
      fragmentShader: POINT_FRAG,
      uniforms: {
        ...shared,
        uFlow: { value: 0.07 },
        uTwist: { value: 2.6 },
        uSpin: { value: 0.08 },
        uTurb: { value: cap.tier === 2 ? 0.5 : 0.36 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    const formationPoints = new Points(formationGeometry, formationMaterial);
    formationPoints.frustumCulled = false;
    scene.add(formationPoints);

    const starfield = buildStarfield(starfieldCount);
    const starfieldGeometry = new BufferGeometry();
    starfieldGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(starfield.position, 3),
    );
    starfieldGeometry.setAttribute(
      "aBase",
      new Float32BufferAttribute(starfield.aBase, 3),
    );
    starfieldGeometry.setAttribute(
      "aSize",
      new Float32BufferAttribute(starfield.aSize, 1),
    );
    starfieldGeometry.setAttribute(
      "aBright",
      new Float32BufferAttribute(starfield.aBright, 1),
    );
    starfieldGeometry.setAttribute(
      "aSeed",
      new Float32BufferAttribute(starfield.aSeed, 1),
    );
    starfieldGeometry.setAttribute(
      "aSpeed",
      new Float32BufferAttribute(starfield.aSpeed, 1),
    );
    starfieldGeometry.setAttribute(
      "aColor",
      new Float32BufferAttribute(starfield.aColor, 3),
    );

    const starfieldMaterial = new ShaderMaterial({
      vertexShader: STARFIELD_VERT,
      fragmentShader: POINT_FRAG,
      uniforms: { ...shared },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    const starfieldPoints = new Points(starfieldGeometry, starfieldMaterial);
    starfieldPoints.frustumCulled = false;
    scene.add(starfieldPoints);

    let composer: EffectComposer | null = null;
    if (cap.tier === 2) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new BloomEffect({
        luminanceThreshold: 0.22,
        intensity: 1.15,
        mipmapBlur: true,
        radius: 0.85,
      });
      const vignette = new VignetteEffect({ darkness: 0.72, offset: 0.24 });
      const noise = new NoiseEffect({
        blendFunction: BlendFunction.OVERLAY,
        premultiply: true,
      });
      noise.blendMode.opacity.value = 0.1;
      composer.addPass(new EffectPass(camera, bloom, vignette, noise));
    }

    let fit = 1;
    const resize = () => {
      const width = Math.max(1, stage.clientWidth);
      const height = Math.max(1, stage.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      composer?.setSize(width, height);

      const visibleHeight =
        2 * Math.tan(((camera.fov / 2) * Math.PI) / 180) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;
      fit = Math.min(
        (visibleWidth * 0.6) / WORD_WIDTH,
        (visibleHeight * 0.42) / 1,
      );
      formationPoints.scale.setScalar(fit);
      shared.uFovScale.value =
        (height * ratio) /
        (2 * Math.tan(((camera.fov / 2) * Math.PI) / 180));
    };
    resize();

    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };
    let strengthTarget = 0;

    const onPointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      pointerTarget.x = clamp01((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerTarget.y = -clamp01((event.clientY - rect.top) / rect.height) * 2 + 1;
      strengthTarget = 1;
    };
    const onPointerLeave = () => {
      strengthTarget = 0;
    };
    const onPointerDown = () => {
      strengthTarget = 2.6;
    };

    let alive = true;
    let raf = 0;
    let last = performance.now();
    let time = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!alive) return;

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;

      pointer.x = lerp(pointer.x, pointerTarget.x, 0.06);
      pointer.y = lerp(pointer.y, pointerTarget.y, 0.06);

      shared.uTime.value = time;
      shared.uReveal.value = smoothstep(0, 0.9, time);
      shared.uIntro.value = smoothstep(0.6, 3.2, time);

      const visibleHeight =
        2 * Math.tan(((camera.fov / 2) * Math.PI) / 180) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;
      shared.uPointer.value.set(
        pointer.x * (visibleWidth / 2),
        pointer.y * (visibleHeight / 2),
      );
      shared.uPointerStrength.value = lerp(
        shared.uPointerStrength.value,
        strengthTarget,
        0.08,
      );
      strengthTarget = lerp(strengthTarget, 1, 0.02);

      const height = Math.max(1, root.offsetHeight);
      const exit = clamp01((window.scrollY - height * 0.15) / (height * 0.7));

      formationPoints.rotation.y = lerp(
        formationPoints.rotation.y,
        pointer.x * 0.2,
        0.05,
      );
      formationPoints.rotation.x = lerp(
        formationPoints.rotation.x,
        -pointer.y * 0.12 + exit * 0.5,
        0.05,
      );
      formationPoints.position.y = exit * 1.4;
      formationPoints.position.z = -exit * 1.2;

      starfieldPoints.position.y = exit * 0.5;

      canvas.style.opacity = String(1 - clamp01((exit - 0.2) / 0.7));

      if (composer) {
        composer.render(dt);
      } else {
        renderer.render(scene, camera);
      }
    };

    canvas.style.opacity = "1";
    if (fallbackRef.current) fallbackRef.current.style.opacity = "0";
    raf = requestAnimationFrame(tick);

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
      if (fallbackRef.current) fallbackRef.current.style.opacity = "1";
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    stage.addEventListener("pointerleave", onPointerLeave);
    stage.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);

    const context = gsap.context(() => {
      if (reduced) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          "[data-hero-fade]",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, delay: 1.2 },
        );
    }, root);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      context.revert();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      stage.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      formationGeometry.dispose();
      starfieldGeometry.dispose();
      formationMaterial.dispose();
      starfieldMaterial.dispose();
      composer?.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="hero"
      data-field="0"
      className="l07-hero l07-stage relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      <div className="shell relative flex flex-1 flex-col justify-center pt-28 pb-6 md:pt-32">
        <p data-hero-fade className="eyebrow text-center">
          {hero.eyebrow}
        </p>

        <div
          ref={stageRef}
          className="relative mx-auto mt-2 aspect-[16/9] w-full max-w-[1000px] max-lg:aspect-[4/3]"
        >
          <div
            ref={fallbackRef}
            aria-hidden
            className="l07-fallback transition-opacity duration-1000"
          >
            L07
          </div>
          <canvas
            ref={canvasRef}
            aria-hidden
            className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000"
          />
        </div>

        <h1 className="sr-only">
          {hero.title} {hero.titleAccent}
        </h1>
        <p data-hero-fade className="lede mx-auto mt-4 max-w-xl text-center">
          {hero.lede}
        </p>
        <div data-hero-fade className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href={`/${locale}/contact`}>{hero.primary}</Button>
          <Button href={`/${locale}/work`} variant="outline">
            {hero.secondary}
          </Button>
        </div>
      </div>

      <div className="shell relative flex items-end justify-between pb-8">
        <div className="flex items-center gap-3">
          <span className="l07-cue-line" aria-hidden />
          <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
            {hero.hint}
          </span>
        </div>
        <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
          {SITE.location}
        </span>
      </div>
    </section>
  );
}
