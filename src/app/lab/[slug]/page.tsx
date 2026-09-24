import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLabHero, LAB_HEROES } from "@/lib/lab/heroes";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { defaultLocale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return LAB_HEROES.map((hero) => ({ slug: hero.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hero = getLabHero(slug);
  if (!hero) return {};
  return {
    title: `${hero.name} — lab`,
    description: hero.tagline,
    robots: { index: false, follow: false },
  };
}

export default async function LabHeroPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hero = getLabHero(slug);
  if (!hero) notFound();

  const Hero = hero.component;
  const dict = getDictionary(defaultLocale);

  return (
    <>
      <div className="lab-chrome">
        <Link href="/lab">← lab</Link>
        <span className="lab-chrome-name">{hero.name}</span>
      </div>
      <Hero dict={dict} />
    </>
  );
}
