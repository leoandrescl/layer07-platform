"use client";

import { useEffect, useRef } from "react";
import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";
import { detectCapability } from "@/lib/webgl/capability";
import { MATERIAL_FRAG, MATERIAL_VERT } from "./material-shader";

function readVar(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(target: Color, to: Color, t: number) {
  target.r = lerp(target.r, to.r, t);
  target.g = lerp(target.g, to.g, t);
  target.b = lerp(target.b, to.b, t);
}

export function MaterialField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cap = detectCapability();
    if (cap.tier === 0) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    canvas.style.opacity = "1";
    if (fallbackRef.current) fallbackRef.current.style.opacity = "0";

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new PlaneGeometry(2, 2);

    const themeIsDark = () =>
      document.documentElement.dataset.theme === "dark";

    const targetBase = new Color(readVar("--bg", "#f3f0ea"));
    const targetInk = new Color(readVar("--ink", "#0d0d0f"));
    const targetAccent = new Color(readVar("--accent", "#1b2cff"));

    const uniforms = {
      uResolution: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uMouseStrength: { value: 0 },
      uScroll: { value: 0 },
      uVelocity: { value: 0 },
      uMood: { value: 0 },
      uTheme: { value: themeIsDark() ? 1 : 0 },
      uQuality: { value: cap.quality },
      uIntensity: { value: 0 },
      uColBase: { value: targetBase.clone() },
      uColInk: { value: targetInk.clone() },
      uColAccent: { value: targetAccent.clone() },
    };

    const material = new ShaderMaterial({
      vertexShader: MATERIAL_VERT,
      fragmentShader: MATERIAL_FRAG,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const ratio = Math.max(0.4, cap.dpr * cap.resolutionScale);

    const resize = () => {
      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width * ratio, height * ratio);
    };

    resize();

    const pointer = { x: 0.5, y: 0.5 };
    let strengthTarget = 0;
    let lastPointerTime = 0;

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = event.clientY / window.innerHeight;
      strengthTarget = 0.55;
      lastPointerTime = performance.now();
    };
    const onPointerDown = () => {
      strengthTarget = 1;
    };

    let moodTarget = 0;
    const moodEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-field]"),
    );
    const moodObserver = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        }
        if (best) {
          const value = Number.parseFloat(
            (best.target as HTMLElement).dataset.field ?? "0",
          );
          if (!Number.isNaN(value)) moodTarget = value;
        }
      },
      { threshold: [0.15, 0.35, 0.55, 0.75, 1] },
    );
    moodEls.forEach((el) => moodObserver.observe(el));

    const themeObserver = new MutationObserver(() => {
      const dark = themeIsDark();
      uniforms.uTheme.value = dark ? 1 : 0;
      targetBase.set(readVar("--bg", dark ? "#0a0a0c" : "#f3f0ea"));
      targetInk.set(readVar("--ink", dark ? "#f2efe9" : "#0d0d0f"));
      targetAccent.set(readVar("--accent", dark ? "#7a88ff" : "#1b2cff"));
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    let alive = true;
    let raf = 0;
    let last = performance.now();
    let lastFrame = 0;
    let lastScroll = window.scrollY;
    let velocity = 0;
    const frameInterval = 1000 / cap.maxFps;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!alive) return;
      if (now - lastFrame < frameInterval - 1) return;

      const elapsed = now - last;
      last = now;
      lastFrame = now;

      const dt = Math.min(0.05, elapsed / 1000);
      uniforms.uTime.value += dt;

      const scrollable = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      uniforms.uScroll.value = Math.min(
        1,
        Math.max(0, window.scrollY / scrollable),
      );

      const delta = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      velocity = lerp(velocity, Math.min(1, delta / 60), 0.12);
      uniforms.uVelocity.value = velocity;

      uniforms.uMouse.value.x = lerp(uniforms.uMouse.value.x, pointer.x, 0.06);
      uniforms.uMouse.value.y = lerp(uniforms.uMouse.value.y, pointer.y, 0.06);

      if (performance.now() - lastPointerTime > 1400) strengthTarget = 0;
      uniforms.uMouseStrength.value = lerp(
        uniforms.uMouseStrength.value,
        strengthTarget,
        0.05,
      );

      uniforms.uMood.value = lerp(uniforms.uMood.value, moodTarget, 0.03);

      const intensityTarget = themeIsDark() ? 0.92 : 0.5;
      uniforms.uIntensity.value = lerp(
        uniforms.uIntensity.value,
        intensityTarget,
        0.02,
      );

      lerpColor(uniforms.uColBase.value, targetBase, 0.05);
      lerpColor(uniforms.uColInk.value, targetInk, 0.05);
      lerpColor(uniforms.uColAccent.value, targetAccent, 0.05);

      renderer.render(scene, camera);
    };

    raf = requestAnimationFrame(tick);

    const onVisibility = () => {
      if (document.hidden) {
        alive = false;
        cancelAnimationFrame(raf);
      } else if (!alive) {
        alive = true;
        last = performance.now();
        lastFrame = 0;
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

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      moodObserver.disconnect();
      themeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-bg"
    >
      <div
        ref={fallbackRef}
        className="material-fallback absolute inset-0 transition-opacity duration-700"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700"
      />
      <div className="grain absolute inset-0 opacity-[0.05] mix-blend-multiply dark:opacity-[0.07] dark:mix-blend-screen" />
    </div>
  );
}
