"use client";

import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  Euler,
  Fog,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  Plane,
  PMREMGenerator,
  PointLight,
  Quaternion,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  BlendFunction,
  BloomEffect,
  ChromaticAberrationEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  VignetteEffect,
} from "postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/Button";
import { detectCapability } from "@/lib/webgl/capability";
import { setHeroActive } from "@/lib/hero-state";
import { SITE } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  actIndex,
  actOpacities,
  cameraAt,
  computeTransform,
  createLayers,
  MATTER,
} from "./matter";

const STAGE_COLOR = 0x08080b;
const ACCENT = "#7a88ff";

export function DigitalMatterHero({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const capsRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const ticksRef = useRef<HTMLDivElement>(null);

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
        antialias: cap.tier === 2,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      root.dataset.tier = "0";
      return;
    }

    const ratio = Math.min(cap.dpr * cap.resolutionScale, cap.tier === 2 ? 1.5 : 1.1);
    renderer.setPixelRatio(ratio);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = SRGBColorSpace;

    const scene = new Scene();
    scene.background = new Color(STAGE_COLOR);
    scene.fog = new Fog(STAGE_COLOR, 9, 18);

    const camera = new PerspectiveCamera(35, 1, 0.1, 100);

    let envTarget: { dispose: () => void } | null = null;
    if (cap.tier === 2) {
      const pmrem = new PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const env = pmrem.fromScene(room, 0.04);
      scene.environment = env.texture;
      envTarget = env;
      pmrem.dispose();
    }

    const keyLight = new DirectionalLight(0xf4f1ec, cap.tier === 2 ? 2.3 : 3.2);
    keyLight.position.set(4, 6, 3);
    scene.add(keyLight);

    const rimLight = new DirectionalLight(0x7a88ff, 1.5);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    const coreLight = new PointLight(0x7a88ff, 8, 9, 2);
    scene.add(coreLight);

    const layers = cap.tier === 2 ? MATTER.layersHigh : MATTER.layersLow;
    const step = MATTER.height / (layers - 1);
    const thickness = step * MATTER.thicknessRatio;
    const radius = Math.min(thickness * 0.36, 0.012);

    const shellGeometry = new RoundedBoxGeometry(
      MATTER.width,
      thickness,
      MATTER.depth,
      2,
      radius,
    );
    const coreGeometry = new RoundedBoxGeometry(
      MATTER.width * 0.8,
      thickness * 0.5,
      MATTER.depth * 0.8,
      2,
      radius * 0.5,
    );

    const shellMaterial = new MeshPhysicalMaterial({
      color: new Color("#15151b"),
      metalness: 0.62,
      roughness: 0.26,
      clearcoat: 0.7,
      clearcoatRoughness: 0.35,
      envMapIntensity: cap.tier === 2 ? 1.15 : 0.4,
      sheen: 0.25,
      sheenColor: new Color("#9aa4ff"),
    });

    const coreMaterial = new MeshBasicMaterial({
      color: new Color(ACCENT),
      toneMapped: false,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    const shell = new InstancedMesh(shellGeometry, shellMaterial, layers);
    shell.instanceMatrix.setUsage(DynamicDrawUsage);
    shell.frustumCulled = false;
    scene.add(shell);

    const core = new InstancedMesh(coreGeometry, coreMaterial, layers);
    core.instanceMatrix.setUsage(DynamicDrawUsage);
    core.frustumCulled = false;
    scene.add(core);

    let composer: EffectComposer | null = null;
    let chromatic: ChromaticAberrationEffect | null = null;

    if (cap.tier === 2) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      const bloom = new BloomEffect({
        luminanceThreshold: 0.5,
        intensity: 1.15,
        mipmapBlur: true,
        radius: 0.72,
      });
      const vignette = new VignetteEffect({ darkness: 0.62, offset: 0.28 });
      const noise = new NoiseEffect({
        blendFunction: BlendFunction.OVERLAY,
        premultiply: true,
      });
      noise.blendMode.opacity.value = 0.14;
      chromatic = new ChromaticAberrationEffect({
        offset: new Vector2(0.0006, 0.0006),
        radialModulation: false,
        modulationOffset: 0,
      });

      composer.addPass(
        new EffectPass(camera, bloom, vignette, noise, chromatic),
      );
    }

    const layerData = createLayers(layers);
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3();
    const coreScale = new Vector3();
    const euler = new Euler();
    const matrix = new Matrix4();
    const camPosition = new Vector3();
    const camTarget = new Vector3();
    const camLook = new Vector3(-1.45, -0.05, 0);
    const hitPoint = new Vector3();
    const cursor = { x: 99, z: 99 };
    const pointer = { x: 0.5, y: 0.5 };
    const ndc = new Vector2();
    const raycaster = new Raycaster();
    const plane = new Plane(new Vector3(0, 0, 1), 0);

    let progress = 0;
    let lastProgress = 0;
    let velocity = 0;
    let time = 0;
    let pulse = 0;
    let pulsePhase = 0;
    let currentAct = -1;

    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progress = self.progress;
      },
    });

    const applyDom = (value: number) => {
      const opacity = actOpacities(value);
      if (cueRef.current) cueRef.current.style.opacity = String(opacity.cue);
      if (heroTextRef.current) {
        heroTextRef.current.style.opacity = String(opacity.hero);
        heroTextRef.current.style.pointerEvents =
          opacity.hero > 0.5 ? "auto" : "none";
      }
      if (capsRef.current) capsRef.current.style.opacity = String(opacity.capabilities);
      if (manifestoRef.current) {
        manifestoRef.current.style.opacity = String(opacity.manifesto);
      }
      if (wipeRef.current) {
        wipeRef.current.style.transform = `translateY(${(1 - opacity.wipe) * 100}%)`;
      }

      const index = actIndex(value);
      if (index !== currentAct && ticksRef.current) {
        currentAct = index;
        const ticks = ticksRef.current.querySelectorAll("[data-tick]");
        ticks.forEach((tick, i) => {
          tick.setAttribute("data-active", i === index ? "true" : "false");
        });
      }
    };

    const resize = () => {
      const width = Math.max(1, stage.clientWidth);
      const height = Math.max(1, stage.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      composer?.setSize(width, height);
    };
    resize();

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = event.clientY / window.innerHeight;
    };
    const onPointerDown = () => {
      pulse = 1;
      pulsePhase = 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      pointer.x = touch.clientX / window.innerWidth;
      pointer.y = touch.clientY / window.innerHeight;
    };

    let alive = true;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!alive) return;

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;

      if (pulse > 0) {
        pulse = Math.max(0, pulse - dt / 0.9);
        pulsePhase += dt * 9;
      }

      cameraAt(progress, camPosition, camTarget);

      // Portrait screens: center the sculpture and pull back so type can sit above it.
      if (camera.aspect < 0.95) {
        camTarget.x *= 0.3;
        camTarget.y -= 0.12;
        camPosition.z += 1.1;
      }

      camPosition.x += (pointer.x - 0.5) * 0.35;
      camPosition.y += (0.5 - pointer.y) * 0.26;
      camera.position.lerp(camPosition, 0.08);
      camLook.lerp(camTarget, 0.08);
      camera.lookAt(camLook);

      ndc.set(pointer.x * 2 - 1, -(pointer.y * 2 - 1));
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.ray.intersectPlane(plane, hitPoint);
      if (hit) {
        cursor.x = hit.x;
        cursor.z = hit.z;
      }

      for (let i = 0; i < layers; i += 1) {
        const layerT = layers > 1 ? i / (layers - 1) : 0.5;
        computeTransform(
          layerData[i],
          layerT,
          progress,
          MATTER.height,
          cursor,
          time,
          pulse,
          pulsePhase,
          position,
          quaternion,
          scale,
          euler,
        );

        matrix.compose(position, quaternion, scale);
        shell.setMatrixAt(i, matrix);

        coreScale.set(scale.x * 0.8, scale.y * 0.5, scale.z * 0.8);
        matrix.compose(position, quaternion, coreScale);
        core.setMatrixAt(i, matrix);
      }
      shell.instanceMatrix.needsUpdate = true;
      core.instanceMatrix.needsUpdate = true;

      coreLight.intensity = 6 + pulse * 10 + Math.sin(time * 0.8) * 0.6;

      const delta = Math.abs(progress - lastProgress);
      velocity += (Math.min(1, delta * 6) - velocity) * 0.1;
      lastProgress = progress;

      applyDom(progress);

      if (composer) {
        if (chromatic) {
          const amount = 0.0004 + velocity * 0.0016;
          chromatic.offset.set(amount, amount);
        }
        composer.render(dt);
      } else {
        renderer.render(scene, camera);
      }
    };

    applyDom(0);
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
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);

    const context = gsap.context(() => {
      if (reduced) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          "[data-hero-line]",
          { yPercent: 118 },
          { yPercent: 0, duration: 1.1, stagger: 0.09, delay: 0.15 },
        )
        .fromTo(
          "[data-hero-fade]",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 },
          "-=0.6",
        );
    }, root);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      context.revert();
      trigger.kill();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      shellGeometry.dispose();
      coreGeometry.dispose();
      shellMaterial.dispose();
      coreMaterial.dispose();
      envTarget?.dispose();
      composer?.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="hero"
      data-field="0"
      className="matter-hero relative"
    >
      <div
        ref={stageRef}
        className="matter-stage sticky top-0 h-[100svh] overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full"
        />
        <div className="matter-vignette pointer-events-none absolute inset-0" aria-hidden />
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden />

        <div className="relative z-10 flex h-full flex-col">
          <div className="shell flex items-center justify-between pt-24 md:pt-28">
            <p className="eyebrow">{hero.eyebrow}</p>
            <div
              ref={ticksRef}
              aria-hidden
              className="hidden items-center gap-4 sm:flex"
            >
              {hero.acts.map((act, index) => (
                <span
                  key={act}
                  data-tick
                  data-active={index === 0}
                  className="matter-tick"
                >
                  <span className="matter-tick-dot" />
                  <span className="matter-tick-label">{act}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="shell flex flex-1 items-center max-lg:items-start max-lg:pt-10">
            <div ref={heroTextRef} className="max-w-3xl">
              <h1 className="display-xl text-ink">
                <span className="block overflow-hidden pb-[0.06em]">
                  <span data-hero-line className="block">
                    {hero.title}
                  </span>
                </span>
                <span className="block overflow-hidden pb-[0.06em]">
                  <span
                    data-hero-line
                    className="block italic text-accent"
                  >
                    {hero.titleAccent}
                  </span>
                </span>
              </h1>
              <p data-hero-fade className="lede mt-7 max-w-xl">
                {hero.lede}
              </p>
              <div data-hero-fade className="mt-9 flex flex-wrap gap-3">
                <Button href={`/${locale}/contact`}>{hero.primary}</Button>
                <Button href={`/${locale}/work`} variant="outline">
                  {hero.secondary}
                </Button>
              </div>
            </div>
          </div>

          <div className="shell flex items-end justify-between pb-10">
            <div ref={cueRef} className="flex items-center gap-3">
              <span className="matter-cue-line" aria-hidden />
              <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
                {hero.hint}
              </span>
            </div>
            <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
              {SITE.location}
            </span>
          </div>
        </div>

        <div
          ref={capsRef}
          className="pointer-events-none absolute inset-0 z-10 flex items-center opacity-0"
        >
          <ul className="shell space-y-3">
            {hero.capabilities.slice(0, 5).map((capability, index) => (
              <li key={capability} className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-accent">
                  0{index + 1}
                </span>
                <span className="font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-tight tracking-[-0.02em] text-ink">
                  {capability}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div
          ref={manifestoRef}
          className="pointer-events-none absolute inset-0 z-10 flex items-center opacity-0"
        >
          <p className="shell max-w-4xl font-display text-[clamp(1.9rem,5vw,4.25rem)] leading-[1.03] tracking-[-0.03em] text-ink">
            {hero.manifesto}
          </p>
        </div>

        <div
          ref={wipeRef}
          aria-hidden
          className="absolute inset-0 z-20 bg-bg"
          style={{ transform: "translateY(100%)" }}
        />
      </div>
    </section>
  );
}
