import { Navbar } from "@/components/layout/Navbar";
import { ProjectGrid } from "@/components/sections/ProjectGrid";
import { TechBoard } from "@/components/modules/TechBoard";
import { BriefingForm } from "@/components/modules/BriefingForm";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export default function Home() {
  return (
    <>
      <main className="relative z-10">
        <Navbar />
        
        {/* Hero Section */}
        <section className="flex min-h-screen flex-col items-center justify-center pt-20 relative pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/40 via-transparent to-transparent opacity-60 z-[-1]"></div>
          <div className="text-center pointer-events-auto">
            <h1 className="text-[12vw] font-medium tracking-tighter leading-[0.8] mb-8">
              LAYER<span className="text-zinc-800 italic">07</span>
            </h1>
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.3em]">
              Headless Architecture • Performance First
            </p>
          </div>
        </section>

        {/* Work Section */}
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
