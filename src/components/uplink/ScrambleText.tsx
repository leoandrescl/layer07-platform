"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "░▒▓█<>/\\|+*#01ABCDEF";

export function ScrambleText({
  text,
  className,
  as: Tag = "span",
  playOnMount = false,
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "p";
  playOnMount?: boolean;
}) {
  const [output, setOutput] = useState(text);
  const reduced = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (playOnMount && !reduced.current) run();
    return () => {
      if (timer.current != null) window.clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount scramble only
  }, []);

  function run() {
    if (reduced.current) {
      setOutput(text);
      return;
    }
    if (timer.current != null) window.clearInterval(timer.current);
    const chars = text.split("");
    let frame = 0;
    const total = 18;
    timer.current = window.setInterval(() => {
      frame += 1;
      setOutput(
        chars
          .map((ch, i) => {
            if (ch === " " || ch === "·") return ch;
            if (frame / total > i / chars.length) return text[i] ?? ch;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? ch;
          })
          .join(""),
      );
      if (frame >= total + chars.length) {
        if (timer.current != null) window.clearInterval(timer.current);
        timer.current = null;
        setOutput(text);
      }
    }, 28);
  }

  return (
    <Tag
      className={className}
      onMouseEnter={run}
      onFocus={run}
    >
      {output}
    </Tag>
  );
}
