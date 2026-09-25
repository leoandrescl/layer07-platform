"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  HalfFloatType,
  Mesh,
  NoToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Uniform,
  Vector2,
  Vector3,
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
import { buildStarfield } from "@/components/hero/particles";
import { POINT_FRAG, STARFIELD_VERT } from "@/components/hero/hero-shaders";
import { buildNebulaDust, buildNodes } from "./nebula-particles";
import {
  DUST_FRAG,
  DUST_VERT,
  NODE_FRAG,
  NODE_VERT,
  lightShaftsFragment,
} from "./nebula-shaders";
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

const GLOW_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GLOW_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uPower;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float d = length(c) * 2.0;
    float f = max(1.0 - d, 0.0);
    gl_FragColor = vec4(uColor * pow(f, uPower) * uIntensity, 1.0);
  }
`;

class LightShaftsEffect extends Effect {
  constructor(samples: number) {
    super("LightShaftsEffect", lightShaftsFragment(samples), {
      blendFunction: BlendFunction.SCREEN,
      uniforms: new Map<string, Uniform>([
        ["uLightA", new Uniform(new Vector2(0.5, 0.52))],
        ["uLightB", new Uniform(new Vector2(0.5, 0.5))],
        ["uIntensity", new Uniform(0.9)],
        ["uDecay", new Uniform(0.94)],
        ["uDensity", new Uniform(0.62)],
        ["uWeight", new Uniform(0.16)],
        ["uExposure", new Uniform(0.55)],
        ["uGate", new Uniform(0.35)],
        ["uVignette", new Uniform(0.5)],
        ["uGrain", new Uniform(0.028)],
        ["uTint", new Uniform(new Color("#9fc4ff"))],
      ]),
    });
  }
}

export function NebulaHero({ dict }: LabHeroProps) {
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

    const maxDpr = cap.tier === 2 ? 1.5 : 1.25;
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = NoToneMapping;
    renderer.setClearColor(0x000000, 1);

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 140);
    camera.position.set(0, 0, BASE_Z);
    scene.add(camera);

    const pivot = new Group();
    scene.add(pivot);

    // ---- dust volume ---------------------------------------------------
    const dustCount = cap.tier === 2 ? 30000 : 12000;
    const dust = buildNebulaDust(dustCount);
    const dustGeometry = new BufferGeometry();
    dustGeometry.setAttribute("position", new BufferAttribute(dust.position, 3));
    dustGeometry.setAttribute("aSeed", new BufferAttribute(dust.aSeed, 1));
    dustGeometry.setAttribute("aSize", new BufferAttribute(dust.aSize, 1));
    dustGeometry.setAttribute("aBright", new BufferAttribute(dust.aBright, 1));
    dustGeometry.setAttribute("aPhase", new BufferAttribute(dust.aPhase, 1));
    dustGeometry.setAttribute("aSpeed", new BufferAttribute(dust.aSpeed, 1));
    dustGeometry.setAttribute("aLateral", new BufferAttribute(dust.aLateral, 1));
    dustGeometry.setAttribute("aZ", new BufferAttribute(dust.aZ, 1));
    dustGeometry.setAttribute("aGlyph", new BufferAttribute(dust.aGlyph, 1));
    dustGeometry.setAttribute("aColor", new BufferAttribute(dust.aColor, 3));

    const coreColor = new Color("#ffd7a8");
    const dustUniforms = {
      uTime: new Uniform(0),
      uIntro: new Uniform(0),
      uMorph: new Uniform(0),
      uDrift: new Uniform(0.55),
      uFovScale: new Uniform(1000),
      uSizeScale: new Uniform(1),
      uMouse: new Uniform(new Vector3(0, 0, 0)),
      uMouseRadius: new Uniform(1.9),
      uMouseStrength: new Uniform(0),
      uCoreColor: new Uniform(coreColor),
      uP0: new Uniform(new Vector2(SEVEN_PATH.p0.x, SEVEN_PATH.p0.y)),
      uC1: new Uniform(new Vector2(SEVEN_PATH.c1.x, SEVEN_PATH.c1.y)),
      uP1: new Uniform(new Vector2(SEVEN_PATH.p1.x, SEVEN_PATH.p1.y)),
      uC2: new Uniform(new Vector2(SEVEN_PATH.c2.x, SEVEN_PATH.c2.y)),
      uP2: new Uniform(new Vector2(SEVEN_PATH.p2.x, SEVEN_PATH.p2.y)),
      uZeroCenter: new Uniform(new Vector2(ZERO.center.x, ZERO.center.y)),
      uZeroR: new Uniform(new Vector2(ZERO.rx, ZERO.ry)),
    };

    const dustMaterial = new ShaderMaterial({
      uniforms: dustUniforms,
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    const dustPoints = new Points(dustGeometry, dustMaterial);
    dustPoints.frustumCulled = false;
    pivot.add(dustPoints);

    // ---- junction nodes -----------------------------------------------
    const nodes = buildNodes();
    const nodeGeometry = new BufferGeometry();
    nodeGeometry.setAttribute("position", new BufferAttribute(nodes.position, 3));
    nodeGeometry.setAttribute("aScatter", new BufferAttribute(nodes.aScatter, 3));
    nodeGeometry.setAttribute("aSeed", new BufferAttribute(nodes.aSeed, 1));
    nodeGeometry.setAttribute("aSize", new BufferAttribute(nodes.aSize, 1));
    nodeGeometry.setAttribute("aBright", new BufferAttribute(nodes.aBright, 1));
    nodeGeometry.setAttribute("aOrder", new BufferAttribute(nodes.aOrder, 1));

    const nodeUniforms = {
      uTime: dustUniforms.uTime,
      uResolve: new Uniform(0),
      uFovScale: dustUniforms.uFovScale,
      uSizeScale: dustUniforms.uSizeScale,
      uMouse: dustUniforms.uMouse,
      uMouseRadius: new Uniform(1.9),
      uMouseStrength: dustUniforms.uMouseStrength,
      uTintA: new Uniform(new Color("#ffe6c2")),
      uTintB: new Uniform(new Color("#bcd8ff")),
    };
    const nodeMaterial = new ShaderMaterial({
      uniforms: nodeUniforms,
      vertexShader: NODE_VERT,
      fragmentShader: NODE_FRAG,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    const nodePoints = new Points(nodeGeometry, nodeMaterial);
    nodePoints.frustumCulled = false;
    pivot.add(nodePoints);

    // ---- background stars ---------------------------------------------
    const starCount = cap.tier === 2 ? 2600 : 1200;
    const stars = buildStarfield(starCount);
    const starGeometry = new BufferGeometry();
    starGeometry.setAttribute("position", new BufferAttribute(stars.position, 3));
    starGeometry.setAttribute("aBase", new BufferAttribute(stars.aBase, 3));
    starGeometry.setAttribute("aSize", new BufferAttribute(stars.aSize, 1));
    starGeometry.setAttribute("aBright", new BufferAttribute(stars.aBright, 1));
    starGeometry.setAttribute("aSeed", new BufferAttribute(stars.aSeed, 1));
    starGeometry.setAttribute("aSpeed", new BufferAttribute(stars.aSpeed, 1));
    starGeometry.setAttribute("aColor", new BufferAttribute(stars.aColor, 3));
    const starUniforms = {
      uTime: dustUniforms.uTime,
      uReveal: new Uniform(0),
      uFovScale: dustUniforms.uFovScale,
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

    // ---- glows: core, halo, pointer light -----------------------------
    const glowMaterial = (color: string, power: number) =>
      new ShaderMaterial({
        uniforms: {
          uColor: new Uniform(new Color(color)),
          uIntensity: new Uniform(0),
          uPower: new Uniform(power),
        },
        vertexShader: GLOW_VERT,
        fragmentShader: GLOW_FRAG,
        transparent: true,
        blending: AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        side: DoubleSide,
      });

    const coreMaterial = glowMaterial("#ffd2a1", 2.6);
    const corePlane = new Mesh(new PlaneGeometry(2.9, 2.9), coreMaterial);
    corePlane.position.set(0, 0.05, 0);
    scene.add(corePlane);

    const haloMaterial = glowMaterial("#5f7dff", 1.7);
    const haloPlane = new Mesh(new PlaneGeometry(11, 8), haloMaterial);
    haloPlane.position.set(0, 0, -4.2);
    scene.add(haloPlane);

    const pointerMaterial = glowMaterial("#dceaff", 3.0);
    const pointerPlane = new Mesh(new PlaneGeometry(1.3, 1.3), pointerMaterial);
    pointerPlane.position.set(0, 0, -4);
    camera.add(pointerPlane);

    // ---- post ----------------------------------------------------------
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
          intensity: 1.15,
          luminanceThreshold: 0.08,
          luminanceSmoothing: 0.28,
          mipmapBlur: true,
          radius: 0.8,
          levels: cap.tier === 2 ? 7 : 5,
        }),
      ),
    );

    const shafts = new LightShaftsEffect(cap.tier === 2 ? 20 : 10);
    const chromatic = new ChromaticAberrationEffect({
      offset: new Vector2(0.001, 0.001),
      radialModulation: true,
      modulationOffset: 0.35,
    });
    const toneMapping = new ToneMappingEffect({
      mode: ToneMappingMode.ACES_FILMIC,
    });
    composer.addPass(new EffectPass(camera, shafts, chromatic, toneMapping));

    // ---- input ---------------------------------------------------------
    const pointer = {
      x: 0.5,
      y: 0.52,
      world: new Vector3(0, 0, 0),
      strength: 0,
      strengthTarget: 0,
      active: false,
    };
    const parallax = { x: 0, y: 0 };

    const resize = () => {
      const w = Math.max(1, stage.clientWidth);
      const h = Math.max(1, stage.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * BASE_Z;
      const visibleWidth = visibleHeight * camera.aspect;
      const needed = MARK_DIAMETER / (visibleWidth * VIEW_FILL);
      camera.position.z = BASE_Z * Math.max(1, needed);

      dustUniforms.uFovScale.value =
        (h * dpr) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    };
    resize();

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = 1 - event.clientY / window.innerHeight;
      pointer.active = true;
      pointer.strengthTarget = 0.75;
      parallax.x = (pointer.x - 0.5) * 2;
      parallax.y = (pointer.y - 0.5) * 2;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      pointer.strengthTarget = 1.4;
    };
    const onPointerUp = () => {
      pointer.strengthTarget = 0.75;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.strengthTarget = 0;
    };

    let alive = true;
    let raf = 0;
    let elapsed = 0;
    let last = performance.now();

    const ndc = new Vector3();
    const coreWorld = new Vector3();
    const tmp = new Vector3();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!alive) return;

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      dustUniforms.uTime.value = elapsed;
      dustUniforms.uIntro.value = reduced ? 1 : smoothstep(0, 1.1, elapsed);
      starUniforms.uReveal.value = smoothstep(0, 0.9, elapsed);

      const scrollable = Math.max(1, root.offsetHeight - window.innerHeight);
      const progress = clamp(window.scrollY / scrollable);
      const morph = reduced ? 1 : smoothstep(0.08, 0.6, progress);
      dustUniforms.uMorph.value = morph;
      nodeUniforms.uResolve.value = reduced
        ? 1
        : smoothstep(0.12, 0.62, progress);

      // pointer strength easing
      pointer.strength += (pointer.strengthTarget - pointer.strength) * Math.min(1, dt * 5);
      dustUniforms.uMouseStrength.value = pointer.active ? pointer.strength * morph : pointer.strength * 0.35 * morph;

      // world-space pointer on the z = 0 plane, translated to pivot local
      ndc.set(pointer.x * 2 - 1, pointer.y * 2 - 1, 0.5).unproject(camera);
      tmp.copy(ndc).sub(camera.position).normalize();
      const distance = -camera.position.z / (tmp.z || -1);
      pointer.world.copy(camera.position).add(tmp.multiplyScalar(distance));
      pivot.worldToLocal(pointer.world);
      dustUniforms.uMouse.value.copy(pointer.world);

      // parallax
      pivot.rotation.y += (parallax.x * 0.11 - pivot.rotation.y) * Math.min(1, dt * 2.2);
      pivot.rotation.x += (-parallax.y * 0.07 - pivot.rotation.x) * Math.min(1, dt * 2.2);

      // core / halo glow
      const pulse = 0.85 + 0.15 * Math.sin(elapsed * 1.4);
      coreMaterial.uniforms.uIntensity.value =
        (0.35 + morph * 0.75) * pulse * (reduced ? 1 : smoothstep(0, 1.4, elapsed));
      haloMaterial.uniforms.uIntensity.value = 0.12 + morph * 0.1;

      // pointer light follows the cursor in camera space
      const vh = Math.tan((camera.fov * Math.PI) / 360) * 4;
      pointerPlane.position.x = (pointer.x * 2 - 1) * vh * camera.aspect;
      pointerPlane.position.y = (pointer.y * 2 - 1) * vh;
      pointerMaterial.uniforms.uIntensity.value = pointer.strength * 0.85;

      // god-ray light sources (screen uv)
      coreWorld.set(0, 0.05, 0).project(camera);
      const uLightA = shafts.uniforms.get("uLightA")!.value as Vector2;
      const uLightB = shafts.uniforms.get("uLightB")!.value as Vector2;
      uLightA.set(coreWorld.x * 0.5 + 0.5, coreWorld.y * 0.5 + 0.5);
      uLightB.set(pointer.x, pointer.y);
      const intensity = shafts.uniforms.get("uIntensity")!;
      intensity.value = 0.75 + morph * 0.5;

      composer.render(dt);
    };

    canvas.style.opacity = "1";

    if (cap.software) {
      dustUniforms.uIntro.value = 1;
      dustUniforms.uMorph.value = 1;
      nodeUniforms.uResolve.value = 1;
      starUniforms.uReveal.value = 1;
      coreMaterial.uniforms.uIntensity.value = 1;
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
      dustGeometry.dispose();
      nodeGeometry.dispose();
      starGeometry.dispose();
      dustMaterial.dispose();
      nodeMaterial.dispose();
      starMaterial.dispose();
      coreMaterial.dispose();
      haloMaterial.dispose();
      pointerMaterial.dispose();
      corePlane.geometry.dispose();
      haloPlane.geometry.dispose();
      pointerPlane.geometry.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, [dict]);

  return (
    <section ref={rootRef} className="lab-hero lab-nebula relative">
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
            <span>nebula · lab</span>
          </div>
        </div>
      </div>
    </section>
  );
}
