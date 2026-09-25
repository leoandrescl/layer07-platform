import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fraunces, Geist_Mono, Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Cosmos } from "@/components/layout/Cosmos";
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

// The site is dark-only for now (cosmic narrative). The light theme tokens in
// globals.css are reserved for a future light mode; re-enabling it means a
// toggle plus reading `localStorage.getItem('l07-theme')` here again.
const themeScript = `(function(){try{document.documentElement.dataset.theme='dark';}catch(e){}document.documentElement.classList.add('js');try{var c=document.createElement('canvas');var g=c.getContext('webgl2')||c.getContext('webgl');if(!g){document.documentElement.dataset.gpu='none';}else{var d=g.getExtension('WEBGL_debug_renderer_info');var r=String((d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER))||'').toLowerCase();if(/swiftshader|basic render|warp|llvmpipe|software|microsoft basic/.test(r)){document.documentElement.dataset.gpu='software';}}}catch(e){}`;

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
      data-theme="dark"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${geistMono.variable}`}
    >
      <body className="relative min-h-dvh bg-bg text-ink antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll />
        <Cosmos />
        <div className="relative flex min-h-dvh flex-col">
          <Header locale={lang} dict={dict} />
          <main className="flex-1">{children}</main>
          <Footer locale={lang} dict={dict} />
        </div>
      </body>
    </html>
  );
}
