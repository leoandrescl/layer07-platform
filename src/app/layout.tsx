import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { cn } from "@/lib/utils";

import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.layer07.cl"),
  title: "LAYER07 // Headless E-commerce Studio",
  description: "Boutique de ingeniería especializada en transformar diseños editoriales en experiencias Headless de alto rendimiento. LCP < 1s.",
  openGraph: {
    title: "LAYER07 // Headless E-commerce Studio",
    description: "Boutique de ingeniería especializada en transformar diseños editoriales en experiencias Headless de alto rendimiento. LCP < 1s.",
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
    title: "LAYER07 // Headless E-commerce Studio",
    description: "Boutique de ingeniería especializada en transformar diseños editoriales en experiencias Headless de alto rendimiento. LCP < 1s.",
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
        "min-h-screen bg-[#000] font-sans antialiased text-[#EDEDED]"
      )}>
        {/* Sutil textura de grano para look premium */}
        <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {children}
      </body>
    </html>
  );
}
