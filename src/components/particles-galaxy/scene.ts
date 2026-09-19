import * as THREE from "three";
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
import { BACKGROUND, CONFIG, initialQuality, qualityFor, type QualityLevel } from "./config";
import { buildParticles } from "./formations";
import { POINT_FRAG, POINT_VERT, streakFragment } from "./shaders";

function clamp(v: number, min = 0, max = 1) {
  return v < min ? min : v > max ? max : v;
}

interface StreakOptions {
  samples: number;
  strength: number;
  threshold: number;
  tint: string;
  vignette: number;
  grain: number;
}

class StreakEffect extends Effect {
  constructor({ samples, strength, threshold, tint, vignette, grain }: StreakOptions) {
    const color = new THREE.Color(tint);
    super("StreakEffect", streakFragment(samples), {
      // NORMAL replaces the pass input with our fully-composited color (the
      // shader already folds streak + vignette + grain into `base`).
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, THREE.Uniform>([
        ["uStrength", new THREE.Uniform(strength)],
        ["uThreshold", new THREE.Uniform(threshold)],
        ["uTintR", new THREE.Uniform(color.r)],
        ["uTintG", new THREE.Uniform(color.g)],
        ["uTintB", new THREE.Uniform(color.b)],
        ["uVignette", new THREE.Uniform(vignette)],
        ["uGrain", new THREE.Uniform(grain)],
      ]),
    });
  }
}

export interface ParticlesScene {
  dispose(): void;
}

export interface SceneOptions {
  onReady?: () => void;
}

