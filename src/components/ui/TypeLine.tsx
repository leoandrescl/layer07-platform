"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type TypeLineProps = {
  text: string;
  className?: string;
  startDelayMs?: number;
};

export function TypeLine({ text, className, startDelayMs = 400 }: TypeLineProps) {
  const [visible, setVisible] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setVisible(text);
      setDone(true);
      return;
    }

    let i = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        i += 1;
        setVisible(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(intervalId);
          setDone(true);
        }
      }, 28);
    }, startDelayMs);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, startDelayMs]);

  return (
    <p className={cn("font-mono text-sm text-muted-dim sm:text-base", className)}>
      <span className="text-[#00ff66]">guest@layer07</span>
      <span className="text-[#00f0ff]">:~$</span> {visible}
      <span
        className={cn(
          "ml-0.5 inline-block h-[1.1em] w-[0.55ch] translate-y-[0.1em] bg-neon align-baseline",
          done ? "animate-pulse-online" : "",
        )}
        aria-hidden
      />
    </p>
  );
}
