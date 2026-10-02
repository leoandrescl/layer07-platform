"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ClampToEdgeWrapping,
  Color,
  HalfFloatType,
  LinearFilter,
  Mesh,
  NoColorSpace,
  NoToneMapping,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
  CanvasTexture,
} from "three";
import { detectCapability } from "@/lib/webgl/capability";
import {
  CATEGORY_LABELS,
  getFeaturedProjects,
  type Project,
} from "@/lib/content/projects";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/site";
import { INK_DISPLAY_FRAG, INK_SIM_FRAG, QUAD_VERT } from "./tinta-viva-shaders";
import type { LabHeroProps } from "@/lib/lab/heroes";

/** style object that also accepts CSS custom properties (--foo) */
type CSSVars = CSSProperties & Record<`--${string}`, string | number>;
type LineMetric = { font: string; italic: boolean; text: string };

const PREVIEW_LIMIT = 3;
/** pointer-parallax amount per headline line (front line moves most) */
const LINE_DEPTH = [0.34, 0.64, 0.96];
const ACCENT_LINE = 2;

function readToken(root: HTMLElement, name: string, fallback: string) {
  const value = getComputedStyle(root).getPropertyValue(name).trim();
  return value || fallback;
}

export function TintaVivaHero({ dict, locale }: LabHeroProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<number | null>(null);

  const copy = dict?.lab?.tintaViva;
  const activeLocale = locale && hasLocale(locale) ? locale : defaultLocale;
  const lines = copy?.lines ?? [];
  const projects = getFeaturedProjects(8)
    .filter((project): project is Project & { image: string } =>
      Boolean(project.image),
    )
    .slice(0, PREVIEW_LIMIT);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    const preview = previewRef.current;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const lineEls = Array.from(
      root.querySelectorAll<HTMLElement>(".tinta-line-inner"),
    );
    let metrics: LineMetric[] = [];

    const measure = () => {
      metrics = lineEls.map((el) => {
        const cs = getComputedStyle(el);
        const style =
          cs.fontStyle && cs.fontStyle !== "normal" ? `${cs.fontStyle} ` : "";
        return {
          font: `${style}${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,
          italic: cs.fontStyle === "italic" || cs.fontStyle === "oblique",
          text: (el.textContent ?? "").trim(),
        };
      });
    };

    // ---- pointer field shared by the DOM layer and the ink ----
    const target = { px: 0, py: 0, orbX: 0.5, orbY: 0.42 };
    const current = { ...target };
    const pointerUv = new Vector2(0.5, 0.5);
    const pointerTarget = new Vector2(0.5, 0.5);
    const velocity = new Vector2();
    let hoverTarget = 0;
    let hover = 0;
    let seen = false;
    let last = performance.now();
    let raf = 0;
    let alive = true;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      seen = true;
      target.px = (event.clientX / window.innerWidth) * 2 - 1;
      target.py = -((event.clientY / window.innerHeight) * 2 - 1);
      target.orbX = event.clientX / window.innerWidth;
      target.orbY = event.clientY / window.innerHeight;
      const rect = root.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1 - (event.clientY - rect.top) / rect.height;
        pointerTarget.set(nx, ny);
        hoverTarget =
          nx > -0.05 && nx < 1.05 && ny > -0.05 && ny < 1.05 ? 1 : 0;
      }
      if (fine && preview) {
        preview.style.setProperty("--x", `${event.clientX}px`);
        preview.style.setProperty("--y", `${event.clientY}px`);
      }
    };
    const onPointerOut = (event: PointerEvent) => {
      if (event.pointerType !== "touch" && !event.relatedTarget) {
        hoverTarget = 0;
      }
    };

    // ---- optional WebGL living-ink overlay ----
    const cap = detectCapability();
    root.dataset.tier = String(cap.tier);
    root.dataset.software = cap.software ? "true" : "false";

    let renderer: WebGLRenderer | null = null;
    let simScene: Scene | null = null;
    let displayScene: Scene | null = null;
    let camera: OrthographicCamera | null = null;
    let geometry: PlaneGeometry | null = null;
    let simMaterial: ShaderMaterial | null = null;
    let displayMaterial: ShaderMaterial | null = null;
    let maskCanvas: HTMLCanvasElement | null = null;
    let maskCtx: CanvasRenderingContext2D | null = null;
    let maskTexture: CanvasTexture | null = null;
    let simTargets: WebGLRenderTarget[] = [];
    let readIndex = 0;
    let simW = 1;
    let simH = 1;
    let opacity = 0;
    let started = false;

    const maxDpr = cap.tier === 2 ? 1.6 : 1.25;

    if (canvas && cap.tier > 0) {
      try {
        renderer = new WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          depth: false,
          stencil: false,
          premultipliedAlpha: false,
          powerPreference: "high-performance",
        });
      } catch {
        renderer = null;
      }
    }

    if (renderer && canvas) {
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = SRGBColorSpace;
      renderer.toneMapping = NoToneMapping;

      camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
      geometry = new PlaneGeometry(2, 2);

      maskCanvas = document.createElement("canvas");
      maskCtx = maskCanvas.getContext("2d");
      maskTexture = new CanvasTexture(maskCanvas);
      maskTexture.colorSpace = NoColorSpace;
      maskTexture.minFilter = LinearFilter;
      maskTexture.magFilter = LinearFilter;
      maskTexture.generateMipmaps = false;

      simMaterial = new ShaderMaterial({
        uniforms: {
          uPrev: { value: null },
          uTexel: { value: new Vector2(1 / 128, 1 / 128) },
          uAspect: { value: 1 },
          uTime: { value: 0 },
          uPointer: { value: new Vector2(0.5, 0.5) },
          uPointerVel: { value: new Vector2(0, 0) },
          uHover: { value: 0 },
        },
        vertexShader: QUAD_VERT,
        fragmentShader: INK_SIM_FRAG,
        depthTest: false,
        depthWrite: false,
      });

      displayMaterial = new ShaderMaterial({
        uniforms: {
          uDye: { value: null },
          uMask: { value: maskTexture },
          uInk: { value: new Color(readToken(root, "--ink", "#f2efe9")) },
          uAccent: { value: new Color(readToken(root, "--accent", "#7a88ff")) },
          uOpacity: { value: 0 },
        },
        vertexShader: QUAD_VERT,
        fragmentShader: INK_DISPLAY_FRAG,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      simScene = new Scene();
      simScene.add(new Mesh(geometry, simMaterial));
      displayScene = new Scene();
      displayScene.add(new Mesh(geometry, displayMaterial));

      const makeTarget = () =>
        new WebGLRenderTarget(simW, simH, {
          wrapS: ClampToEdgeWrapping,
          wrapT: ClampToEdgeWrapping,
          minFilter: LinearFilter,
          magFilter: LinearFilter,
          format: RGBAFormat,
          type: HalfFloatType,
          depthBuffer: false,
          stencilBuffer: false,
        });

      // initial sim resolution from the current box
      const w0 = Math.max(1, root.clientWidth);
      const h0 = Math.max(1, root.clientHeight);
      simW = cap.tier === 2 ? 192 : 128;
      simH = Math.max(64, Math.round(simW * (h0 / w0)));
      simTargets = [makeTarget(), makeTarget()];
    }

    const resize = () => {
      const w = Math.max(1, root.clientWidth);
      const h = Math.max(1, root.clientHeight);
      if (renderer) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
        renderer.setSize(w, h, false);
      }
      if (simMaterial && simTargets.length) {
        simW = cap.tier === 2 ? 192 : 128;
        simH = Math.max(64, Math.round(simW * (h / w)));
        simTargets.forEach((t) => t.setSize(simW, simH));
        simMaterial.uniforms.uTexel.value.set(1 / simW, 1 / simH);
        simMaterial.uniforms.uAspect.value = simW / simH;
      }
      if (maskCanvas && maskCtx) {
        maskCanvas.width = Math.max(1, Math.floor(w));
        maskCanvas.height = Math.max(1, Math.floor(h));
        if (maskTexture) maskTexture.needsUpdate = true;
      }
      measure();
    };

    const drawMask = (heroRect: DOMRect) => {
      if (!maskCtx || !maskCanvas || !maskTexture) return;
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      // coverage lives in alpha; red flags the accent line so the shader can
      // keep it tinted even when the headline's own fill is hidden
      maskCtx.textBaseline = "middle";
      for (let i = 0; i < lineEls.length; i += 1) {
        const metric = metrics[i];
        if (!metric) continue;
        const r = lineEls[i].getBoundingClientRect();
        const x = r.left - heroRect.left;
        const y = r.top - heroRect.top + r.height / 2;
        maskCtx.fillStyle = metric.italic ? "#ff0000" : "#00ffff";
        maskCtx.font = metric.font;
        if (metric.italic) {
          // canvas returns no real italic glyphs: emulate the oblique
          const skew = 0.2;
          maskCtx.save();
          maskCtx.transform(1, 0, -skew, 1, 0, 0);
          maskCtx.fillText(metric.text, x + skew * y, y);
          maskCtx.restore();
        } else {
          maskCtx.fillText(metric.text, x, y);
        }
      }
      maskTexture.needsUpdate = true;
    };

    // Confirm the shader actually painted before swapping out the DOM text.
    const verifyInk = (heroRect: DOMRect) => {
      if (!renderer || !lineEls[0]) return true;
      const gl = renderer.getContext();
      const bw = gl.drawingBufferWidth;
      const bh = gl.drawingBufferHeight;
      if (bw < 2 || bh < 2 || heroRect.height <= 0) return true;
      const r = lineEls[0].getBoundingClientRect();
      const px = new Uint8Array(4);
      for (let i = 0; i < 18; i += 1) {
        const sx = (r.left + (r.width * (i + 0.5)) / 18 - heroRect.left) / heroRect.width;
        const sy = (r.top + r.height / 2 - heroRect.top) / heroRect.height;
        const x = Math.min(bw - 1, Math.max(0, Math.round(sx * bw)));
        const y = Math.min(bh - 1, Math.max(0, Math.round(bh - (sy * bh))));
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        if (px[3] > 12) return true;
      }
      return false;
    };

    const tick = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      // DOM layer: parallax vars + the orbiting accent
      const goalPx = seen ? target.px : Math.sin(t * 0.22) * 0.24;
      const goalPy = seen ? target.py : Math.cos(t * 0.17) * 0.18;
      const goalOrbX = seen ? target.orbX : 0.5 + Math.sin(t * 0.18) * 0.16;
      const goalOrbY = seen ? target.orbY : 0.42 + Math.cos(t * 0.13) * 0.13;
      const ease = Math.min(1, dt * 4);
      current.px += (goalPx - current.px) * ease;
      current.py += (goalPy - current.py) * ease;
      current.orbX += (goalOrbX - current.orbX) * ease;
      current.orbY += (goalOrbY - current.orbY) * ease;
      root.style.setProperty("--px", current.px.toFixed(4));
      root.style.setProperty("--py", current.py.toFixed(4));
      root.style.setProperty("--orb-x", `${(current.orbX * 100).toFixed(2)}vw`);
      root.style.setProperty("--orb-y", `${(current.orbY * 100).toFixed(2)}vh`);

      if (
        !renderer ||
        !simScene ||
        !displayScene ||
        !camera ||
        !simMaterial ||
        !displayMaterial ||
        !maskTexture
      ) {
        return;
      }

      // pointer field + ink simulation
      pointerUv.lerp(pointerTarget, Math.min(1, dt * 12));
      const velEase = Math.min(1, dt * 10);
      velocity.x += ((pointerTarget.x - pointerUv.x) * 3 - velocity.x) * velEase;
      velocity.y += ((pointerTarget.y - pointerUv.y) * 3 - velocity.y) * velEase;
      hover += (hoverTarget - hover) * Math.min(1, dt * 4);

      simMaterial.uniforms.uTime.value = t;
      simMaterial.uniforms.uPointer.value.copy(pointerUv);
      simMaterial.uniforms.uPointerVel.value.copy(velocity);
      simMaterial.uniforms.uHover.value = hover;

      const write = 1 - readIndex;
      simMaterial.uniforms.uPrev.value = simTargets[readIndex].texture;
      renderer.setRenderTarget(simTargets[write]);
      renderer.render(simScene, camera);
      readIndex = write;

      const heroRect = root.getBoundingClientRect();
      drawMask(heroRect);

      opacity += (1 - opacity) * Math.min(1, dt * 1.6);
      displayMaterial.uniforms.uDye.value = simTargets[readIndex].texture;
      displayMaterial.uniforms.uOpacity.value = opacity;
      renderer.setRenderTarget(null);
      renderer.render(displayScene, camera);

      if (!started && opacity > 0.6) {
        started = true;
        // the ink now carries the headline; hide the DOM fill so there is no
        // misaligned double. If the shader painted nothing, keep the DOM text.
        if (verifyInk(heroRect)) root.classList.add("is-webgl");
      }
    };

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
      root.classList.remove("is-webgl");
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerout", onPointerOut);
    document.addEventListener("visibilitychange", onVisibility);
    document.fonts?.ready
      .then(() => {
        if (alive) measure();
      })
      .catch(() => undefined);
    if (canvas) canvas.addEventListener("webglcontextlost", onContextLost);

    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("visibilitychange", onVisibility);
      if (canvas) canvas.removeEventListener("webglcontextlost", onContextLost);
      root.classList.remove("is-webgl");
      geometry?.dispose();
      simMaterial?.dispose();
      displayMaterial?.dispose();
      maskTexture?.dispose();
      simTargets.forEach((t) => t.dispose());
      renderer?.dispose();
    };
  }, [dict]);

  return (
    <section ref={rootRef} className="tinta-root">
      <div className="tinta-orb" aria-hidden />

      <div className="tinta-inner">
        <div className="tinta-head">
          <span className="tinta-eyebrow">{copy?.eyebrow}</span>
          <span className="tinta-mark" aria-hidden>
            {copy?.mark}
          </span>
        </div>

        <h1 className="tinta-title" aria-label={lines.join(" ")}>
          {lines.map((line, i) => {
            const style: CSSVars = {
              "--i": i,
              "--d": LINE_DEPTH[i] ?? 0.5,
            };
            return (
              <span
                key={`${i}-${line}`}
                className={`tinta-line${i === ACCENT_LINE ? " tinta-line--accent" : ""}`}
              >
                <span className="tinta-line-track" style={style}>
                  <span className="tinta-line-inner">{line}</span>
                </span>
              </span>
            );
          })}
        </h1>

        <p className="tinta-lede">{copy?.lede}</p>

        <div className="tinta-actions">
          <Link
            className="tinta-cta tinta-cta--solid"
            href={localizedHref(activeLocale, "/contact")}
          >
            {copy?.primary}
          </Link>
          <Link
            className="tinta-cta"
            href={localizedHref(activeLocale, "/work")}
          >
            {copy?.secondary}
          </Link>
        </div>

        <div className="tinta-work-wrap">
          <span className="tinta-work-label">{copy?.workLabel}</span>
          <ul className="tinta-work" onPointerLeave={() => setActive(null)}>
            {projects.map((project, i) => (
              <li key={project.slug}>
                <Link
                  href={localizedHref(activeLocale, `/work/${project.slug}`)}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                >
                  <span>{project.client}</span>
                  <span className="tinta-work-cat">
                    {CATEGORY_LABELS[project.category][activeLocale]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="tinta-foot" aria-hidden>
        <span>{copy?.hint}</span>
        <span className="tinta-scroll">{copy?.scroll} ↓</span>
      </div>

      <canvas ref={canvasRef} className="tinta-ink" aria-hidden />

      <div
        ref={previewRef}
        className={`tinta-preview${active !== null ? " is-active" : ""}`}
        aria-hidden
      >
        {projects.map((project, i) => (
          <Image
            key={project.slug}
            src={project.image}
            alt=""
            fill
            sizes="(max-width: 768px) 60vw, 22rem"
            className={i === active ? "is-shown" : ""}
          />
        ))}
      </div>
    </section>
  );
}
