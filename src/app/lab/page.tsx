import Link from "next/link";
import { ACTIVE_HERO_SLUG, LAB_HEROES, type LabHero } from "@/lib/lab/heroes";

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
