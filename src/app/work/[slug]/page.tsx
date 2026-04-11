// src/app/work/[slug]/page.tsx
export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  // Aquí es donde en el futuro haremos:
  // const project = await getProjectBySlug(slug);

  return (
    <main className="pt-32 px-8">
      <h1 className="text-6xl font-medium tracking-tighter uppercase">{slug.replace(/-/g, ' ')}</h1>
      <p className="mt-8 text-zinc-500 font-mono italic">Architecture analysis and technical documentation pending CMS synchronization...</p>
    </main>
  );
}
