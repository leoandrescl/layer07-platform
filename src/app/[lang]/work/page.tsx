import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/ui/PageIntro";
import { WorkGrid } from "@/components/work/WorkGrid";
import { getProjects } from "@/lib/content/projects";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.work.title,
    description: dict.work.intro,
    alternates: { canonical: `/${lang}/work` },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <PageIntro
        eyebrow={dict.nav.work}
        title={dict.work.title}
        intro={dict.work.intro}
      />
      <section className="shell pb-28 md:pb-36">
        <WorkGrid projects={getProjects()} locale={lang} dict={dict} />
      </section>
    </>
  );
}
