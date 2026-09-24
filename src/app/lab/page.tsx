import Link from "next/link";
import { ACTIVE_HERO_SLUG, LAB_HEROES, type LabHero } from "@/lib/lab/heroes";

const STARS = [
  { x: 42, y: 44, r: 1.2 },
  { x: 96, y: 190, r: 1 },
  { x: 168, y: 58, r: 1.4 },
  { x: 214, y: 176, r: 1 },
  { x: 262, y: 92, r: 1.1 },
  { x: 318, y: 148, r: 1.3 },
  { x: 356, y: 62, r: 1 },
  { x: 372, y: 208, r: 1.2 },
  { x: 128, y: 118, r: 0.9 },
  { x: 300, y: 30, r: 0.9 },
];

const RING = Array.from({ length: 14 }, (_, i) => {
  const ang = (i / 14) * Math.PI * 2;
  return { x: 118 + Math.cos(ang) * 44, y: 126 + Math.sin(ang) * 74 };
});

const SEVEN_BAR = Array.from({ length: 5 }, (_, i) => ({
  x: 212 + (i / 4) * 92,
  y: 58,
}));
const SEVEN_LEG = [
  { x: 304, y: 58 },
  { x: 286, y: 108 },
  { x: 264, y: 150 },
  { x: 246, y: 194 },
];
const SEVEN = [...SEVEN_BAR, ...SEVEN_LEG.slice(1)];

const SPIRAL = Array.from({ length: 320 }, (_, i) => {
  const t = i / 320;
  const r = 6 + t * 158;
  const ang = t * 11;
  return {
    x: 200 + Math.cos(ang) * r * 1.08,
    y: 126 + Math.sin(ang) * r * 0.62,
    o: 0.12 + (1 - t) * 0.7,
    s: 0.6 + (1 - t) * 1.4,
  };
});

function HeroArt({ hero }: { hero: LabHero }) {
  const id = hero.slug;
  const color = hero.accent;

  if (hero.preview === "constellation") {
    return (
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <rect width="400" height="250" fill="#04050a" />
        <g opacity="0.18" fill="#cfe0ff">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} />
          ))}
        </g>
        <polyline
          points={`${RING.map((p) => `${p.x},${p.y}`).join(" ")} ${RING[0].x},${RING[0].y}`}
          fill="none"
          stroke={color}
          strokeOpacity="0.5"
          strokeWidth="1"
        />
        <polyline
          points={SEVEN.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={color}
          strokeOpacity="0.5"
          strokeWidth="1"
        />
        <g fill={color}>
          {RING.map((p, i) => (
            <circle key={`r${i}`} cx={p.x} cy={p.y} r="2.4" />
          ))}
          {SEVEN.map((p, i) => (
            <circle key={`s${i}`} cx={p.x} cy={p.y} r="2.8" />
          ))}
        </g>
      </svg>
    );
  }

  if (hero.preview === "particles") {
    return (
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <filter id={`${id}-pblur`}>
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <rect width="400" height="250" fill="#04050a" />
        <polyline
          points={SEVEN.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#bcd4ff"
          strokeOpacity="0.16"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${id}-pblur)`}
        />
        <polyline
          points={`${RING.map((p) => `${p.x},${p.y}`).join(" ")} ${RING[0].x},${RING[0].y}`}
          fill="none"
          stroke="#bcd4ff"
          strokeOpacity="0.14"
          strokeWidth="12"
          strokeLinecap="round"
          filter={`url(#${id}-pblur)`}
        />
        <g fill={color}>
          {SPIRAL.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.s} opacity={p.o} />
          ))}
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id={`${id}-a`}>
          <stop offset="0" stopColor={color} stopOpacity="0.9" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-b`}>
          <stop offset="0" stopColor="#4fd8ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#4fd8ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-c`}>
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <rect width="400" height="250" fill="#04050a" />
      <g filter={`url(#${id}-blur)`}>
        <ellipse cx="132" cy="108" rx="126" ry="78" fill={`url(#${id}-a)`} />
        <ellipse cx="296" cy="164" rx="112" ry="66" fill={`url(#${id}-b)`} />
        <ellipse cx="220" cy="72" rx="86" ry="52" fill={`url(#${id}-c)`} />
      </g>
      <g fill="#fff">
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity="0.7" />
        ))}
      </g>
      <circle cx="120" cy="86" r="2.4" fill="#fff" />
      <circle cx="300" cy="96" r="2" fill="#fff" />
    </svg>
  );
}

export default function LabIndexPage() {
  return (
    <main className="lab-index">
      <div className="lab-shell">
        <header>
          <span className="lab-eyebrow">layer07 · lab</span>
          <h1 className="lab-title">
            Heroes en <em>experimento</em>
          </h1>
          <p className="lab-lede">
            Un banco de pruebas para iterar la cabecera del sitio sin tocar el
            sitio. Cada slug es un hero a pantalla completa, con su propio
            canvas, cursor y scroll.
          </p>
          <div className="lab-meta">
            <span>{String(LAB_HEROES.length).padStart(2, "0")} experimentos</span>
            <span>activo en home: {ACTIVE_HERO_SLUG}</span>
            <Link href="/">← volver al sitio</Link>
          </div>
        </header>

        <ul className="lab-grid">
          {LAB_HEROES.map((hero, index) => (
            <li key={hero.slug}>
              <Link href={`/lab/${hero.slug}`} className="lab-card">
                <div className="lab-card-art">
                  <HeroArt hero={hero} />
                </div>
                <span className="lab-card-status">{hero.status}</span>
                <div className="lab-card-body">
                  <span className="lab-card-num">
                    0{index + 1}
                  </span>
                  <h2>{hero.name}</h2>
                  <p>{hero.tagline}</p>
                  <ul className="lab-tags">
                    {hero.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
