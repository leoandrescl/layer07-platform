import { describe, expect, it } from "vitest";
import { defaultLocale, hasLocale, locales } from "@/lib/i18n/config";

describe("i18n config", () => {
  it("accepts the supported locales", () => {
    expect(hasLocale("es")).toBe(true);
    expect(hasLocale("en")).toBe(true);
  });

  it("rejects unknown locales", () => {
    expect(hasLocale("fr")).toBe(false);
    expect(hasLocale("")).toBe(false);
  });

  it("keeps the default locale in the list", () => {
    expect(locales).toContain(defaultLocale);
  });
});
