"use client";

import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import { Button } from "@/components/ui/Button";
import { detectCapability } from "@/lib/webgl/capability";
import { setHeroActive } from "@/lib/hero-state";
import { SITE } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { buildWord, GLYPH } from "./glyphs";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function readVar(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

export function L07Hero({
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
      ([entry]) => setHeroActive(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      setHeroActive(false);
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
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      root.dataset.tier = "0";
      return;
    }

    const ratio = Math.min(cap.dpr * cap.resolutionScale, cap.tier === 2 ? 1.6 : 1.2);
    renderer.setPixelRatio(ratio);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setClearAlpha(0);

    const scene = new Scene();
    const camera = new PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 3.4);

    const pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    pmrem.dispose();

    const keyLight = new DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const rimCool = new DirectionalLight(0x6d7bff, 4);
    rimCool.position.set(-4, -1, 2);
    scene.add(rimCool);

    const rimWarm = new DirectionalLight(0xff6b8a, 2.6);
    rimWarm.position.set(3, -3, -3);
    scene.add(rimWarm);

    const targetInk = new Color(readVar("--ink", "#0d0d0f"));
    const targetAccent = new Color(readVar("--accent", "#1b2cff"));

    const capMaterial = new MeshPhysicalMaterial({
      color: targetInk.clone(),
      metalness: 0.2,
      roughness: 0.34,
      clearcoat: 0.6,
      clearcoatRoughness: 0.28,
      envMapIntensity: 0.9,
    });
    const sideMaterial = new MeshPhysicalMaterial({
      color: targetAccent.clone(),
      metalness: 0.35,
      roughness: 0.24,
      clearcoat: 0.7,
      clearcoatRoughness: 0.2,
      emissive: targetAccent.clone(),
      emissiveIntensity: 0.14,
      envMapIntensity: 1.1,
    });

    const group = new Group();
    scene.add(group);

    const glyphs = buildWord();
    const meshes: Mesh[] = [];
    const letters = glyphs.map((glyph, index) => {
      const mesh = new Mesh(glyph.geometry, [capMaterial, sideMaterial]);
      mesh.position.set(glyph.x, -GLYPH.cap / 2, 0);
      group.add(mesh);
      meshes.push(mesh);
      return {
        mesh,
        baseX: glyph.x,
        baseY: -GLYPH.cap / 2,
        phase: index * 1.7,
        hover: 0,
      };
    });

    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };
    const ndc = new Vector2();
    const raycaster = new Raycaster();
    let hovered = -1;
    let pulse = 0;
    let fit = 1;

    const resize = () => {
      const width = Math.max(1, stage.clientWidth);
      const height = Math.max(1, stage.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      const visibleHeight =
        2 * Math.tan(((camera.fov / 2) * Math.PI) / 180) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;
      fit = Math.min(
        (visibleWidth * 0.86) / 2.2,
        (visibleHeight * 0.56) / 1,
        1.9,
      );
    };
    resize();

    const onPointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      pointerTarget.x = clamp01((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerTarget.y = -clamp01((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const onPointerLeave = () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
      hovered = -1;
    };
    const onPointerDown = () => {
      pulse = 1;
    };

    const themeObserver = new MutationObserver(() => {
      targetInk.set(readVar("--ink", "#0d0d0f"));
      targetAccent.set(readVar("--accent", "#1b2cff"));
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

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

      pointer.x = lerp(pointer.x, pointerTarget.x, 0.07);
      pointer.y = lerp(pointer.y, pointerTarget.y, 0.07);
      if (pulse > 0) pulse = Math.max(0, pulse - dt / 0.9);

      const height = Math.max(1, root.offsetHeight);
      const exit = clamp01((window.scrollY - height * 0.1) / (height * 0.75));

      group.rotation.y = lerp(group.rotation.y, pointer.x * 0.5, 0.07);
      group.rotation.x = lerp(
        group.rotation.x,
        -pointer.y * 0.32 + exit * 0.5,
        0.07,
      );
      group.position.y = exit * 0.7;
      group.scale.setScalar(fit * (1 - exit * 0.18));

      ndc.set(pointer.x, pointer.y);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(meshes, false);
      hovered = hits.length > 0 ? meshes.indexOf(hits[0].object as Mesh) : -1;

      const intro = easeOutCubic(clamp01(time / 1.15));

      for (let i = 0; i < letters.length; i += 1) {
        const letter = letters[i];
        const local = easeOutCubic(clamp01((time / 1.15 - i * 0.13) / 0.74));
        const isHovered = i === hovered;
        letter.hover = lerp(letter.hover, isHovered ? 1 : 0, 0.12);

        const float = Math.sin(time * 1.1 + letter.phase) * 0.02;
        const grow = 0.72 + 0.28 * local;

        letter.mesh.position.x = letter.baseX + (1 - local) * pointer.x * 0.05;
        letter.mesh.position.y =
          letter.baseY +
          float +
          (1 - local) * -0.55 +
          letter.hover * 0.05 +
          pulse * 0.06;
        letter.mesh.position.z =
          (1 - local) * -0.4 +
          letter.hover * 0.14 +
          pulse * 0.16 * Math.sin(i + time * 4);
        letter.mesh.rotation.z = (1 - local) * -0.35;
        letter.mesh.scale.setScalar(grow * (1 + letter.hover * 0.06) * intro);
      }

      capMaterial.color.lerp(targetInk, 0.06);
      sideMaterial.color.lerp(targetAccent, 0.06);
      sideMaterial.emissive.lerp(targetAccent, 0.06);

      canvas.style.opacity = String(1 - clamp01((exit - 0.25) / 0.7));

      renderer.render(scene, camera);
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

    stage.addEventListener("pointermove", onPointerMove);
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
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, delay: 0.35 },
        );
    }, root);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      context.revert();
      resizeObserver.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      stage.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      themeObserver.disconnect();
      glyphs.forEach((glyph) => glyph.geometry.dispose());
      capMaterial.dispose();
      sideMaterial.dispose();
      environment.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="hero"
      data-field="0"
      className="l07-hero relative flex min-h-[100svh] flex-col overflow-hidden bg-bg"
    >
      <div className="l07-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="shell relative flex flex-1 flex-col justify-center pt-28 pb-6 md:pt-32">
        <p data-hero-fade className="eyebrow text-center">
          {hero.eyebrow}
        </p>

        <div
          ref={stageRef}
          className="relative mx-auto mt-4 aspect-[16/9] w-full max-w-[900px] max-lg:aspect-[4/3]"
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
        <p
          data-hero-fade
          className="lede mx-auto mt-6 max-w-xl text-center"
        >
          {hero.lede}
        </p>
        <div
          data-hero-fade
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
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
