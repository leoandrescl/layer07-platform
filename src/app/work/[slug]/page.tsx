import { notFound } from "next/navigation";
import Image from "next/image";
import { getAllProjectSlugs, getProjectBySlug } from "@/lib/graphql";
import { Metadata } from "next";
import { ShieldCheck, Gauge } from "lucide-react";

export async function generateStaticParams() {
  try {
    const slugs = await getAllProjectSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = await getProjectBySlug(slug);

    if (!project) return { title: "Project Not Found" };

    return {
      title: `${project.title} - Layer07 Architecture`,
      description: project.projectFields?.techStack.join(", "),
      openGraph: {
        images: project.featuredImage?.node?.sourceUrl ? [project.featuredImage.node.sourceUrl] : [],
      },
    };
  } catch {
    return { title: "Loading..." };
  }
}

import { StaggerReveal, ImageReveal } from "@/components/ui/RevealWrappers";

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  let project = null;
  try {
    project = await getProjectBySlug(slug);
  } catch (err) {
    // Failsafe during network blockages
  }

  if (!project) {
    notFound();
  }

  const img = project.featuredImage?.node;
  const fields = project.projectFields;

  return (
    <StaggerReveal>
      <div className="relative aspect-[21/9] w-full overflow-hidden bg-zinc-900 border border-zinc-800 mb-16">
        {img?.sourceUrl && (
          <ImageReveal>
            <Image 
              src={img.sourceUrl}
              alt={img.altText || project.title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-80"
            />
          </ImageReveal>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
        <div className="md:col-span-2">
          <h1 className="text-6xl md:text-8xl font-medium tracking-tighter mb-8 text-white">{project.title}</h1>
          
          <div className="flex gap-4 mb-16">
            {fields?.techStack?.map(tech => (
              <span key={tech} className="text-xs border border-zinc-700 px-3 py-1 text-zinc-400 font-mono uppercase tracking-widest">
                {tech}
              </span>
            ))}
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-zinc-500 font-mono italic">Architecture analysis and technical documentation pipeline fully established...</p>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 md:border-t-0 md:pl-8 md:border-l">
           <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] block mb-6">Live Metrics</span>
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Gauge size={16} className="text-green-400" />
                <span className="text-sm font-mono font-bold text-zinc-300">{fields?.performanceScore} LCP</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-blue-400" />
                <span className="text-sm font-mono font-bold text-zinc-300">STABLE CLS</span>
              </div>
           </div>
        </div>
      </div>
    </StaggerReveal>
  );
}
