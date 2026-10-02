"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CATEGORY_LABELS,
  getFeaturedProjects,
  type Project,
} from "@/lib/content/projects";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/site";
import type { LabHeroProps } from "@/lib/lab/heroes";

/** style object that also accepts CSS custom properties (--foo) */
type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

const PREVIEW_LIMIT = 3;
/** pointer-parallax amount per headline line (front line moves most) */
const LINE_DEPTH = [0.34, 0.64, 0.96];
const ACCENT_LINE = 2;

export function TintaVivaHero({ dict, locale }: LabHeroProps) {
  const rootRef = useRef<HTMLElement | null>(null);
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

  // Pointer field: parallax on the headline + a soft accent orb that lives
  // behind it. A single rAF lerps toward the pointer, or drifts on its own
  // when the device never moves one (touch / idle).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const preview = previewRef.current;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const target = { px: 0, py: 0, orbX: 0.5, orbY: 0.42 };
    const current = { ...target };
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
      if (fine && preview) {
        preview.style.setProperty("--x", `${event.clientX}px`);
        preview.style.setProperty("--y", `${event.clientY}px`);
      }
    };

    const tick = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const goal = seen
        ? target
        : {
            px: Math.sin(t * 0.22) * 0.24,
            py: Math.cos(t * 0.17) * 0.18,
            orbX: 0.5 + Math.sin(t * 0.18) * 0.16,
            orbY: 0.42 + Math.cos(t * 0.13) * 0.13,
          };
      const k = Math.min(1, dt * 4);
      current.px += (goal.px - current.px) * k;
      current.py += (goal.py - current.py) * k;
      current.orbX += (goal.orbX - current.orbX) * k;
      current.orbY += (goal.orbY - current.orbY) * k;
      root.style.setProperty("--px", current.px.toFixed(4));
      root.style.setProperty("--py", current.py.toFixed(4));
      root.style.setProperty("--orb-x", `${(current.orbX * 100).toFixed(2)}vw`);
      root.style.setProperty("--orb-y", `${(current.orbY * 100).toFixed(2)}vh`);
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

    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onPointerMove);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
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
