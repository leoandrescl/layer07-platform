"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ label }: { label: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`${label}: ${isDark ? "dark" : "light"}`}
      aria-pressed={isDark}
      className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-line-strong"
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden
        className="relative block size-[15px] rounded-full border border-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: isDark ? "scale(0.62)" : "scale(1)" }}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-current transition-[clip-path] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            clipPath: isDark
              ? "circle(60% at 72% 28%)"
              : "circle(0% at 72% 28%)",
          }}
        />
      </span>
    </button>
  );
}
