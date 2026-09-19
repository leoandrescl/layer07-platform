import type { Metadata } from "next";
import { ParticlesGalaxyExperience } from "@/components/particles-galaxy/ParticlesGalaxyExperience";

export const metadata: Metadata = {
  title: "particles galaxy",
  description:
    "Escena de partículas GPU construida con la secuencia de Fibonacci: esfera áurea, filotaxis y espiral dorada, con bloom y lens flare anamórfico.",
};

export default function ParticlesGalaxyPage() {
  return <ParticlesGalaxyExperience />;
}
