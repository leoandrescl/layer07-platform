"use client";

import dynamic from "next/dynamic";

const ParticlesGalaxyCanvas = dynamic(() => import("./ParticlesGalaxyCanvas"), {
  ssr: false,
});

/**
 * Full-screen, chrome-free experience: a single galaxy flowing inward forever.
 * No copy, no scroll, no UI — just the field and drag-to-rotate.
 */
export function ParticlesGalaxyExperience() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <ParticlesGalaxyCanvas />
    </div>
  );
}
