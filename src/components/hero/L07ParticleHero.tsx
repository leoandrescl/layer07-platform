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
import gsap from "gsap";
import { Button } from "@/components/ui/Button";
import { detectCapability } from "@/lib/webgl/capability";
import { setHeroActive } from "@/lib/hero-state";
import { SITE } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { GALAXY, buildGalaxySeven, buildStarfield } from "./particles";
import { GALAXY_VERT, POINT_FRAG, STARFIELD_VERT, streakFragment } from "./hero-shaders";

function clamp(value: number, min = 0, max = 1) {
  return value < min ? min : value > max ? max : value;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

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

export function L07ParticleHero({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const rootRef = useRef<HTMLElement | null>(null);
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
    const root = rootRef.current;
    if (!canvas || !root) return;

    const cap = detectCapability();
    root.dataset.tier = String(cap.tier);
    if (cap.tier === 0) return;

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
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(buffers.position, 3));
    geometry.setAttribute("aTarget", new BufferAttribute(buffers.aTarget, 3));
    geometry.setAttribute("aPhase", new BufferAttribute(buffers.aPhase, 1));
    geometry.setAttribute("aSpeed", new BufferAttribute(buffers.aSpeed, 1));
    geometry.setAttribute("aArm", new BufferAttribute(buffers.aArm, 1));
    geometry.setAttribute("aSpread", new BufferAttribute(buffers.aSpread, 1));
    geometry.setAttribute("aHeight", new BufferAttribute(buffers.aHeight, 1));
    geometry.setAttribute("aSeed", new BufferAttribute(buffers.aSeed, 1));
    geometry.setAttribute("aSize", new BufferAttribute(buffers.aSize, 1));
    geometry.setAttribute("aColor", new BufferAttribute(buffers.aColor, 3));
    geometry.setAttribute("aBright", new BufferAttribute(buffers.aBright, 1));

    const coreColor = new Color("#ffd7a8");
    const uniforms = {
      uTime: new Uniform(0),
      uIntro: new Uniform(0),
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
      uCoreColor: new Uniform(coreColor),
    };

    const material = new ShaderMaterial({
      uniforms,
      vertexShader: GALAXY_VERT,
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

    let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const resize = () => {
      const w = Math.max(1, root.clientWidth);
      const h = Math.max(1, root.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.uFovScale.value =
        (h * dpr) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    };
    resize();

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
      uniforms.uIntro.value = reduced ? 1 : smoothstep(0.5, 2.6, elapsed);
      uniforms.uSpin.value = reduced ? 0 : GALAXY.spin;
      starUniforms.uReveal.value = smoothstep(0, 0.8, elapsed);

      const height = Math.max(1, root.offsetHeight);
      const exit = clamp((window.scrollY - height * 0.15) / (height * 0.7));
      pivot.position.y = exit * 1.2;
      pivot.rotation.y = exit * 0.4;
      canvas.style.opacity = String(1 - clamp((exit - 0.2) / 0.7));

      composer.render(dt);
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
    resizeObserver.observe(root);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);

    const context = gsap.context(() => {
      if (reduced) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          "[data-hero-fade]",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, delay: 1.1 },
        );
    }, root);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      context.revert();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      geometry.dispose();
      starGeometry.dispose();
      material.dispose();
      starMaterial.dispose();
      composer.dispose();
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
      <div
        ref={fallbackRef}
        aria-hidden
        className="l07-fallback transition-opacity duration-1000"
      >
        7
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-72 bg-gradient-to-t from-black via-black/60 to-transparent"
      />

      <div className="pointer-events-none relative z-10 flex min-h-[100svh] flex-1 flex-col justify-between pt-24 pb-8">
        <div className="shell">
          <p data-hero-fade className="eyebrow text-center">
            {hero.eyebrow}
          </p>
        </div>

        <div className="shell flex flex-col items-center gap-7">
          <h1 className="sr-only">
            {hero.title} {hero.titleAccent}
          </h1>
          <p data-hero-fade className="lede mx-auto max-w-xl text-center">
            {hero.lede}
          </p>
          <div
            data-hero-fade
            className="pointer-events-auto flex flex-wrap justify-center gap-3"
          >
            <Button href={`/${locale}/contact`}>{hero.primary}</Button>
            <Button href={`/${locale}/work`} variant="outline">
              {hero.secondary}
            </Button>
          </div>
        </div>

        <div className="shell flex items-end justify-between">
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
      </div>
    </section>
  );
}
