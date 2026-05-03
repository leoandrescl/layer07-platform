"use client";
import { Navbar } from "@/components/layout/Navbar";
import { ProjectGrid } from "@/components/sections/ProjectGrid";
import { Services } from "@/components/sections/Services";
import { BriefingForm } from "@/components/modules/BriefingForm";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { InmersiveHero } from "@/components/sections/InmersiveHero";
import { HomeProfileStrip } from "@/components/sections/HomeProfileStrip";

export default function Home() {
  return (
    <>
      <main className="relative z-10">
        <Navbar />
        
        {/* Cinematic Canvas Scroll Sequence */}
        <InmersiveHero />

        <HomeProfileStrip />

        {/* Work Section - Solutions lead directly */}
        <ProjectGrid />

        {/* Tech Specifications Section */}
        <Services />
        
        {/* Project Briefing Section */}
        <BriefingForm />
      </main>
      
      <WhatsAppButton />
    </>
  );
}
