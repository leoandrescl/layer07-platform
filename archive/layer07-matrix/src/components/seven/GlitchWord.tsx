export function GlitchWord({ text }: { text: string }) {
  return (
    <span className="lain-glitch">
      <span className="lain-glitch-base">{text}</span>
      <span className="lain-glitch-rgb lain-glitch-red" aria-hidden>
        {text}
      </span>
      <span className="lain-glitch-rgb lain-glitch-cyan" aria-hidden>
        {text}
      </span>
      <span className="lain-glitch-slice lain-glitch-s1" aria-hidden>
        {text}
      </span>
      <span className="lain-glitch-slice lain-glitch-s2" aria-hidden>
        {text}
      </span>
      <span className="lain-glitch-slice lain-glitch-s3" aria-hidden>
        {text}
      </span>
    </span>
  );
}
