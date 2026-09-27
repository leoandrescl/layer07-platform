import type { ComponentType } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { CoilParticleHero } from "@/components/lab/CoilParticleHero";
import { CoilAutoHero } from "@/components/lab/CoilAutoHero";

export type LabHeroProps = { dict: Dictionary };

export type LabHeroStatus = "prototype" | "candidate" | "active";
export type LabHeroPreview = "particles";

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
    slug: "07-espiral",
    name: "07 espiral (coil)",
    tagline: "El 07 como espiral: dos líneas que nacen de la galaxia",
    description:
      "Hero oficial del home. El trazo del 07 no es una línea simple: cada stroke es un coil (hélice) que envuelve la línea central. De frente se lee como dos líneas con materia suelta dentro, y se forma desde la galaxia. Movimiento y velocidades reducidas.",
    tags: ["galaxia", "coil", "doble línea", "home"],
    accent: "#ffd7a8",
    preview: "particles",
    status: "active",
    component: CoilParticleHero,
  },
  {
    slug: "07-cinetico",
    name: "07 cinético (auto)",
    tagline: "Un gesto de scroll y la galaxia se escribe sola en 07",
    description:
      "Misma galaxia y mismo coil que el hero del home, pero el scroll no gradúa la formación: la dispara. Un gesto hacia abajo y las partículas salen en tandas ordenadas a lo largo del trazo, destellan en vuelo y se asientan en el 07 con un pequeño rebote; un gesto hacia arriba las devuelve a la galaxia por el mismo camino, desde cualquier posición y sin que el disco gire jamás como un cuerpo rígido.",
    tags: ["galaxia", "coil", "auto-morph", "trigger"],
    accent: "#9fe3ff",
    preview: "particles",
    status: "prototype",
    component: CoilAutoHero,
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
export const ACTIVE_HERO_SLUG = process.env.NEXT_PUBLIC_HERO ?? "07-espiral";

export function getActiveHero(): LabHero {
  return BY_SLUG.get(ACTIVE_HERO_SLUG) ?? LAB_HEROES[0];
}
