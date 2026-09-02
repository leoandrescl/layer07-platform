export type LabStatus = "smoke" | "draft" | "live";

export type LabSite = {
  slug: string;
  name: string;
  path: `/${string}`;
  status: LabStatus;
  summary: string;
};

/**
 * Vitrinas aisladas del sitio marketing.
 * Path canónico: /s/[slug]. Los subdominios se mapean después.
 */
export const labs: LabSite[] = [
  {
    slug: "seven",
    name: "SEVEN",
    path: "/s/seven",
    status: "draft",
    summary: "Portafolio inmersivo: lluvia digital, hero cinematográfico, 8+ años.",
  },
  {
    slug: "uplink",
    name: "UPLINK",
    path: "/s/uplink",
    status: "draft",
    summary: "Portafolio personal tipo beacon: scramble, señal SCL y sistemas en vivo.",
  },
  {
    slug: "hola",
    name: "hola",
    path: "/s/hola",
    status: "smoke",
    summary: "Prueba de aislamiento: una palabra, otro layout.",
  },
];

export function getLabs() {
  return labs;
}

export function getLabBySlug(slug: string) {
  return labs.find((lab) => lab.slug === slug) ?? null;
}