export function createParticlesScene(
  canvas: HTMLCanvasElement,
  { onReady }: SceneOptions = {},
): ParticlesScene {
  const level: QualityLevel = initialQuality();
  let quality = qualityFor(level);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(BACKGROUND, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CONFIG.fov, 1, 0.1, 120);
  camera.position.set(0, 0, CONFIG.cameraZ);

  // ---- particles ----
  const buffers = buildParticles(quality.count);
  const geometry = new THREE.BufferGeometry();
  // position is required by three but unused: the shader computes it on the GPU
  geometry.setAttribute("position", new THREE.BufferAttribute(buffers.position, 3));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(buffers.phase, 1));
  geometry.setAttribute("aSpeed", new THREE.BufferAttribute(buffers.speed, 1));
  geometry.setAttribute("aArm", new THREE.BufferAttribute(buffers.arm, 1));
  geometry.setAttribute("aSpread", new THREE.BufferAttribute(buffers.spread, 1));
  geometry.setAttribute("aHeight", new THREE.BufferAttribute(buffers.height, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(buffers.seed, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(buffers.size, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(buffers.color, 3));
  geometry.setAttribute("aBright", new THREE.BufferAttribute(buffers.bright, 1));

  const coreColor = new THREE.Color(CONFIG.effects.coreColor);
  const uniforms = {
    uTime: new THREE.Uniform(0),
    uIntro: new THREE.Uniform(0),
    uArms: new THREE.Uniform(CONFIG.galaxy.arms),
    uCoreRadius: new THREE.Uniform(CONFIG.galaxy.coreRadius),
    uOuterRadius: new THREE.Uniform(CONFIG.galaxy.outerRadius),
    uTwist: new THREE.Uniform(CONFIG.galaxy.twist),
    uRadialCurve: new THREE.Uniform(CONFIG.galaxy.radialCurve),
    uThickness: new THREE.Uniform(CONFIG.galaxy.thickness),
    uSpin: new THREE.Uniform<number>(CONFIG.galaxy.spin),
    uFlowSpeed: new THREE.Uniform(CONFIG.galaxy.flowSpeed),
    uFovScale: new THREE.Uniform(1000),
    uSizeScale: new THREE.Uniform(1),
    uCoreColor: new THREE.Uniform(coreColor),
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: POINT_VERT,
    fragmentShader: POINT_FRAG,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  // pivot = yaw (drag), tiltGroup = disc inclination, so the spin inside the
  // shader stays aligned with the galaxy plane
  const tiltGroup = new THREE.Group();
  tiltGroup.rotation.x = CONFIG.tilt;
  tiltGroup.add(points);
  const pivot = new THREE.Group();
  pivot.add(tiltGroup);
  scene.add(pivot);

  // ---- post processing ----
  const composer = new EffectComposer(renderer, {
    depthBuffer: false,
    frameBufferType: THREE.HalfFloatType,
    multisampling: 0,
  });
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(
    new EffectPass(
      camera,
      new BloomEffect({
        intensity: CONFIG.effects.bloomIntensity,
        luminanceThreshold: CONFIG.effects.bloomThreshold,
        luminanceSmoothing: CONFIG.effects.bloomSmoothing,
        mipmapBlur: true,
        radius: CONFIG.effects.bloomRadius,
        levels: quality.bloomLevels,
      }),
    ),
  );

  const streak = new StreakEffect({
    samples: quality.streakSamples,
    strength: CONFIG.effects.streakStrength,
    threshold: CONFIG.effects.streakThreshold,
    tint: CONFIG.effects.streakTint,
    vignette: CONFIG.effects.vignette,
    grain: CONFIG.effects.grain,
  });
  const chromatic = new ChromaticAberrationEffect({
    offset: new THREE.Vector2(CONFIG.effects.chromatic, CONFIG.effects.chromatic),
    radialModulation: true,
    modulationOffset: 0.35,
  });
  const toneMapping = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
  composer.addPass(new EffectPass(camera, streak, chromatic, toneMapping));

  // ---- responsive sizing ----
  const view = { dpr: quality.pixelRatio };

  const applySize = () => {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, quality.pixelRatio);
    view.dpr = dpr;

    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setSize(w, h);

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    uniforms.uFovScale.value = (h * dpr) / (2 * Math.tan((CONFIG.fov * Math.PI) / 360));
  };

  applySize();

  // ---- interaction: drag to rotate ----
  const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = reducedMq.matches;
  const onReduced = () => {
    reduced = reducedMq.matches;
  };
  reducedMq.addEventListener("change", onReduced);

  const rot = { yaw: 0, yawTarget: 0, tiltOffset: 0, tiltTarget: 0 };
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  const canStartDrag = (target: EventTarget | null) =>
    target instanceof Element ? !target.closest("a, button, input, textarea, select") : true;

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (e.button !== 0) return;
    if (!canStartDrag(e.target)) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.style.cursor = "grabbing";
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = (e.clientX - lastX) / window.innerWidth;
    const dy = (e.clientY - lastY) / window.innerHeight;
    rot.yawTarget += dx * Math.PI * CONFIG.motion.dragSensitivity;
    rot.tiltTarget = clamp(
      rot.tiltTarget + dy * Math.PI * CONFIG.motion.dragSensitivity,
      -CONFIG.motion.maxTiltOffset,
      CONFIG.motion.maxTiltOffset,
    );
    lastX = e.clientX;
    lastY = e.clientY;
  };

  const onPointerUp = () => {
    dragging = false;
    canvas.style.cursor = "";
  };

  window.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  // ---- adaptive performance ----
  let fpsAccum = 0;
  let fpsFrames = 0;
  let lowStreak = 0;

  // ---- loop ----
  const clock = new THREE.Clock();
  let elapsed = 0;
  let raf = 0;
  let alive = true;
  let ready = false;

  const tick = () => {
    const dt = Math.min(0.05, clock.getDelta());
    elapsed += dt;

    const introRaw = reduced ? 1 : clamp(elapsed / CONFIG.motion.introDuration);
    const intro = introRaw * introRaw * (3 - 2 * introRaw);

    uniforms.uTime.value = elapsed;
    uniforms.uIntro.value = intro;
    uniforms.uSpin.value = reduced ? 0 : CONFIG.galaxy.spin;

    const damp = Math.min(1, (dragging ? CONFIG.motion.dragDamping : CONFIG.motion.damping) + dt * 3);
    rot.yaw += (rot.yawTarget - rot.yaw) * damp;
    rot.tiltOffset += (rot.tiltTarget - rot.tiltOffset) * damp;
    pivot.rotation.y = rot.yaw;
    tiltGroup.rotation.x = CONFIG.tilt + rot.tiltOffset;

    composer.render(dt);

    if (!ready) {
      ready = true;
      onReady?.();
    }

    fpsAccum += dt;
    fpsFrames += 1;
    if (fpsAccum >= 1.2) {
      const fps = fpsFrames / fpsAccum;
      fpsAccum = 0;
      fpsFrames = 0;
      if (fps < 45 && view.dpr > 1) {
        lowStreak += 1;
        if (lowStreak >= 2) {
          quality = { ...quality, pixelRatio: Math.max(1, quality.pixelRatio * 0.8) };
          applySize();
          lowStreak = 0;
        }
      } else {
        lowStreak = 0;
      }
    }

    if (alive) raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);

  const onResize = () => applySize();
  window.addEventListener("resize", onResize);

  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else if (alive) {
      clock.getDelta();
      raf = requestAnimationFrame(tick);
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    dispose() {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMq.removeEventListener("change", onReduced);
      geometry.dispose();
      material.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
