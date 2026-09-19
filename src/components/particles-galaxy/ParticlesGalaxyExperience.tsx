"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const ParticlesGalaxyCanvas = dynamic(() => import("./ParticlesGalaxyCanvas"), {
  ssr: false,
});

const GOLDEN = "1.6180339887";

interface Chapter {
  index: string;
  title: string;
  body: string;
  align: "left" | "right";
}

const CHAPTERS: Chapter[] = [
  {
    index: "01",
    title: "esfera de fibonacci",
    body: "Miles de puntos repartidos sobre una esfera con el ángulo áureo (137,507°). Sin retículas ni grumos: cada partícula queda a la misma distancia de sus vecinas, una y otra vez, hasta cerrar la esfera completa.",
    align: "left",
  },
  {
    index: "02",
    title: "filotaxis",
    body: "El patrón de las semillas del girasol. El mismo ángulo áureo acomoda cada punto en el disco sin superponerse y hace emerger las espirales de Fibonacci que aparecen cuando lo miras de cerca.",
    align: "right",
  },
  {
    index: "03",
    title: "espiral dorada",
    body: "Una coil logarítmica donde el radio crece en proporción áurea mientras el ángulo avanza. La curva del nautilus, traducida a volumen y a diez mil partículas que se encienden al pasar.",
    align: "left",
  },
];

export function ParticlesGalaxyExperience() {
  return (
    <div className="pgx-root relative select-none">
      <ParticlesGalaxyCanvas />

      {/* fixed HUD chrome */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 font-mono text-[10px] tracking-[0.32em] text-[#8fb8b0]/80 sm:px-8">
        <span className="text-[#7fffd4]">φ</span>
        <span className="hidden sm:inline">{GOLDEN}</span>
        <span>/particles-galaxy</span>
      </div>

      <div className="relative z-10">
        {/* hero */}
        <section className="relative flex min-h-svh flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-[11px] tracking-[0.34em] text-[#00f0ff]">
            layer07 · experimento
          </p>
          <h1 className="pgx-glow mt-6 font-sans text-5xl lowercase tracking-[0.06em] text-[#e8fff8] sm:text-7xl">
            secuencia áurea
          </h1>
          <p className="mt-7 max-w-xl font-mono text-sm leading-relaxed text-[#8fb8b0]">
            Tres formas construidas con el mismo número irracional. Partículas
            nítidas, con color y tamaño propios, que mutan mientras el scroll
            avanza.
          </p>

          <div className="pointer-events-none absolute inset-x-0 bottom-[14vh] flex flex-col items-center gap-3">
            <span className="pgx-pulse size-1.5 rounded-full bg-[#7fffd4]" aria-hidden />
            <p className="font-mono text-[10px] tracking-[0.28em] text-[#8fb8b0]">
              arrastrar para rotar · scroll para mutar
            </p>
          </div>
        </section>

        {/* chapters: each screen nudges the particle field into a new formation */}
        {CHAPTERS.map((chapter) => (
          <section
            key={chapter.index}
            className={`flex min-h-screen items-center px-6 sm:px-10 ${
              chapter.align === "right" ? "justify-end" : "justify-start"
            }`}
          >
            <article className="pgx-panel w-full max-w-md px-6 py-7 sm:px-8 sm:py-9">
              <p className="font-mono text-[11px] tracking-[0.3em] text-[#00f0ff]">
                {chapter.index} / 03
              </p>
              <h2 className="pgx-glow mt-4 font-sans text-2xl lowercase tracking-[0.05em] text-[#e8fff8] sm:text-3xl">
                {chapter.title}
              </h2>
              <p className="mt-5 font-mono text-sm leading-relaxed text-[#8fb8b0]">
                {chapter.body}
              </p>
            </article>
          </section>
        ))}

        {/* outro */}
        <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-[11px] tracking-[0.3em] text-[#7fffd4]">
            φ = {GOLDEN}
          </p>
          <h2 className="pgx-glow mt-5 max-w-2xl font-sans text-3xl lowercase tracking-[0.05em] text-[#e8fff8] sm:text-5xl">
            un solo número, tres formas
          </h2>
          <p className="mt-6 max-w-lg font-mono text-sm leading-relaxed text-[#8fb8b0]">
            Construido desde cero con three.js y postprocessing: partículas GPU,
            bloom, lens flare anamórfico y tone mapping ACES.
          </p>

          <nav className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 font-mono text-[11px] tracking-[0.2em] text-[#8fb8b0]">
            <Link href="/labs" className="transition-colors hover:text-[#e8fff8]">
              LABS
            </Link>
            <Link href="/" className="transition-colors hover:text-[#e8fff8]">
              LAYER07
            </Link>
            <Link
              href="/particle-genesis"
              className="transition-colors hover:text-[#e8fff8]"
            >
              PARTICLE-GENESIS
            </Link>
          </nav>
        </section>
      </div>
    </div>
  );
}
