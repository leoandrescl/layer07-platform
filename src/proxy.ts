import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/config";

const LEGACY: Record<string, string> = {
  "/portafolio": "/work",
  "/servicios": "/services",
  "/nosotros": "/about",
  "/contacto": "/contact",
};

function resolveLocale(request: NextRequest) {
  const cookie = request.cookies.get("l07-locale")?.value;
  if (cookie && (locales as readonly string[]).includes(cookie)) return cookie;

  const header = request.headers.get("accept-language") ?? "";
  const preferred = header
    .split(",")[0]
    ?.split("-")[0]
    ?.trim()
    .toLowerCase();
  if (preferred && (locales as readonly string[]).includes(preferred)) {
    return preferred;
  }
  return defaultLocale;
}

function hasLocalePrefix(pathname: string) {
  return locales.some(
    (locale) =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = resolveLocale(request);

  if (hasLocalePrefix(pathname)) return NextResponse.next();

  const url = request.nextUrl.clone();

  const legacyTarget =
    LEGACY[pathname] ??
    (pathname.startsWith("/portafolio/")
      ? pathname.replace("/portafolio/", "/work/")
      : undefined);

  if (legacyTarget) {
    url.pathname = `/${locale}${legacyTarget}`;
    return NextResponse.redirect(url, 308);
  }

  // Retired experiments and labs fall back to the studio home.
  if (
    pathname === "/seven" ||
    pathname === "/neo" ||
    pathname === "/labs" ||
    pathname.startsWith("/s/") ||
    pathname === "/particle-genesis" ||
    pathname === "/particles-galaxy"
  ) {
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url, 308);
  }

  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
