import type { Locale } from "./config";
import { es, type Dictionary } from "./es";
import { en } from "./en";

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
