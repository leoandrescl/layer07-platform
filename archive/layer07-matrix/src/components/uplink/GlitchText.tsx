"use client";

export function GlitchText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <h1 className={`uplink-glitch ${className ?? ""}`} data-text={text}>
      {text}
    </h1>
  );
}
