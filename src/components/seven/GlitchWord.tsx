export function GlitchWord({ text }: { text: string }) {
  return (
    <span className="lain-glitch" aria-label={text}>
      <span className="lain-glitch-sizer" aria-hidden>
        {text}
      </span>
      <span className="lain-glitch-rgb lain-glitch-cyan" aria-hidden>
        {text}
      </span>
      <span className="lain-glitch-rgb lain-glitch-mag" aria-hidden>
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
