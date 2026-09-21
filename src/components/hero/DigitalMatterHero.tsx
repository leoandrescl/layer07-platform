"use client";

import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Quaternion,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
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

const DISPLACEMENT_GLSL = /* glsl */ `
  uniform float uTime;
  uniform float uPulse;
  uniform float uAmp;
  uniform vec3 uPointer;

  float matterHash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float matterNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(
        mix(matterHash(i + vec3(0.0, 0.0, 0.0)), matterHash(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(matterHash(i + vec3(0.0, 1.0, 0.0)), matterHash(i + vec3(1.0, 1.0, 0.0)), f.x),
        f.y
      ),
      mix(
        mix(matterHash(i + vec3(0.0, 0.0, 1.0)), matterHash(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(matterHash(i + vec3(0.0, 1.0, 1.0)), matterHash(i + vec3(1.0, 1.0, 1.0)), f.x),
        f.y
      ),
      f.z
    );
  }

  float matterFbm(vec3 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amp * matterNoise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return value;
  }

  vec3 matterDisplaced(vec3 pos, vec3 nrm) {
    float shape = (matterFbm(pos * 1.6 + vec3(0.0, uTime * 0.12, uTime * 0.06)) - 0.5) * 2.0;
    float bulge = exp(-dot(pos - uPointer, pos - uPointer) * 1.4) * uPulse;
    return pos + nrm * (shape * uAmp + bulge * 0.32);
  }

  vec3 matterNormal(vec3 pos, vec3 nrm) {
    vec3 tangent = normalize(cross(nrm, abs(nrm.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
    vec3 bitangent = normalize(cross(nrm, tangent));
    float e = 0.05;
    vec3 p0 = matterDisplaced(pos, nrm);
    vec3 pa = matterDisplaced(pos + tangent * e, nrm);
    vec3 pb = matterDisplaced(pos + bitangent * e, nrm);
    vec3 nn = normalize(cross(pa - p0, pb - p0));
    return dot(nn, nrm) < 0.0 ? -nn : nn;
  }
`;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function DigitalMatterHero({
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
  const textRef = useRef<HTMLDivElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);

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
    camera.position.set(0, 0, 4.1);

    const pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    pmrem.dispose();

    const keyLight = new DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const rimCool = new DirectionalLight(0x6d7bff, 6.5);
    rimCool.position.set(-4, -1, 2);
    scene.add(rimCool);

    const rimWarm = new DirectionalLight(0xff5c7a, 4.5);
    rimWarm.position.set(4, -2.5, -3);
    scene.add(rimWarm);

    const cursorLight = new PointLight(0xffffff, 6, 8, 2);
    cursorLight.position.set(0, 0, 2.4);
    scene.add(cursorLight);

    const uniforms = {
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uAmp: { value: cap.tier === 2 ? 0.14 : 0.1 },
      uPointer: { value: new Vector3(0, 0, 1) },
    };

    const segments = cap.tier === 2 ? 160 : 72;
    const geometry = new SphereGeometry(1, segments, segments);

    const material = new MeshPhysicalMaterial({
      color: new Color("#0c0c12"),
      metalness: 1,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: cap.tier === 2 ? 1.5 : 1,
      iridescence: cap.tier === 2 ? 1 : 0,
      iridescenceIOR: 1.7,
      iridescenceThicknessRange: [120, 780],
    });

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uPulse = uniforms.uPulse;
      shader.uniforms.uAmp = uniforms.uAmp;
      shader.uniforms.uPointer = uniforms.uPointer;
      shader.vertexShader = `${DISPLACEMENT_GLSL}\n${shader.vertexShader}`;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <beginnormal_vertex>",
        "#include <beginnormal_vertex>\n  objectNormal = matterNormal(position, normal);",
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n  transformed = matterDisplaced(position, normal);",
      );
    };
    material.customProgramCacheKey = () => "layer07-matter-orb";

    const orb = new Mesh(geometry, material);
    scene.add(orb);

    const shell = new Mesh(
      new IcosahedronGeometry(1.34, 1),
      new MeshBasicMaterial({
        color: new Color("#7a88ff"),
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      }),
    );
    scene.add(shell);

    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };
    const pointerDirection = new Vector3();
    const inverseRotation = new Quaternion();
    let pulse = 0;

    const resize = () => {
      const width = Math.max(1, stage.clientWidth);
      const height = Math.max(1, stage.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
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
    };
    const onPointerDown = () => {
      pulse = 1;
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

      pointer.x = lerp(pointer.x, pointerTarget.x, 0.08);
      pointer.y = lerp(pointer.y, pointerTarget.y, 0.08);
      if (pulse > 0) pulse = Math.max(0, pulse - dt / 1.1);

      uniforms.uTime.value = time;
      uniforms.uPulse.value = pulse;

      pointerDirection.set(pointer.x * 0.92, pointer.y * 0.92, 0);
      const z = Math.sqrt(Math.max(0, 1 - pointerDirection.x ** 2 - pointerDirection.y ** 2));
      pointerDirection.z = z;
      inverseRotation.copy(orb.quaternion).invert();
      uniforms.uPointer.value.copy(pointerDirection).applyQuaternion(inverseRotation);

      orb.rotation.y += dt * 0.18;
      orb.rotation.x = lerp(orb.rotation.x, -pointer.y * 0.3, 0.06);
      shell.rotation.y -= dt * 0.06;
      shell.rotation.x = orb.rotation.x * 0.5;

      cursorLight.position.set(pointer.x * 2.4, pointer.y * 2.4, 2.6);
      cursorLight.intensity = 5 + pulse * 14;

      const height = Math.max(1, root.offsetHeight);
      const exit = clamp01((window.scrollY - height * 0.12) / (height * 0.72));
      const scale = 1 - exit * 0.24;
      orb.scale.setScalar(scale);
      shell.scale.setScalar(scale);
      orb.position.y = exit * 0.5;
      shell.position.y = exit * 0.5;
      canvas.style.opacity = String(1 - clamp01((exit - 0.3) / 0.7));
      if (cueRef.current) cueRef.current.style.opacity = String(1 - exit * 1.6);

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
      resizeObserver.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      stage.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      geometry.dispose();
      material.dispose();
      shell.geometry.dispose();
      (shell.material as MeshBasicMaterial).dispose();
      environment.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="hero"
      data-field="0"
      className="matter-hero relative flex min-h-[100svh] flex-col overflow-hidden bg-bg"
    >
      <div className="matter-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="shell relative flex flex-1 items-center pt-28 pb-4 md:pt-32">
        <div className="grid w-full items-center gap-10 lg:grid-cols-12 lg:gap-6">
          <div ref={textRef} className="order-2 lg:order-1 lg:col-span-6">
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1 className="display-xl mt-6 text-ink">
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-hero-line className="block">
                  {hero.title}
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-hero-line className="block italic text-accent">
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

          <div className="order-1 lg:order-2 lg:col-span-6">
            <div
              ref={stageRef}
              className="relative mx-auto aspect-square w-full max-w-[560px] max-lg:max-w-[340px]"
            >
              <div
                ref={fallbackRef}
                aria-hidden
                className="matter-orb-fallback transition-opacity duration-1000"
              />
              <canvas
                ref={canvasRef}
                aria-hidden
                className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="shell relative flex items-end justify-between pb-8">
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
    </section>
  );
}
