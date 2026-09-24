import type { ComponentType } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { L07ParticleHero } from "@/components/hero/L07ParticleHero";
import { NebulaHero } from "@/components/lab/NebulaHero";
import { ConstellationHero } from "@/components/lab/ConstellationHero";
import { CoilParticleHero } from "@/components/lab/CoilParticleHero";

export type LabHeroProps = { dict: Dictionary };

export type LabHeroStatus = "prototype" | "candidate" | "active";
export type LabHeroPreview = "nebula" | "constellation" | "particles";

export type LabHero = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  /** card accent, used by the index artwork */
  accent: string;
  preview: LabHeroPreview;
  status: LabHeroStatus;
  component: ComponentType<LabHeroProps>;
};

export const LAB_HEROES: LabHero[] = [
  {
    slug: "nebulosa-volumetrica",
    name: "Nebulosa volumétrica",
    tagline: "Polvo 3D, god-rays y el 07 que se condensa",
    description:
      "Un volumen real de polvo interestelar con estrellas embebidas que emiten haces de luz. El cursor abre un vórtice y arrastra su luz; al hacer scroll, la materia se canaliza y llena el 07 con filamentos, núcleo y pulsos.",
    tags: ["volumen", "god-rays", "curl", "scroll-morph"],
    accent: "#9a7bff",
    preview: "nebula",
    status: "candidate",
    component: NebulaHero,
  },
  {
    slug: "constelacion-07",
    name: "Constelación 07",
    tagline: "Estrellas en los nudos, líneas que se trazan",
    description:
      "El 07 como constelación: estrellas brillantes en vértices y uniones sobre un campo vivo. El cursor atrae estrellas y enciende sus conexiones; el scroll resuelve el campo y dibuja las líneas hasta cerrar la figura.",
    tags: ["starfield", "líneas", "parallax", "liviano"],
    accent: "#bcd8ff",
    preview: "constellation",
    status: "prototype",
    component: ConstellationHero,
  },
  {
    slug: "l07-particle",
    name: "L07 en partículas",
    tagline: "El hero actual del sitio, como punto de comparación",
    description:
      "Partículas que nacen en una galaxia espiral y se asientan sobre el monograma L07, con starfield denso, bloom y streak anamórfico. Es la referencia contra la que se comparan los experimentos.",
    tags: ["galaxia", "partículas", "referencia"],
    accent: "#9fe3ff",
    preview: "particles",
    status: "active",
    component: L07ParticleHero,
  },
  {
    slug: "07-espiral",
    name: "07 espiral (coil)",
    tagline: "El 07 como espiral: dos líneas que nacen de la galaxia",
    description:
      "Copia del hero actual, pero el trazo del 07 ya no es una línea simple: cada stroke es un coil (hélice) que envuelve la línea central. De frente se lee como dos líneas con materia suelta dentro, y se forma desde la galaxia igual que el marca actual. Núcleo luminoso dentro del 0.",
    tags: ["galaxia", "coil", "doble línea", "núcleo"],
    accent: "#ffd7a8",
    preview: "particles",
    status: "prototype",
    component: CoilParticleHero,
  },
];

const BY_SLUG = new Map(LAB_HEROES.map((hero) => [hero.slug, hero]));

export function getLabHero(slug: string): LabHero | undefined {
  return BY_SLUG.get(slug);
}

export function isLabHeroSlug(slug: string): boolean {
  return BY_SLUG.has(slug);
}

/**
 * The hero the official home renders. Swap it in one line here, or set
 * `NEXT_PUBLIC_HERO` in the environment (no deploy of code needed).
 */
export const ACTIVE_HERO_SLUG = process.env.NEXT_PUBLIC_HERO ?? "l07-particle";

export function getActiveHero(): LabHero {
  return (
    BY_SLUG.get(ACTIVE_HERO_SLUG) ??
    BY_SLUG.get("l07-particle") ??
    LAB_HEROES[0]
  );
}
