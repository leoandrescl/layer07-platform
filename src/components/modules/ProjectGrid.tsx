import { ProjectCard } from "./ProjectCard";
import { MOCK_PROJECTS } from "@/lib/mocks";

export const ProjectGrid = () => {
  return (
    <section id="work" className="py-24 px-8 max-w-7xl mx-auto">
      <div className="flex flex-col mb-16">
        <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.4em] mb-4">Selected Works</span>
        <h2 className="text-4xl md:text-5xl font-medium tracking-tighter">Architecture & Engineering</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MOCK_PROJECTS.map((project, index) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            index={index} 
          />
        ))}
      </div>
    </section>
  );
};
