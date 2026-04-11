import { Navbar } from "@/components/layout/Navbar";
import { ProjectGrid } from "@/components/sections/ProjectGrid";
import { ProjectHeader } from "@/components/sections/ProjectHeader";
import { TechBoard } from "@/components/modules/TechBoard";
import { BriefingForm } from "@/components/modules/BriefingForm";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { InmersiveHero } from "@/components/sections/InmersiveHero";

export default function Home() {
  return (
    <>
      <main className="relative z-10">
        <Navbar />
        
        {/* Cinematic Canvas Scroll Sequence */}
        <InmersiveHero />

        {/* Work Section */}
        <ProjectHeader />
        <ProjectGrid />
        
        {/* Tech Specifications Section */}
        <TechBoard />
        
        {/* Project Briefing Section */}
        <BriefingForm />
      </main>
      
      <WhatsAppButton />
    </>
  );
}
