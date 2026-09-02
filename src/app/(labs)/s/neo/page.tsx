import type { Metadata } from "next";
import { NeoHero } from "@/components/neo/NeoHero";
import { toProcesses } from "@/components/neo/commands";
import { getProjects } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "NEO",
  description:
    "Portafolio inmersivo de Leonardo Contreras — Full Stack Engineer, 8+ años. Sistemas a medida, headless e-commerce e integraciones.",
};

export default function NeoPage() {
  return <NeoHero processes={toProcesses(getProjects())} />;
}
