"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
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
import { detectCapability } from "@/lib/webgl/capability";
import { SEVEN_PATH, ZERO } from "@/components/hero/glyphs";
import { GALAXY, buildGalaxySeven, buildStarfield } from "@/components/hero/particles";
import {
  POINT_FRAG,
  STARFIELD_VERT,
  streakFragment,
} from "@/components/hero/hero-shaders";
import { COIL_EXPERIENCE_VERT } from "./experience-shaders";
import { defaultLocale } from "@/lib/i18n/config";
import type { LabHeroProps } from "@/lib/lab/heroes";

type ExperienceMode = "idle" | "enter" | "explore" | "landing" | "build";

type HeroUniforms = {
  uEnter: Uniform<number>;
  uOrbit: Uniform<number>;
  uPointer: Uniform<Vector2>;
  uPointerActive: Uniform<number>;
  uNodePos: Uniform<Vector2>;
  uFocus: Uniform<number>;
  uCompress: Uniform<number>;
  uShock: Uniform<number>;
};

function clamp(value: number, min = 0, max = 1) {
  return value < min ? min : value > max ? max : value;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

const BASE_Z = 9;
const GALAXY_DIAMETER = GALAXY.outerRadius * 2;
const VIEW_FILL = 0.92;

// Same base timeline as the coil auto hero. BUILD shortens the formation so
// the construction sequence feels immediate after the click.
const MORPH_DURATION = 3.6;
const BUILD_MORPH_DURATION = 1.4;

const ZERO_SHIFT = 0.3;
const SEVEN_SHIFT = -0.3;
const SLOW_SPIN = -0.005;
const SLOW_FLOW = 0.016;
const SLOW_COIL_SPIN = 0.1;

// Ring layout for the EXPLORE capability labels (percent of the stage),
// tightened so labels never clip at 360px.
const EXPLORE_POS = [
  { x: "22%", y: "24%" },
  { x: "68%", y: "16%" },
  { x: "78%", y: "48%" },
  { x: "62%", y: "72%" },
  { x: "30%", y: "70%" },
  { x: "16%", y: "46%" },
];

// Aligned by index with dict.home.hero.capabilities. The last capability
// (Experiencias WebGL) has no project category, so it opens the full grid.
const EXPLORE_FILTERS: (string | null)[] = [
  "websites",
  "ecommerce",
  "apps",
  "systems",
  "integrations",
  null,
];

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

export function ExperienceHero({ dict, locale }: LabHeroProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chromeRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const exploreRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const landingPanelRef = useRef<HTMLDivElement | null>(null);
  const buildPanelRef = useRef<HTMLDivElement | null>(null);
  const buildFrameRef = useRef<SVGRectElement | null>(null);
  const buildTextRef = useRef<HTMLParagraphElement | null>(null);
  const buildCtaRef = useRef<HTMLAnchorElement | null>(null);

  const uniformsRef = useRef<HeroUniforms | null>(null);
  const cameraExtraRef = useRef({ x: 0, y: 0, z: 0 });
  const hoverRef = useRef<"enter" | "explore" | "build" | null>(null);
  const modeRef = useRef<ExperienceMode>("idle");
  const tweensRef = useRef<gsap.core.Animation[]>([]);
  const timeScaleRef = useRef({ value: 1 });
  const holdRef = useRef(0);
  const holdActiveRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });

  const [mode, setMode] = useState<ExperienceMode>("idle");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const copy = dict?.home.hero;
  const activeLocale = locale ?? defaultLocale;
  const capabilities = copy?.capabilities ?? [];
  const capabilityItems = dict?.home.capabilities.items ?? [];

  const track = (animation: gsap.core.Animation) => {
    tweensRef.current.push(animation);
    return animation;
  };

  const fadeChrome = (out: boolean, delay = 0) => {
    if (chromeRef.current) {
      track(
        gsap.to(chromeRef.current, {
          opacity: out ? 0 : 1,
          y: out ? -18 : 0,
          duration: 0.45,
          delay,
          ease: "power2.out",
        }),
      );
    }
    if (actionsRef.current) {
      track(
        gsap.to(actionsRef.current, {
          opacity: out ? 0 : 1,
          y: out ? 14 : 0,
          duration: 0.4,
          delay,
          ease: "power2.out",
        }),
      );
    }
  };

  const handleEnter = () => {
    if (modeRef.current !== "idle") return;
    const uniforms = uniformsRef.current;
    // No WebGL / reduced motion: react instantly instead of cinematically.
    if (!uniforms) {
      router.push(`/${activeLocale}/work`);
      return;
    }
    modeRef.current = "enter";
    setMode("enter");
    // Two acts instead of one hard push: a gentle dive-in, then the
    // acceleration — and the hero fades into the site cosmos before the
    // navigation, so the page change lands on a quiet frame instead of
    // cutting from mid-flight.
    const tl = gsap.timeline({
      onComplete: () => router.push(`/${activeLocale}/work`),
    });
    track(tl);
    tl.to(uniforms.uEnter, { value: 0.5, duration: 0.85, ease: "power2.out" }, 0)
      .to(
        cameraExtraRef.current,
        { z: -1.4, duration: 0.85, ease: "power2.out" },
        0,
      )
      .to(
        chromeRef.current,
        { opacity: 0, y: -24, duration: 0.55, ease: "power2.in" },
        0,
      )
      .to(actionsRef.current, { opacity: 0, y: 18, duration: 0.4 }, 0)
      .to(uniforms.uEnter, { value: 1, duration: 0.75, ease: "power3.in" }, 0.8)
      .to(
        cameraExtraRef.current,
        { z: -2.6, duration: 0.75, ease: "power3.in" },
        0.8,
      )
      .to(
        stageRef.current,
        { opacity: 0, duration: 0.5, ease: "power1.in" },
        1.05,
      );
  };

  const handleExplore = () => {
    if (modeRef.current !== "idle") return;
    modeRef.current = "explore";
    setMode("explore");
    const uniforms = uniformsRef.current;
    if (!uniforms) return;
    track(
      gsap.to(uniforms.uOrbit, { value: 1, duration: 1.2, ease: "power2.out" }),
    );
    fadeChrome(true);
  };

  const exitExplore = () => {
    if (modeRef.current !== "explore") return;
    modeRef.current = "idle";
    setMode("idle");
    const uniforms = uniformsRef.current;
    if (!uniforms) return;
    track(
      gsap.to(uniforms.uOrbit, {
        value: 0,
        duration: 0.9,
        ease: "power2.inOut",
      }),
    );
    fadeChrome(false, 0.15);
  };

  // A hovered node pulls nearby matter in before the click.
  const focusNode = (index: number, element: HTMLElement) => {
    const uniforms = uniformsRef.current;
    if (!uniforms) return;
    const rect = element.getBoundingClientRect();
    const nx = ((rect.left + rect.width / 2) / window.innerWidth) * 2 - 1;
    const ny = -(((rect.top + rect.height / 2) / window.innerHeight) * 2 - 1);
    uniforms.uNodePos.value.set(nx, ny);
    track(
      gsap.to(uniforms.uFocus, {
        value: 1,
        duration: 0.45,
        overwrite: "auto",
        ease: "power2.out",
      }),
    );
    if (cursorRef.current) {
      track(
        gsap.to(cursorRef.current, { scale: 1.7, duration: 0.3, overwrite: "auto" }),
      );
    }
  };

  const blurNode = () => {
    const uniforms = uniformsRef.current;
    if (!uniforms) return;
    track(
      gsap.to(uniforms.uFocus, {
        value: 0,
        duration: 0.5,
        overwrite: "auto",
        ease: "power2.out",
      }),
    );
    if (cursorRef.current) {
      track(
        gsap.to(cursorRef.current, { scale: 1, duration: 0.3, overwrite: "auto" }),
      );
    }
  };

  // The cinematic moment: slow the system down, travel toward the node, and
  // land on its panel instead of cutting straight to another page.
  const selectNode = (index: number) => {
    if (modeRef.current !== "explore") return;
    const uniforms = uniformsRef.current;
    modeRef.current = "landing";
    setActiveIndex(index);
    setMode("landing");
    if (!uniforms) return;
    const nodePos = uniforms.uNodePos.value;
    track(
      gsap.to(timeScaleRef.current, {
        value: 0.3,
        duration: 0.5,
        ease: "power2.out",
      }),
    );
    track(
      gsap.to(cameraExtraRef.current, {
        x: nodePos.x * 3.0,
        y: nodePos.y * 2.0,
        z: -1.8,
        duration: 1.2,
        ease: "power2.inOut",
      }),
    );
    const labels = exploreRef.current?.querySelectorAll("[data-explore-label]");
    if (labels?.length) {
      track(
        gsap.to(labels, {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          stagger: 0.03,
          ease: "power2.in",
        }),
      );
    }
  };

  const exitLanding = () => {
    if (modeRef.current !== "landing") return;
    modeRef.current = "explore";
    setActiveIndex(null);
    setMode("explore");
    const uniforms = uniformsRef.current;
    if (!uniforms) return;
    blurNode();
    track(
      gsap.to(timeScaleRef.current, {
        value: 1,
        duration: 0.8,
        ease: "power2.inOut",
      }),
    );
    const labels = exploreRef.current?.querySelectorAll("[data-explore-label]");
    if (labels?.length) {
      track(
        gsap.to(labels, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.04,
          ease: "power2.out",
        }),
      );
    }
  };

  const handleBuild = () => {
    if (modeRef.current !== "idle") return;
    modeRef.current = "build";
    setMode("build");
    const uniforms = uniformsRef.current;
    if (!uniforms) return;
    fadeChrome(true);
  };

  const exitBuild = () => {
    if (modeRef.current !== "build") return;
    modeRef.current = "idle";
    setMode("idle");
    fadeChrome(false, 0.1);
  };

  // BUILD: the panel appears, the wireframe draws around it, then the copy
  // and the CTA assemble.
  useEffect(() => {
    if (mode !== "build") return;
    const frame = buildFrameRef.current;
    if (!frame) return;
    const len = frame.getTotalLength();
    const tl = gsap.timeline();
    track(tl);
    tl.fromTo(
      buildPanelRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power1.out" },
    )
      .set(frame, { strokeDasharray: len, strokeDashoffset: len })
      .to(frame, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" })
      .fromTo(
        buildTextRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.25",
      )
      .fromTo(
        buildCtaRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
        "-=0.2",
      );
  }, [mode]);

  // EXPLORE: stagger the labels in; the cursor bends the field and drags
  // the label ring while the camera leans into depth parallax.
  useEffect(() => {
    if (mode !== "explore") return;
    const labels = exploreRef.current?.querySelectorAll("[data-explore-label]");
    if (labels?.length) {
      const tl = gsap.timeline();
      track(tl);
      tl.fromTo(
        labels,
        { opacity: 0, scale: 0.85, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.07,
          delay: 0.25,
          ease: "power2.out",
        },
      );
    }
    const cursor = cursorRef.current;
    if (cursor) gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 1 });
    const field = document.getElementById("explore-field");
    if (!field) return;
    const qx = gsap.quickTo(field, "x", { duration: 0.7, ease: "power3" });
    const qy = gsap.quickTo(field, "y", { duration: 0.7, ease: "power3" });
    const qcx = cursor
      ? gsap.quickTo(cursor, "x", { duration: 0.16, ease: "power2" })
      : null;
    const qcy = cursor
      ? gsap.quickTo(cursor, "y", { duration: 0.16, ease: "power2" })
      : null;
    const onMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = -((event.clientY / window.innerHeight) * 2 - 1);
      pointerRef.current.x = nx;
      pointerRef.current.y = ny;
      const uniforms = uniformsRef.current;
      if (uniforms) uniforms.uPointer.value.set(nx, ny);
      qcx?.(event.clientX);
      qcy?.(event.clientY);
      qx((nx / 2) * 30);
      qy((-ny / 2) * 20);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mode]);

  // LANDING: the node panel materializes once the camera has traveled.
  useEffect(() => {
    if (mode !== "landing") return;
    const panel = landingPanelRef.current;
    if (!panel) return;
    const tl = gsap.timeline({ delay: 0.9 });
    track(tl);
    tl.fromTo(
      panel,
      { opacity: 0, scale: 0.92, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power2.out" },
    );
  }, [mode]);

  // Kill any running sequence tweens on unmount (a pending ENTER navigation
  // dies with its timeline instead of firing after the hero is gone).
  useEffect(
    () => () => {
      for (const tween of tweensRef.current) tween.kill();
      tweensRef.current = [];
    },
    [],
  );

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
    renderer.setClearColor(0x000000, 1);
    renderer.getContext().disable(renderer.getContext().DITHER);

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 120);
    camera.position.set(0, 0, 9);

    const count = cap.tier === 2 ? 14000 : 7000;
    const buffers = buildGalaxySeven(count);

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(buffers.position, 3));
    geometry.setAttribute("aScatter", new BufferAttribute(buffers.aScatter, 3));
    geometry.setAttribute("aZ", new BufferAttribute(buffers.aZ, 1));
    geometry.setAttribute("aGlyph", new BufferAttribute(buffers.aGlyph, 1));
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
      uForm: new Uniform(0),
      uMorph: new Uniform(0),
      uEnter: new Uniform(0),
      uOrbit: new Uniform(0),
      uPointer: new Uniform(new Vector2(0, 0)),
      uPointerActive: new Uniform(0),
      uNodePos: new Uniform(new Vector2(0, 0)),
      uFocus: new Uniform(0),
      uCompress: new Uniform(0),
      uShock: new Uniform(0),
      uArms: new Uniform(GALAXY.arms),
      uCoreRadius: new Uniform(GALAXY.coreRadius),
      uOuterRadius: new Uniform(GALAXY.outerRadius),
      uTwist: new Uniform(GALAXY.twist),
      uRadialCurve: new Uniform(GALAXY.radialCurve),
      uThickness: new Uniform(GALAXY.thickness),
      uSpin: new Uniform<number>(SLOW_SPIN),
      uFlowSpeed: new Uniform(SLOW_FLOW),
      uFovScale: new Uniform(1000),
      uSizeScale: new Uniform(0.78),
      uCoilRadius: new Uniform(0.21),
      uCoilTurns: new Uniform(8),
      uCoilSpin: new Uniform(SLOW_COIL_SPIN),
      uCoilDepth: new Uniform(0.36),
      uCoreColor: new Uniform(coreColor),
      uP0: new Uniform(new Vector2(SEVEN_PATH.p0.x + SEVEN_SHIFT, SEVEN_PATH.p0.y)),
      uC1: new Uniform(new Vector2(SEVEN_PATH.c1.x + SEVEN_SHIFT, SEVEN_PATH.c1.y)),
      uP1: new Uniform(new Vector2(SEVEN_PATH.p1.x + SEVEN_SHIFT, SEVEN_PATH.p1.y)),
      uC2: new Uniform(new Vector2(SEVEN_PATH.c2.x + SEVEN_SHIFT, SEVEN_PATH.c2.y)),
      uP2: new Uniform(new Vector2(SEVEN_PATH.p2.x + SEVEN_SHIFT, SEVEN_PATH.p2.y)),
      uZeroCenter: new Uniform(
        new Vector2(ZERO.center.x + ZERO_SHIFT, ZERO.center.y),
      ),
      uZeroR: new Uniform(new Vector2(ZERO.rx, ZERO.ry)),
    };
    uniformsRef.current = {
      uEnter: uniforms.uEnter,
      uOrbit: uniforms.uOrbit,
      uPointer: uniforms.uPointer,
      uPointerActive: uniforms.uPointerActive,
      uNodePos: uniforms.uNodePos,
      uFocus: uniforms.uFocus,
      uCompress: uniforms.uCompress,
      uShock: uniforms.uShock,
    };

    const material = new ShaderMaterial({
      uniforms,
      vertexShader: COIL_EXPERIENCE_VERT,
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
    const streakGrain = streak.uniforms.get("uGrain");
    if (streakGrain) streakGrain.value = 0;
    const chromatic = new ChromaticAberrationEffect({
      offset: new Vector2(0.0011, 0.0011),
      radialModulation: true,
      modulationOffset: 0.35,
    });
    const toneMapping = new ToneMappingEffect({
      mode: ToneMappingMode.ACES_FILMIC,
    });
    composer.addPass(new EffectPass(camera, streak, chromatic, toneMapping));

    let cameraBaseZ = BASE_Z;

    const resize = () => {
      const w = Math.max(1, stage.clientWidth);
      const h = Math.max(1, stage.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const visibleHeight =
        2 * Math.tan((camera.fov * Math.PI) / 360) * BASE_Z;
      const visibleWidth = visibleHeight * camera.aspect;
      const needed = GALAXY_DIAMETER / (visibleWidth * VIEW_FILL);
      cameraBaseZ = BASE_Z * Math.max(1, needed);
      camera.position.z = cameraBaseZ;

      uniforms.uFovScale.value =
        (h * dpr) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    };
    resize();

    // ---- drag to rotate (hold left mouse button) ----
    const rot = { yaw: 0, yawTarget: 0, tiltOffset: 0, tiltTarget: 0 };
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const DRAG_SENSITIVITY = 1.6;
    const DAMPING = 0.05;
    const DRAG_DAMPING = 0.24;
    const MAX_TILT = 0.85;

    const canStartDrag = (target: EventTarget | null) =>
      target instanceof Element
        ? !target.closest("a, button, input, textarea, select")
        : true;

    const onDragDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (event.button !== 0) return;
      if (!canStartDrag(event.target)) return;
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.style.cursor = "grabbing";
    };
    const onDragMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = (event.clientX - lastX) / window.innerWidth;
      const dy = (event.clientY - lastY) / window.innerHeight;
      rot.yawTarget += dx * Math.PI * DRAG_SENSITIVITY;
      rot.tiltTarget = Math.max(
        -MAX_TILT,
        Math.min(MAX_TILT, rot.tiltTarget + dy * Math.PI * DRAG_SENSITIVITY),
      );
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onDragUp = () => {
      dragging = false;
      canvas.style.cursor = "";
    };

    // Hold-to-detonate: any press that is not on a control counts while
    // EXPLORE is running.
    const onHoldDown = (event: PointerEvent) => {
      if (modeRef.current !== "explore") return;
      if (!canStartDrag(event.target)) return;
      holdActiveRef.current = true;
    };
    const onHoldUp = () => {
      holdActiveRef.current = false;
    };

    let alive = true;
    let raf = 0;
    let elapsed = 0;
    // -1 = "no clock yet"; the first tick adopts the rAF timestamp instead
    // of calling a wall-clock function here.
    let last = -1;

    // Linear 0..1 timeline clock; the eased value is what the shader sees.
    let morphLinear = 0;
    let morphTarget = 0;
    let lastScrollY = window.scrollY;
    let scrollVel = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!alive) return;

      const dt = last < 0 ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      // The system clock can run slow (landing slow-mo) without affecting
      // the real-time scroll logic.
      const simDt = dt * timeScaleRef.current.value;
      elapsed += simDt;

      uniforms.uTime.value = elapsed;
      uniforms.uIntro.value = smoothstep(0, 0.25, elapsed);
      uniforms.uForm.value = smoothstep(0.3, 1.35, elapsed);
      uniforms.uSpin.value = SLOW_SPIN;
      starUniforms.uReveal.value = smoothstep(0, 0.7, elapsed);

      const damp = Math.min(1, (dragging ? DRAG_DAMPING : DAMPING) + dt * 3);
      rot.yaw += (rot.yawTarget - rot.yaw) * damp;
      rot.tiltOffset += (rot.tiltTarget - rot.tiltOffset) * damp;
      pivot.rotation.y = rot.yaw;
      tiltGroup.rotation.x = 0.5 + rot.tiltOffset;

      // While a verb sequence runs, scroll loses its trigger role: the
      // timeline belongs to the action. BUILD forces the formation on a
      // faster clock instead.
      const experienceMode = modeRef.current;
      if (experienceMode === "idle") {
        const scrollY = window.scrollY;
        scrollVel = scrollVel * 0.75 + (scrollY - lastScrollY) * 0.25;
        lastScrollY = scrollY;
        if (scrollVel > 0.6) {
          morphTarget = 1;
        } else if (scrollVel < -0.6) {
          morphTarget = 0;
        }
      } else if (experienceMode === "build") {
        morphTarget = 1;
      }

      const duration =
        experienceMode === "build" ? BUILD_MORPH_DURATION : MORPH_DURATION;
      const step = dt / duration;
      const delta = morphTarget - morphLinear;
      morphLinear =
        Math.abs(delta) <= step
          ? morphTarget
          : morphLinear + Math.sign(delta) * step;

      const eased = easeInOutCubic(morphLinear);
      uniforms.uMorph.value = eased;

      // ---- the living explore field ----
      const targetPointerActive = experienceMode === "explore" ? 1 : 0;
      uniforms.uPointerActive.value +=
        (targetPointerActive - uniforms.uPointerActive.value) * damp;
      uniforms.uShock.value = Math.max(0, uniforms.uShock.value - dt / 1.1);
      if (experienceMode === "explore") {
        // hold anywhere to compress the core; a full hold detonates on
        // release and the system re-forms on its own
        holdRef.current = holdActiveRef.current
          ? Math.min(1.25, holdRef.current + dt)
          : Math.max(0, holdRef.current - dt * 3);
        uniforms.uCompress.value = smoothstep(0, 1.1, holdRef.current);
        if (
          !holdActiveRef.current &&
          holdRef.current > 1.05 &&
          uniforms.uShock.value === 0
        ) {
          uniforms.uShock.value = 1;
          holdRef.current = 0;
          if (exploreRef.current) {
            gsap.fromTo(
              exploreRef.current,
              { rotation: -1.4 },
              { rotation: 0, duration: 0.7, ease: "elastic.out(1.2, 0.35)" },
            );
          }
        }
        // depth parallax: the camera drifts against the pointer so the
        // cloud reads as volume, not a decal
        cameraExtraRef.current.x +=
          (pointerRef.current.x * -0.5 - cameraExtraRef.current.x) * damp;
        cameraExtraRef.current.y +=
          (pointerRef.current.y * -0.3 - cameraExtraRef.current.y) * damp;
        cameraExtraRef.current.z += (0 - cameraExtraRef.current.z) * damp;
      } else if (experienceMode !== "landing") {
        holdRef.current = 0;
        uniforms.uCompress.value = Math.max(
          0,
          uniforms.uCompress.value - dt * 2,
        );
      }

      // ENTER hover preview: the scene leans in before the click. GSAP owns
      // the extra camera offset during sequences, so the hover lerp only
      // runs while idle.
      if (experienceMode === "idle") {
        const targetExtra = hoverRef.current === "enter" ? -0.55 : 0;
        cameraExtraRef.current.z +=
          (targetExtra - cameraExtraRef.current.z) * damp;
      }
      camera.position.set(
        cameraExtraRef.current.x,
        cameraExtraRef.current.y,
        cameraBaseZ * (1 - 0.055 * Math.sin(clamp(morphLinear) * Math.PI)) +
          cameraExtraRef.current.z,
      );

      composer.render(dt);
    };

    canvas.style.opacity = "1";

    if (cap.software) {
      uniforms.uIntro.value = 1;
      uniforms.uForm.value = 1;
      uniforms.uMorph.value = 1;
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
        last = -1;
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
    stage.addEventListener("pointerdown", onHoldDown);
    window.addEventListener("pointerup", onHoldUp);
    window.addEventListener("pointercancel", onHoldUp);
    window.addEventListener("pointerdown", onDragDown);
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragUp);
    window.addEventListener("pointercancel", onDragUp);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      uniformsRef.current = null;
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      stage.removeEventListener("pointerdown", onHoldDown);
      window.removeEventListener("pointerup", onHoldUp);
      window.removeEventListener("pointercancel", onHoldUp);
      window.removeEventListener("pointerdown", onDragDown);
      window.removeEventListener("pointermove", onDragMove);
      window.removeEventListener("pointerup", onDragUp);
      window.removeEventListener("pointercancel", onDragUp);
      geometry.dispose();
      starGeometry.dispose();
      material.dispose();
      starMaterial.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  const actions = copy?.actions;

  return (
    <section ref={rootRef} id="hero" className="l07-hero l07-stage relative">
      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] overflow-hidden mix-blend-screen"
      >
        <span className="l07-fallback" aria-hidden>
          07
        </span>
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full cursor-grab opacity-0 transition-opacity duration-1000"
        />

        <div className="pointer-events-none absolute inset-0 z-10">
          <div ref={chromeRef}>
            <span className="hero-side hero-side-left">
              {copy?.studio ?? "Estudio de producto digital"}
            </span>
            <div className="hero-side hero-side-right">
              <span className="hero-side-dot" aria-hidden />
              {copy?.available ?? "Disponible para proyectos"}
            </div>
            <div className="hero-bottom">
              <span>{copy?.build ?? "Desliza para construir"}</span>
              <span>07 — layer07</span>
            </div>
          </div>

          {mode === "idle" && (
            <div
              ref={actionsRef}
              className="pointer-events-auto absolute inset-x-0 bottom-16 z-20 mx-auto flex w-full max-w-md gap-2 px-4 sm:bottom-20 sm:gap-3"
            >
              <button
                type="button"
                onClick={handleEnter}
                onMouseEnter={() => {
                  hoverRef.current = "enter";
                }}
                onMouseLeave={() => {
                  hoverRef.current = null;
                }}
                aria-label={actions?.enter.hint}
                className="group relative min-h-11 flex-1 border border-line bg-surface/50 px-2 py-3 font-mono text-[0.65rem] tracking-[0.22em] text-ink backdrop-blur-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                {actions?.enter.label ?? "ENTER"}
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] lowercase tracking-normal text-ink/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {actions?.enter.hint}
                </span>
              </button>
              <button
                type="button"
                onClick={handleExplore}
                onMouseEnter={() => {
                  hoverRef.current = "explore";
                  const uniforms = uniformsRef.current;
                  if (uniforms) {
                    track(
                      gsap.to(uniforms.uOrbit, {
                        value: 0.12,
                        duration: 0.5,
                        overwrite: "auto",
                      }),
                    );
                  }
                }}
                onMouseLeave={() => {
                  hoverRef.current = null;
                  const uniforms = uniformsRef.current;
                  if (uniforms) {
                    track(
                      gsap.to(uniforms.uOrbit, {
                        value: 0,
                        duration: 0.6,
                        overwrite: "auto",
                      }),
                    );
                  }
                }}
                aria-label={actions?.explore.hint}
                className="group relative min-h-11 flex-1 border border-line bg-surface/50 px-2 py-3 font-mono text-[0.65rem] tracking-[0.22em] text-ink backdrop-blur-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                {actions?.explore.label ?? "EXPLORE"}
                <span className="absolute -top-1 left-2 h-1 w-1 rounded-full bg-[var(--accent)] opacity-0 transition-all duration-300 group-hover:-top-2 group-hover:opacity-100" aria-hidden />
                <span className="absolute -bottom-1 right-3 h-1 w-1 rounded-full bg-[var(--accent)] opacity-0 transition-all duration-500 group-hover:-bottom-2 group-hover:opacity-100" aria-hidden />
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] lowercase tracking-normal text-ink/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {actions?.explore.hint}
                </span>
              </button>
              <button
                type="button"
                onClick={handleBuild}
                onMouseEnter={() => {
                  hoverRef.current = "build";
                }}
                onMouseLeave={() => {
                  hoverRef.current = null;
                }}
                aria-label={actions?.build.hint}
                className="group relative min-h-11 flex-1 overflow-hidden border border-line bg-surface/50 px-2 py-3 font-mono text-[0.65rem] tracking-[0.22em] text-ink backdrop-blur-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                {actions?.build.label ?? "BUILD"}
                <span
                  className="absolute bottom-0 left-0 h-px w-0 bg-[var(--accent)] transition-all duration-500 group-hover:w-full"
                  aria-hidden
                />
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] lowercase tracking-normal text-ink/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {actions?.build.hint}
                </span>
              </button>
            </div>
          )}

          {(mode === "explore" || mode === "landing") && (
            <p
              className="absolute top-16 left-1/2 z-20 -translate-x-1/2 font-mono text-[0.6rem] tracking-[0.3em] text-ink/50"
              aria-hidden
            >
              {mode === "landing" && activeIndex !== null
                ? `EXPLORE → ${capabilities[activeIndex]}`
                : "EXPLORE"}
            </p>
          )}

          {mode === "explore" && (
            <div
              id="explore-field"
              ref={exploreRef}
              className="absolute inset-0 z-20"
            >
              {capabilities.map((label, index) => {
                const pos = EXPLORE_POS[index % EXPLORE_POS.length];
                return (
                  <button
                    key={label}
                    type="button"
                    data-explore-label
                    onClick={() => selectNode(index)}
                    onMouseEnter={(event) =>
                      focusNode(index, event.currentTarget)
                    }
                    onMouseLeave={blurNode}
                    onFocus={(event) => focusNode(index, event.currentTarget)}
                    onBlur={blurNode}
                    className="group pointer-events-auto absolute flex min-h-11 -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 border border-line bg-surface/60 px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink backdrop-blur-sm transition-all duration-300 hover:scale-[1.06] hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    style={{ left: pos.x, top: pos.y }}
                  >
                    <span className="relative inline-block h-2.5 w-2.5" aria-hidden>
                      <span className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-80 transition-transform duration-300 group-hover:scale-150" />
                      <span className="absolute -inset-1.5 rounded-full border border-[var(--accent)] opacity-40 transition-opacity duration-300 group-hover:opacity-90" />
                    </span>
                    {label}
                  </button>
                );
              })}
              <p className="absolute inset-x-4 bottom-24 mx-auto max-w-sm text-center font-mono text-[0.65rem] lowercase tracking-normal text-ink/60">
                {copy?.exploreHint}
              </p>
              <button
                type="button"
                onClick={exitExplore}
                className="pointer-events-auto absolute bottom-10 left-1/2 min-h-11 -translate-x-1/2 border border-line bg-surface/50 px-4 font-mono text-xs text-ink/80 backdrop-blur-sm transition-colors hover:border-[var(--accent)] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                ← {copy?.exploreBack ?? "Volver al hero"}
              </button>
              <div
                ref={cursorRef}
                className="pointer-events-none absolute left-0 top-0 z-30 hidden [@media(pointer:fine)]:block"
                aria-hidden
              >
                <span className="absolute -left-4 -top-4 h-8 w-8 rounded-full border border-[var(--accent)] opacity-40" />
                <span className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              </div>
            </div>
          )}

          {mode === "landing" && activeIndex !== null && (
            <div className="absolute inset-0 z-20 grid place-items-center px-4">
              <div
                ref={landingPanelRef}
                className="pointer-events-none w-[min(88vw,560px)] border border-line bg-surface/90 p-8 text-center shadow-[0_18px_70px_rgba(0,0,0,0.6)] backdrop-blur-md sm:p-10"
              >
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ink-muted">
                  {capabilities[activeIndex]}
                </p>
                <h2 className="mt-4 font-display text-2xl leading-tight tracking-[-0.02em] text-ink sm:text-3xl">
                  {capabilityItems[activeIndex]?.title}
                </h2>
                <p className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
                  {capabilityItems[activeIndex]?.body}
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={
                      EXPLORE_FILTERS[activeIndex]
                        ? `/${activeLocale}/work?filter=${EXPLORE_FILTERS[activeIndex]}`
                        : `/${activeLocale}/work`
                    }
                    className="pointer-events-auto inline-flex min-h-11 items-center rounded-full bg-[var(--accent)] px-7 text-sm font-semibold text-[var(--bg)] transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    {copy?.secondary} →
                  </a>
                  <button
                    type="button"
                    onClick={exitLanding}
                    className="pointer-events-auto inline-flex min-h-11 items-center border border-line px-4 font-mono text-xs text-ink/80 transition-colors hover:border-[var(--accent)] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    ← {copy?.exploreBack ?? "Volver al hero"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === "build" && (
            <div className="absolute inset-0 z-20 grid place-items-center px-4">
              <div
                ref={buildPanelRef}
                className="pointer-events-none relative w-[min(86vw,540px)] border border-line bg-surface/90 shadow-[0_18px_70px_rgba(0,0,0,0.6)] backdrop-blur-md"
              >
                <svg
                  viewBox="0 0 520 190"
                  preserveAspectRatio="none"
                  className="absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)]"
                  aria-hidden
                >
                  <rect
                    ref={buildFrameRef}
                    x="6"
                    y="6"
                    width="508"
                    height="178"
                    fill="none"
                    stroke="var(--accent)"
                    strokeOpacity="0.7"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle cx="6" cy="6" r="3" fill="var(--accent)" fillOpacity="0.85" />
                  <circle cx="514" cy="6" r="3" fill="var(--accent)" fillOpacity="0.85" />
                  <circle cx="6" cy="184" r="3" fill="var(--accent)" fillOpacity="0.85" />
                  <circle cx="514" cy="184" r="3" fill="var(--accent)" fillOpacity="0.85" />
                </svg>
                <div className="relative px-6 py-10 text-center sm:px-10">
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ink-muted">
                    {copy?.studio}
                  </p>
                  <p
                    ref={buildTextRef}
                    className="mt-4 font-display text-3xl leading-tight tracking-[-0.02em] text-ink sm:text-4xl"
                  >
                    {copy?.buildQuestion}
                  </p>
                  <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <a
                      ref={buildCtaRef}
                      href={`/${activeLocale}/contact`}
                      className="pointer-events-auto inline-flex min-h-11 items-center rounded-full bg-[var(--accent)] px-7 text-sm font-semibold text-[var(--bg)] transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    >
                      {copy?.buildCta} →
                    </a>
                    <button
                      type="button"
                      onClick={exitBuild}
                      className="pointer-events-auto inline-flex min-h-11 items-center border border-line px-4 font-mono text-xs text-ink/80 transition-colors hover:border-[var(--accent)] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    >
                      ← {copy?.exploreBack ?? "Volver al hero"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
