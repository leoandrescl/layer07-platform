import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fraunces, Geist_Mono, Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { MaterialField } from "@/components/webgl/MaterialField";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale, htmlLang, locales } from "@/lib/i18n/config";
import { SITE } from "@/lib/site";
import "../globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const themeScript = `(function(){try{var k='l07-theme';var t=localStorage.getItem(k);if(t!=='dark'&&t!=='light'){t='light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}document.documentElement.classList.add('js');})();`;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${SITE.name} — ${dict.meta.title}`,
      template: `%s — ${SITE.name}`,
    },
    description: dict.meta.description,
    applicationName: SITE.name,
    authors: [{ name: SITE.founder.name }],
    creator: SITE.founder.name,
    alternates: {
      canonical: `/${lang}`,
      languages: { es: "/es", en: "/en" },
    },
    openGraph: {
      type: "website",
      locale: lang === "es" ? "es_CL" : "en_US",
      url: `${SITE.url}/${lang}`,
      siteName: SITE.name,
      title: `${SITE.name} — ${dict.meta.title}`,
      description: dict.meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE.name} — ${dict.meta.title}`,
      description: dict.meta.description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.phone,
    description: dict.meta.description,
    areaServed: "Worldwide",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Santiago",
      addressCountry: "CL",
    },
    founder: {
      "@type": "Person",
      name: SITE.founder.name,
      jobTitle: "Product Engineer",
    },
    knowsAbout: SITE.founder.stack,
  };

  return (
    <html
      lang={htmlLang[lang]}
      data-theme="light"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${geistMono.variable}`}
    >
      <body className="relative min-h-dvh bg-bg text-ink antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          <SmoothScroll />
          <MaterialField />
          <div className="relative z-10 flex min-h-dvh flex-col">
            <Header locale={lang} dict={dict} />
            <main className="flex-1">{children}</main>
            <Footer locale={lang} dict={dict} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
