import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { CapabilitiesContent } from "@/components/sections/CapabilitiesContent";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export const metadata: Metadata = {
  title: "Leonardo Contreras · Perfil profesional // Layer07",
  description:
    "Senior Full Stack Engineer, e-commerce y headless. ANTDIGITAL, stack WordPress/Shopify/Woo/PrestaShop, Next.js, infra AWS y DigitalOcean. Referencias: chanchimercado.cl, basko.cl, bytamarajewels.cl, allisone.cl.",
  openGraph: {
    title: "Leonardo Contreras · Perfil profesional // Layer07",
    description:
      "CV web: resumen, experiencia, stack, educación INACAP y proyectos publicados con URL.",
    url: "https://www.layer07.cl/capacidades",
    locale: "es_CL",
    type: "website",
  },
};

export default function CapacidadesPage() {
  return (
    <>
      <main className="relative z-10 min-h-screen">
        <Navbar />
        <CapabilitiesContent />
      </main>
      <WhatsAppButton />
    </>
  );
}
