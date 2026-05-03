import React from "react";

interface GlitchTitleProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
  /** Delay before the first glitch cycle starts. Staggers multiple titles. */
  delay?: string;
  /** Total duration of one full cycle (glitch occurs in last ~4%). Default 7.5s. */
  duration?: string;
  children?: React.ReactNode;
}

/**
 * GlitchTitle — sporadic TV-signal interference effect on headings.
 *
 * Technique: CSS pseudo-elements (::before, ::after) mirror the text
 * via content: attr(data-text), then clip-path + translation creates
 * the RGB split and horizontal band cuts. No DOM duplication, A11y safe.
 *
 * Glitch activates only in the last 4-5% of each cycle (every ~7-8s),
 * keeping the effect surprising without fatiguing the reader.
 */
export const GlitchTitle = ({
  text,
  as: Tag = "h2",
  className = "",
  delay = "0s",
  duration = "7.5s",
  children,
}: GlitchTitleProps) => {
  const displayText = text ?? (typeof children === "string" ? children : "");

  return (
    <Tag
      className={`glitch-text ${className}`}
      data-text={displayText}
      style={{
        "--glitch-delay": delay,
        "--glitch-duration": duration,
      } as React.CSSProperties}
    >
      {/* children takes precedence so you can embed <BlinkingCursor /> etc. */}
      {children ?? displayText}
    </Tag>
  );
};
