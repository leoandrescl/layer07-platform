"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";

type Variant = "solid" | "outline" | "ghost";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Button({
  href,
  children,
  variant = "solid",
  external,
  className,
  ...rest
}: ButtonProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const frame = useRef(0);

  const onMove = useCallback((event: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      el.style.setProperty("--dx", `${(px - 0.5) * 14}px`);
      el.style.setProperty("--dy", `${(py - 0.5) * 12}px`);
      el.style.setProperty("--tx", `${(px - 0.5) * 7}px`);
      el.style.setProperty("--ty", `${(py - 0.5) * 5}px`);
    });
  }, []);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
    el.style.setProperty("--dx", "0px");
    el.style.setProperty("--dy", "0px");
    el.style.setProperty("--tx", "0px");
    el.style.setProperty("--ty", "0px");
  }, []);

  const burst = useCallback((clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const layer = el.querySelector<HTMLElement>(".btn-burst-layer");
    if (!layer) return;
    const rect = el.getBoundingClientRect();
    const span = document.createElement("span");
    span.className = "btn-burst";
    span.style.left = `${clientX - rect.left}px`;
    span.style.top = `${clientY - rect.top}px`;
    layer.appendChild(span);
    span.addEventListener("animationend", () => span.remove(), { once: true });
  }, []);

  const onDown = useCallback(
    (event: React.PointerEvent<HTMLAnchorElement>) => {
      burst(event.clientX, event.clientY);
    },
    [burst],
  );

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // keyboard activation carries no pointer coordinates
      if (event.detail === 0) {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    },
    [burst],
  );

  const classes = `btn btn-${variant} ${className ?? ""}`;
  const isExternal = external || /^(https?:|mailto:|tel:)/.test(href);

  const inner = (
    <>
      <span className="btn-dust" aria-hidden />
      <span className="btn-glow" aria-hidden />
      <span className="btn-label">{children}</span>
      <span className="btn-burst-layer" aria-hidden />
    </>
  );

  const handlers = {
    onPointerMove: onMove,
    onPointerLeave: onLeave,
    onPointerDown: onDown,
    onClick,
  };

  if (isExternal) {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...handlers}
        {...rest}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link ref={ref} href={href} className={classes} {...handlers} {...rest}>
      {inner}
    </Link>
  );
}
