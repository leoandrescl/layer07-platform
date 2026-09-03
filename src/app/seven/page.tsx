import type { Metadata } from "next";
import { SevenHero } from "@/components/seven/SevenHero";
import { toProcesses } from "@/components/seven/commands";
import { getProjects } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "the Wired",
  description:
    "Portafolio inmersivo de Leonardo Contreras — Full Stack Engineer, 8+ años. Sistemas a medida, headless e-commerce e integraciones.",
};

export default function SevenPage() {
  return <SevenHero processes={toProcesses(getProjects())} />;
}
