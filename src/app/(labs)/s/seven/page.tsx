import type { Metadata } from "next";
import { SevenHero } from "@/components/seven/SevenHero";

export const metadata: Metadata = {
  title: "SEVEN",
  description:
    "Portafolio inmersivo de Leonardo Contreras — Full Stack Engineer, 8+ años. Sistemas a medida, headless e-commerce e integraciones.",
};

export default function SevenPage() {
  return <SevenHero />;
}
