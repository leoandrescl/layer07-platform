import type { ComponentType } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { CoilParticleHero } from "@/components/lab/CoilParticleHero";
import { CoilAutoHero } from "@/components/lab/CoilAutoHero";
import { ExperienceHero } from "@/components/lab/ExperienceHero";
import { MorphosisHero } from "@/components/lab/MorphosisHero";
import { AstraHero } from "@/components/lab/AstraHero";
import { AstraSixHero } from "@/components/lab/AstraSixHero";

export type LabHeroProps = { dict: Dictionary; locale?: string };

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
      "El coil original que fue hero del home: el trazo del 07 no es una línea simple, cada stroke es una hélice que envuelve la línea central. De frente se lee como dos líneas con materia suelta dentro, y se forma desde la galaxia a medida que se scrollea. Movimiento y velocidades reducidas.",
    tags: ["galaxia", "coil", "doble línea", "home"],
    accent: "#ffd7a8",
    preview: "particles",
    status: "candidate",
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
    status: "candidate",
    component: CoilAutoHero,
  },
  {
    slug: "07-experience",
    name: "07 experience (verbos)",
    tagline: "ENTER, EXPLORE, BUILD: el hero como experiencia, no navegación",
    description:
      "Tres verbos cinematográficos sobre el hero. ENTER bucea en dos actos — inmersión suave y aceleración final que se desvanece en el cosmos antes de llevarte al trabajo; EXPLORE dispersa la escena en una nube orbital de capacidades que sigue al cursor, y cada una lleva a trabajo con su filtro activo; BUILD construye el 07 a doble velocidad y arma un panel con el llamado a la acción. Cada botón adelanta su reacción en el hover.",
    tags: ["gsap", "secuencias", "verbos", "cámara"],
    accent: "#c9b8ff",
    preview: "particles",
    status: "active",
    component: ExperienceHero,
  },
  {
    slug: "07-morfosis",
    name: "07 morfosis (figuras)",
    tagline: "La galaxia estalla en cada sección y renace en otra figura",
    description:
      "Un solo field de partículas narra por formas: al llegar a cada sección la escena entera se dispersa en un estallido y las mismas partículas se reensamblan en la siguiente figura — anillo, esfera, doble hélice y el 07 final, donde el giro se detiene. El scroll gradúa cada morph, el cursor dobla la figura formada y sin WebGL queda el fallback estático.",
    tags: ["galaxia", "morph", "scroll", "figuras"],
    accent: "#a8ffd7",
    preview: "particles",
    status: "candidate",
    component: MorphosisHero,
  },
  {
    slug: "07-astra",
    name: "07 astra (estudio)",
    tagline: "Estudio del cosmos de GPT-6 Astra: galaxia, dispersión, estrella y 07",
    description:
      "Réplica del lenguaje visual de la landing de GPT-6 Astra con código y copy propios: cosmos casi monocromático en blancos y ámbar, partículas bokeh desenfocadas conviviendo con estrellas nítidas, galaxia inclinada con núcleo ardiente que se dispersa al llegar a cada sección y se reensambla en un campo estelar, una estrella en cruz y el 07. La cámara participa: cada figura tiene su propio tilt y giro.",
    tags: ["galaxia", "bokeh", "morph", "estudio"],
    accent: "#ffc78a",
    preview: "particles",
    status: "candidate",
    component: AstraHero,
  },
  {
    slug: "astra-g6",
    name: "Astra G6 (secuencia)",
    tagline: "Dispersas → galaxia en 6: la secuencia automática de Astra",
    description:
      "Réplica de la intro de GPT-6 Astra con código propio y sin scroll: un campo estelar con vacío central se ensambla directamente en una galaxia de frente cuyo brazo exterior dominante lee como un 6. Estrellas bien definidas en tonos azul hielo y rojo coral, núcleo que quema y giro eterno al final. Un botón repite la secuencia completa.",
    tags: ["galaxia", "secuencia", "auto", "réplica"],
    accent: "#9fc4ff",
    preview: "particles",
    status: "candidate",
    component: AstraSixHero,
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
export const ACTIVE_HERO_SLUG = process.env.NEXT_PUBLIC_HERO ?? "07-experience";

export function getActiveHero(): LabHero {
  return BY_SLUG.get(ACTIVE_HERO_SLUG) ?? LAB_HEROES[0];
}
