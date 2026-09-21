import type { Metadata } from "next";
import { SystemsExperience } from "@/components/systems/SystemsExperience";

export const metadata: Metadata = {
  title: "SYSTEMS",
  description:
    "Una experiencia: una palabra en la oscuridad, y tú eres la única luz. Muévete para ver; enciende para recordar.",
};

export default function SystemsPage() {
  return <SystemsExperience />;
}