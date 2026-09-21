import type { Metadata } from "next";
import { ParticleGenesisExperience } from "@/components/particle-genesis/ParticleGenesisExperience";

export const metadata: Metadata = {
  title: "particle genesis",
  description:
    "Una escena WebGL persistente de partículas: del espacio a la galaxia, a la dispersión y a la forma L07. Scroll como línea de tiempo, cámara que responde a tu cursor.",
};

export default function ParticleGenesisPage() {
  return <ParticleGenesisExperience />;
}