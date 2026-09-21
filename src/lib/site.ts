import type { Locale } from "@/lib/i18n/config";

export const SITE = {
  name: "layer07",
  domain: "layer07.cl",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://layer07.cl",
  locale: "es_CL",
  location: "Santiago, Chile",
  email: "leoandrescl@gmail.com",
  phone: "+56945541859",
  phoneDisplay: "+56 9 4554 1859",
  whatsapp: "56945541859",
  social: {
    github:
      process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/leoandrescl",
    linkedin:
      process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com/",
  },
  founder: {
    name: "Leonardo Contreras",
    years: "8+",
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "PHP",
      "WordPress",
      "WooCommerce",
      "Shopify",
      "APIs",
      "PostgreSQL",
      "AWS",
    ],
  },
} as const;

export type NavKey = "work" | "services" | "about" | "agency" | "contact";

export const NAV: { key: NavKey; path: string }[] = [
  { key: "work", path: "/work" },
  { key: "services", path: "/services" },
  { key: "about", path: "/about" },
  { key: "agency", path: "/agency" },
  { key: "contact", path: "/contact" },
];

export function localizedHref(locale: Locale, path: string) {
  const clean = path === "/" ? "" : path;
  return `/${locale}${clean}`;
}

export function whatsappUrl(message?: string) {
  const text =
    message ??
    "Hola layer07 — quiero conversar sobre un proyecto de producto digital.";
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}
