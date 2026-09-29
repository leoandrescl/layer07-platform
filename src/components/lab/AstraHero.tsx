"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
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
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
} from "postprocessing";
import { detectCapability } from "@/lib/webgl/capability";
import { buildStarfield } from "@/components/hero/particles";
import { POINT_FRAG, STARFIELD_VERT } from "@/components/hero/hero-shaders";
import {
  buildFigure,
  FIGURE_COUNT,
  FIGURE_KEYS,
  ASTRA_SEED,
} from "@/lib/lab/astra-shapes";
import { createRand } from "@/lib/lab/morph-shapes";
import { ASTRA_FRAG, ASTRA_VERT } from "./astra-shaders";
import type { LabHeroProps } from "@/lib/lab/heroes";

function clamp(value: number, min = 0, max = 1) {
  return value < min ? min : value > max ? max : value;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

const BASE_Z = 9;
const VIEW_FILL = 0.86;
const FIGURE_DIAMETER = 6.2;
/** Bokeh fraction: the defocused discs that define the Astra starfield. */
const BOKEH_FRACTION = 0.07;

// Per-figure camera choreography: the galaxy tilts like a disc seen in
// space, the dispersed field floats flatter, the star and the 07 face us.
const TILT_TARGETS = [1.02, 0.3, 0.12, 0];
const SPIN_TARGETS = [0.032, 0.012, 0.006, 0];

export function AstraHero({ dict }: LabHeroProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hintRef = useRef<HTMLParagraphElement | null>(null);

  const copy = dict?.lab?.astra;

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
    renderer.setClearColor(0x010208, 1);
    // Screen-blended over a near-black void: dithering would band.
    renderer.getContext().disable(renderer.getContext().DITHER);

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 120);

    // ---- morph targets: one prebuilt figure set per section ----
    const count = cap.tier === 2 ? 13000 : 6500;
    const rand = createRand(ASTRA_SEED + 1);
    const figures = FIGURE_KEYS.map((key) => buildFigure(key, count, ASTRA_SEED));

    const aScatter = new Float32Array(count * 3);
    const aSeed = new Float32Array(count);
    const aSize = new Float32Array(count);
    const aBright = new Float32Array(count);
    const aStagger = new Float32Array(count);
    const aBokeh = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      for (let c = 0; c < 3; c += 1) aScatter[i3 + c] = rand() * 2 - 1;
      aSeed[i] = rand();
      aStagger[i] = rand();

      // a seeded minority becomes large soft bokeh discs; the rest stay
      // small crisp stars spread over a power curve
      const bokeh = rand() < BOKEH_FRACTION ? 1 : 0;
      aBokeh[i] = bokeh;
      if (bokeh === 1) {
        aSize[i] = 0.09 + rand() * 0.17;
        aBright[i] = 0.12 + rand() * 0.3;
      } else {
        aSize[i] = 0.006 + Math.pow(rand(), 3) * 0.03;
        aBright[i] = 0.28 + rand() * 0.72;
      }
    }

    const geometry = new BufferGeometry();
    // aFrom/aTo are working buffers: they must not alias the figure arrays,
    // or copyArray() would corrupt the source figures on every pair swap
    const positionInit = new Float32Array(count * 3);
    positionInit.set(figures[0].positions);
    const aFrom = new Float32Array(count * 3);
    aFrom.set(figures[0].positions);
    const aTo = new Float32Array(count * 3);
    aTo.set(figures[1].positions);
    const aFromColor = new Float32Array(count * 3);
    aFromColor.set(figures[0].colors);
    const aToColor = new Float32Array(count * 3);
    aToColor.set(figures[1].colors);
    geometry.setAttribute("position", new BufferAttribute(positionInit, 3));
    geometry.setAttribute("aFrom", new BufferAttribute(aFrom, 3));
    geometry.setAttribute("aTo", new BufferAttribute(aTo, 3));
    geometry.setAttribute("aFromColor", new BufferAttribute(aFromColor, 3));
    geometry.setAttribute("aToColor", new BufferAttribute(aToColor, 3));
    geometry.setAttribute("aScatter", new BufferAttribute(aScatter, 3));
    geometry.setAttribute("aSeed", new BufferAttribute(aSeed, 1));
    geometry.setAttribute("aSize", new BufferAttribute(aSize, 1));
    geometry.setAttribute("aBright", new BufferAttribute(aBright, 1));
    geometry.setAttribute("aStagger", new BufferAttribute(aStagger, 1));
    geometry.setAttribute("aBokeh", new BufferAttribute(aBokeh, 1));

    const uniforms = {
      uTime: new Uniform(0),
      uIntro: new Uniform(0),
      uMorph: new Uniform(0),
      uScatter: new Uniform(1.05),
      uPointer: new Uniform(new Vector2(0, 0)),
      uPointerActive: new Uniform(0),
      uFovScale: new Uniform(1000),
      uSizeScale: new Uniform(0.95),
    };

    const material = new ShaderMaterial({
      uniforms,
      vertexShader: ASTRA_VERT,
      fragmentShader: ASTRA_FRAG,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });

    const points = new Points(geometry, material);
    points.frustumCulled = false;

    // pivot(tilt) → spin(own axis): the galaxy rotates around its disk
    // normal instead of precessing around the world vertical
    const spinGroup = new Group();
    spinGroup.add(points);
    const tiltGroup = new Group();
    tiltGroup.rotation.x = TILT_TARGETS[0];
    tiltGroup.add(spinGroup);
    const pivot = new Group();
    pivot.add(tiltGroup);
    scene.add(pivot);

    // ---- ambient starfield so the void keeps depth between figures ----
    const starCount = cap.tier === 2 ? 2500 : 1200;
    const starBuffers = buildStarfield(starCount);
    const starGeometry = new BufferGeometry();
    starGeometry.setAttribute("position", new BufferAttribute(starBuffers.position, 3));
    starGeometry.setAttribute("aBase", new BufferAttribute(starBuffers.aBase, 3));
    starGeometry.setAttribute("aSize", new BufferAttribute(starBuffers.aSize, 1));
    starGeometry.setAttribute("aBright", new BufferAttribute(starBuffers.aBright, 1));
    starGeometry.setAttribute("aSeed", new BufferAttribute(starBuffers.aSeed, 1));
    starGeometry.setAttribute("aSpeed", new BufferAttribute(starBuffers.aSpeed, 1));
    starGeometry.setAttribute("aColor", new BufferAttribute(starBuffers.aColor, 3));

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
          intensity: 1.2,
          luminanceThreshold: 0.05,
          luminanceSmoothing: 0.3,
          mipmapBlur: true,
          radius: 0.85,
          levels: cap.tier === 2 ? 7 : 5,
        }),
      ),
    );
    composer.addPass(
      new EffectPass(camera, new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC })),
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

      // pull the camera back until the figure fits the viewport
      const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * BASE_Z;
      const visibleWidth = visibleHeight * camera.aspect;
      const needed = FIGURE_DIAMETER / (visibleWidth * VIEW_FILL);
      camera.position.z = BASE_Z * Math.max(1, needed);

      uniforms.uFovScale.value =
        (h * dpr) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    };
    resize();

    // ---- scroll: whole-number steps swap the buffer pair, the fraction
    // drives the dispersal burst and reform ----
    const attr = (name: string) =>
      // every attribute here was created above as a plain BufferAttribute,
      // never interleaved, so the cast is safe
      geometry.getAttribute(name) as BufferAttribute;

    let currentPair = -1;
    const setPair = (k: number) => {
      if (k === currentPair) return;
      currentPair = k;
      const from = figures[k];
      const to = figures[Math.min(k + 1, FIGURE_COUNT - 1)];
      for (const [name, data] of [
        ["aFrom", from.positions],
        ["aTo", to.positions],
        ["aFromColor", from.colors],
        ["aToColor", to.colors],
      ] as const) {
        const buffer = attr(name);
        buffer.copyArray(data);
        buffer.needsUpdate = true;
      }
    };

    const dots = Array.from(root.querySelectorAll<HTMLElement>(".morph-dot"));
    if (dots[0]) dots[0].classList.add("is-active");
    let activeFigure = 0;
    let hintHidden = false;
    let morphValue = 0;
    let spinVelocity = SPIN_TARGETS[0];

    // ---- cursor field (mouse/pen only: touch belongs to scrolling) ----
    const pointer = { x: 0, y: 0, active: 0, target: 0 };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
      pointer.target = 1;
    };
    const onPointerOut = (event: PointerEvent) => {
      if (event.pointerType !== "touch" && !event.relatedTarget) {
        pointer.target = 0;
      }
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
      uniforms.uIntro.value = smoothstep(0, 0.8, elapsed);
      starUniforms.uReveal.value = smoothstep(0, 0.7, elapsed);

      const travel = Math.max(1, root.offsetHeight - window.innerHeight);
      const p = clamp(window.scrollY / travel) * (FIGURE_COUNT - 1);
      const k = Math.min(FIGURE_COUNT - 2, Math.floor(p));
      setPair(k);

      const f = clamp(p - k);
      morphValue += (f - morphValue) * Math.min(1, dt * 7);
      uniforms.uMorph.value = morphValue;

      const active = clamp(Math.round(p), 0, FIGURE_COUNT - 1);
      if (active !== activeFigure) {
        activeFigure = active;
        for (const [i, dot] of dots.entries()) {
          dot.classList.toggle("is-active", i === active);
        }
      }
      // the camera choreography eases between figures: tilt for the disc,
      // stillness for the mark
      spinVelocity +=
        (SPIN_TARGETS[active] - spinVelocity) * Math.min(1, dt * 1.6);
      spinGroup.rotation.y += spinVelocity * dt;
      tiltGroup.rotation.x +=
        (TILT_TARGETS[active] - tiltGroup.rotation.x) * Math.min(1, dt * 1.6);

      pointer.active += (pointer.target - pointer.active) * Math.min(1, dt * 5);
      uniforms.uPointerActive.value = pointer.active;
      uniforms.uPointer.value.set(pointer.x, pointer.y);

      if (hintRef.current) {
        const hide = p > 0.05;
        if (hide !== hintHidden) {
          hintHidden = hide;
          hintRef.current.style.opacity = hide ? "0" : "";
        }
      }

      composer.render(dt);
    };

    canvas.style.opacity = "1";

    if (cap.software) {
      // one formed static frame: no per-frame rendering at all
      setPair(0);
      uniforms.uIntro.value = 1;
      starUniforms.uReveal.value = 1;
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
    window.addEventListener("pointerout", onPointerOut);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      geometry.dispose();
      starGeometry.dispose();
      material.dispose();
      starMaterial.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, [dict]);

  return (
    <section ref={rootRef} className="astra-root relative">
      <div
        ref={stageRef}
        className="astra-stage sticky top-0 h-[100svh] overflow-hidden"
      >
        <span className="lab-fallback-mark" aria-hidden>
          07
        </span>
        <canvas
          ref={canvasRef}
          aria-hidden
          className="morph-canvas absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000"
        />
      </div>

      <div className="morph-sections">
        {copy?.figures.map((figure, i) => (
          <section
            key={figure.label}
            className={`morph-section${i % 2 === 1 ? " morph-section--right" : ""}`}
          >
            <div className="astra-copy">
              <span className="astra-eyebrow">
                0{i + 1} · {figure.label}
              </span>
              <h2>{figure.title}</h2>
              <p>{figure.body}</p>
            </div>
          </section>
        ))}
      </div>

      <div className="morph-hud pointer-events-none fixed inset-0 z-20" aria-hidden>
        <ol className="morph-rail">
          {copy?.figures.map((figure, i) => (
            <li key={figure.label} className="morph-dot" data-index={i}>
              <span className="morph-dot-label">{figure.label}</span>
            </li>
          ))}
        </ol>
        <p ref={hintRef} className="morph-hint">
          {copy?.hint ?? ""}
        </p>
      </div>
    </section>
  );
}
