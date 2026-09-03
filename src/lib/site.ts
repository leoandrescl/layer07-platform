export const SITE = {
  name: "layer07",
  domain: "layer07.cl",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://layer07.cl",
  tagline: "Full Stack Engineering & High-Performance E-commerce",
  description:
    "Ingeniería de software a medida, headless e-commerce e integraciones API. Next.js, TypeScript y arquitecturas resilientes.",
  locale: "es_CL",
  location: "Santiago, Chile",
  email: "leoandrescl@gmail.com",
  phone: "+56945541859",
  phoneDisplay: "+56 9 4554 1859",
  whatsapp: "56945541859",
  social: {
    github: process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/leoandrescl",
    linkedin:
      process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com/",
  },
  founder: {
    name: "Leonardo Contreras",
    role: "Lead Engineer / Product Engineer",
    years: "8+",
    stack: [
      "Next.js",
      "TypeScript",
      "GraphQL",
      "PHP",
      "SQL",
      "Shopify",
      "WooCommerce",
      "AWS Lightsail",
      "DigitalOcean",
    ],
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/portafolio", label: "Portafolio" },
  { href: "/contacto", label: "Contacto" },
] as const;

/** Firma inmersiva — no es un lab. */
export const WIRED = {
  href: "/seven",
  name: "SEVEN",
  label: "the Wired",
  invite: "enter the Wired",
} as const;

export function whatsappUrl(message?: string) {
  const text =
    message ??
    "Hola layer07 — quiero iniciar una conexión sobre un proyecto de desarrollo.";
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}
