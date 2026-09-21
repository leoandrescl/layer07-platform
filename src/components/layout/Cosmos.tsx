/** Deterministic pseudo-random layout so SSR and client match. */
const TWINKLE = Array.from({ length: 30 }, (_, i) => ({
  left: (i * 37.7) % 100,
  top: (i * 61.3) % 100,
  size: 1 + ((i * 7) % 3) * 0.6,
  delay: (i * 0.43) % 5,
  duration: 2.4 + ((i * 13) % 6) * 0.5,
}));

const DUST = Array.from({ length: 20 }, (_, i) => ({
  left: (i * 53.1) % 100,
  top: (i * 29.7) % 100,
  size: 2 + ((i * 5) % 4),
  delay: (i * 1.1) % 16,
  duration: 16 + ((i * 11) % 14),
  tone: i % 3,
}));

const SHOOTERS = [
  { top: 10, left: 6, delay: 4, duration: 12 },
  { top: 28, left: 58, delay: 11, duration: 15 },
  { top: 4, left: 34, delay: 19, duration: 17 },
];

/**
 * Site-wide cosmic background: deep space, drifting nebula washes, three star
 * layers, twinkling stars, slow dust and the odd shooting star. Pure CSS so it
 * runs behind every section.
 */
export function Cosmos() {
  return (
    <div aria-hidden className="cosmos">
      <div className="cosmos-nebula cosmos-nebula-a" />
      <div className="cosmos-nebula cosmos-nebula-b" />
      <div className="cosmos-nebula cosmos-nebula-c" />

      <div className="cosmos-stars cosmos-stars-a" />
      <div className="cosmos-stars cosmos-stars-b" />
      <div className="cosmos-stars cosmos-stars-c" />

      <div className="cosmos-twinkle">
        {TWINKLE.map((star, i) => (
          <span
            key={i}
            style={
              {
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                "--d": `${star.duration}s`,
                "--delay": `${star.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="cosmos-dust">
        {DUST.map((particle, i) => (
          <span
            key={i}
            className={`t${particle.tone}`}
            style={
              {
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                "--d": `${particle.duration}s`,
                "--delay": `${particle.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {SHOOTERS.map((shooter, i) => (
        <span
          key={i}
          className="cosmos-shoot"
          style={
            {
              top: `${shooter.top}%`,
              left: `${shooter.left}%`,
              "--d": `${shooter.duration}s`,
              "--delay": `${shooter.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      <div className="grain cosmos-grain" />
    </div>
  );
}
