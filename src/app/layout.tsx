import type { Metadata } from "next";
import { Courier_Prime, Geist, Geist_Mono, Special_Elite } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lainMono = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lain-mono",
});

const lainDisplay = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lain-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.founder.name }],
  creator: SITE.founder.name,
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} · Ingeniería Full Stack`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${lainMono.variable} ${lainDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full font-mono text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
