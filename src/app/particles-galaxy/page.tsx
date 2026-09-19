import type { Metadata } from "next";
import { ParticlesGalaxyExperience } from "@/components/particles-galaxy/ParticlesGalaxyExperience";

export const metadata: Metadata = {
  title: "particles galaxy",
  description:
    "Escena de partículas GPU: una galaxia espiral en flujo continuo hacia el núcleo, con bloom y lens flare anamórfico.",
};

export default function ParticlesGalaxyPage() {
  return <ParticlesGalaxyExperience />;
}
