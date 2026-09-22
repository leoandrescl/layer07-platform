"use client";

import { useCallback, useRef } from "react";

/**
 * Shared "digital matter" behaviour for any clickable element: cursor-tracked
 * glow + dust, magnetic shift and a supernova burst on press.
 */
export function useButtonFx<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const frame = useRef(0);

  const onPointerMove = useCallback((event: React.PointerEvent<T>) => {
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

  const onPointerLeave = useCallback(() => {
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

  const onPointerDown = useCallback(
    (event: React.PointerEvent<T>) => {
      burst(event.clientX, event.clientY);
    },
    [burst],
  );

  const onClick = useCallback(
    (event: React.MouseEvent<T>) => {
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

  return {
    ref,
    handlers: { onPointerMove, onPointerLeave, onPointerDown, onClick },
  };
}

export function ButtonLayers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className="btn-dust" aria-hidden />
      <span className="btn-glow" aria-hidden />
      <span className="btn-label">{children}</span>
      <span className="btn-burst-layer" aria-hidden />
    </>
  );
}
