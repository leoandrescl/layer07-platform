"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineSegments,
  NoToneMapping,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Uniform,
  Vector3,
  WebGLRenderer,
} from "three";
import { detectCapability } from "@/lib/webgl/capability";
import { buildStarfield } from "@/components/hero/particles";
import { POINT_FRAG, STARFIELD_VERT } from "@/components/hero/hero-shaders";
import { buildConstellation } from "./constellation";
import { NODE_FRAG } from "./nebula-shaders";
import {
  CONST_LINE_FRAG,
  CONST_LINE_VERT,
  CONST_STAR_VERT,
} from "./constellation-shaders";
import type { LabHeroProps } from "@/lib/lab/heroes";

function clamp(value: number, min = 0, max = 1) {
  return value < min ? min : value > max ? max : value;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

const BASE_Z = 9;
const MARK_DIAMETER = 7.6;
const VIEW_FILL = 0.88;

export function ConstellationHero({ dict }: LabHeroProps) {
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

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 140);
    camera.position.set(0, 0, BASE_Z);

    // ---- background stars ---------------------------------------------
    const stars = buildStarfield(cap.tier === 2 ? 3000 : 1400);
    const starGeometry = new BufferGeometry();
    starGeometry.setAttribute("position", new BufferAttribute(stars.position, 3));
    starGeometry.setAttribute("aBase", new BufferAttribute(stars.aBase, 3));
    starGeometry.setAttribute("aSize", new BufferAttribute(stars.aSize, 1));
    starGeometry.setAttribute("aBright", new BufferAttribute(stars.aBright, 1));
    starGeometry.setAttribute("aSeed", new BufferAttribute(stars.aSeed, 1));
    starGeometry.setAttribute("aSpeed", new BufferAttribute(stars.aSpeed, 1));
    starGeometry.setAttribute("aColor", new BufferAttribute(stars.aColor, 3));

    const starUniforms = {
      uTime: new Uniform(0),
      uReveal: new Uniform(0),
      uFovScale: new Uniform(1000),
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

    // ---- constellation -------------------------------------------------
    const constellation = buildConstellation();
    const nodeGeometry = new BufferGeometry();
    nodeGeometry.setAttribute(
      "position",
      new BufferAttribute(constellation.nodePosition, 3),
    );
    nodeGeometry.setAttribute(
      "aScatter",
      new BufferAttribute(constellation.nodeScatter, 3),
    );
    nodeGeometry.setAttribute(
      "aSeed",
      new BufferAttribute(constellation.nodeSeed, 1),
    );
    nodeGeometry.setAttribute(
      "aSize",
      new BufferAttribute(constellation.nodeSize, 1),
    );
    nodeGeometry.setAttribute(
      "aBright",
      new BufferAttribute(constellation.nodeBright, 1),
    );

    const mouse = {
      world: new Vector3(0, 0, 0),
      x: 0,
      active: false,
      strength: 0,
      strengthTarget: 0,
    };

    const nodeUniforms = {
      uTime: starUniforms.uTime,
      uResolve: new Uniform(0),
      uFovScale: starUniforms.uFovScale,
      uSizeScale: new Uniform(1),
      uMouse: new Uniform(mouse.world),
      uMouseRadius: new Uniform(2.4),
      uMouseStrength: new Uniform(0),
      uTintA: new Uniform(new Color("#ffe6c2")),
      uTintB: new Uniform(new Color("#bcd8ff")),
    };
    const nodeMaterial = new ShaderMaterial({
      uniforms: nodeUniforms,
      vertexShader: CONST_STAR_VERT,
      fragmentShader: NODE_FRAG,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    const nodePoints = new Points(nodeGeometry, nodeMaterial);
    nodePoints.frustumCulled = false;
    scene.add(nodePoints);

    const lineGeometry = new BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new BufferAttribute(constellation.segFrom, 3),
    );
    lineGeometry.setAttribute(
      "aFrom",
      new BufferAttribute(constellation.segFrom, 3),
    );
    lineGeometry.setAttribute(
      "aTo",
      new BufferAttribute(constellation.segTo, 3),
    );
    lineGeometry.setAttribute(
      "aOrder",
      new BufferAttribute(constellation.segOrder, 1),
    );
    lineGeometry.setAttribute(
      "aSeed",
      new BufferAttribute(constellation.segSeed, 1),
    );

    const lineUniforms = {
      uTime: starUniforms.uTime,
      uDraw: new Uniform(0),
      uMouse: new Uniform(mouse.world),
      uMouseRadius: new Uniform(2.4),
      uMouseStrength: new Uniform(0),
      uTint: new Uniform(new Color("#9fc4ff")),
    };
    const lineMaterial = new ShaderMaterial({
      uniforms: lineUniforms,
      vertexShader: CONST_LINE_VERT,
      fragmentShader: CONST_LINE_FRAG,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    const lines = new LineSegments(lineGeometry, lineMaterial);
    lines.frustumCulled = false;
    scene.add(lines);

    const resize = () => {
      const w = Math.max(1, stage.clientWidth);
      const h = Math.max(1, stage.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * BASE_Z;
      const visibleWidth = visibleHeight * camera.aspect;
      const needed = MARK_DIAMETER / (visibleWidth * VIEW_FILL);
      camera.position.z = BASE_Z * Math.max(1, needed);

      starUniforms.uFovScale.value =
        (h * dpr) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    };
    resize();

    const ndc = new Vector3();
    const tmp = new Vector3();

    const onPointerMove = (event: PointerEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.active = true;
      mouse.strengthTarget = 0.85;

      ndc.set(mouse.x, (1 - event.clientY / window.innerHeight) * 2 - 1, 0.5)
        .unproject(camera);
      tmp.copy(ndc).sub(camera.position).normalize();
      const distance = -camera.position.z / (tmp.z || -1);
      mouse.world.copy(camera.position).add(tmp.multiplyScalar(distance));
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.button === 0) mouse.strengthTarget = 1.5;
    };
    const onPointerUp = () => {
      mouse.strengthTarget = 0.85;
    };
    const onPointerLeave = () => {
      mouse.active = false;
      mouse.strengthTarget = 0;
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

      starUniforms.uTime.value = elapsed;
      starUniforms.uReveal.value = smoothstep(0, 0.9, elapsed);

      const scrollable = Math.max(1, root.offsetHeight - window.innerHeight);
      const progress = clamp(window.scrollY / scrollable);
      nodeUniforms.uResolve.value = reduced
        ? 1
        : smoothstep(0.08, 0.5, progress);
      lineUniforms.uDraw.value = reduced
        ? 1
        : smoothstep(0.22, 0.72, progress);

      mouse.strength +=
        (mouse.strengthTarget - mouse.strength) * Math.min(1, dt * 5);
      nodeUniforms.uMouseStrength.value = mouse.active
        ? mouse.strength
        : mouse.strength * 0.4;
      lineUniforms.uMouseStrength.value = mouse.active
        ? mouse.strength
        : mouse.strength * 0.4;

      // gentle parallax
      camera.position.x += (mouse.x * 0.35 - camera.position.x) * Math.min(1, dt * 1.6);
      camera.position.y += (0 - camera.position.y) * Math.min(1, dt * 1.6);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    canvas.style.opacity = "1";

    if (cap.software) {
      starUniforms.uReveal.value = 1;
      nodeUniforms.uResolve.value = 1;
      lineUniforms.uDraw.value = 1;
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
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointerleave", onPointerLeave);
      starGeometry.dispose();
      nodeGeometry.dispose();
      lineGeometry.dispose();
      starMaterial.dispose();
      nodeMaterial.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, [dict]);

  return (
    <section
      ref={rootRef}
      data-field="0"
      className="lab-hero lab-constellation relative"
    >
      <div
        ref={stageRef}
        className="lab-stage sticky top-0 h-[100svh] overflow-hidden"
      >
        <div className="lab-cosmos" aria-hidden>
          <span className="lab-cosmos-wash w1" />
          <span className="lab-cosmos-wash w2" />
        </div>
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000"
        />

        <span className="lab-fallback-mark" aria-hidden>
          07
        </span>

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
            <span>constellation · lab</span>
          </div>
        </div>
      </div>
    </section>
  );
}
