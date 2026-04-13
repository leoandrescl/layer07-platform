import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { VT323 } from 'next/font/google';
import "./globals.css";
import { cn } from "@/lib/utils";
import { AmbientShader } from "@/components/ui/AmbientShader";

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-vt323',
});

import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.layer07.cl"),
  title: "Layer07 // Senior Headless E-commerce Engineering",
  description: "Senior engineering specializing in Headless Shopify and WordPress integrations with Next.js. High-performance Composable Commerce for global brands. LCP < 0.8s.",
  keywords: [
    "Headless Commerce",
    "Composable Architecture",
    "Next.js 15",
    "Shopify Storefront API",
    "Core Web Vitals Optimization",
    "Senior Web Engineer Chile",
    "Performance Engineering"
  ],
  openGraph: {
    title: "Layer07 // Headless E-commerce at Scale",
    description: "Transforming editorial vision into high-performance commerce. Specializing in Next.js, GraphQL, and Shopify Storefront API.",
    url: "https://www.layer07.cl",
    siteName: "LAYER07",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LAYER07 // Headless Architecture",
      },
    ],
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Layer07 // Headless E-commerce at Scale",
    description: "High-performance Composable Commerce for global brands. Next.js & Shopify Storefront API.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth selection:bg-zinc-800 selection:text-white">
      <body className={cn(
        GeistSans.variable, 
        GeistMono.variable, 
        vt323.variable,
        "min-h-screen bg-transparent font-sans antialiased text-[#EDEDED]"
      )}>
        <AmbientShader />
        
        <div className="relative z-10 bg-transparent">
          {children}
        </div>
      </body>
    </html>
  );
}
