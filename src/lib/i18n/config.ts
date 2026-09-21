export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const localeLabels: Record<Locale, string> = {
  es: "ES",
  en: "EN",
};

export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

export const htmlLang: Record<Locale, string> = {
  es: "es-CL",
  en: "en",
};
