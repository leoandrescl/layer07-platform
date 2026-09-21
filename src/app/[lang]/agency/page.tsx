import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageIntro } from "@/components/ui/PageIntro";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
    title: dict.agency.title,
    description: dict.agency.intro,
    alternates: { canonical: `/${lang}/agency` },
  };
}

export default async function AgencyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { agency } = dict;

  return (
    <>
      <PageIntro eyebrow={dict.nav.agency} title={agency.title} intro={agency.lead}>
        <p className="mt-8 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-soft">
          {agency.body}
        </p>
      </PageIntro>

      <section className="shell pb-24 md:pb-32">
        <Reveal>
          <SectionHeading title={agency.howTitle} />
        </Reveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {agency.how.map((item, index) => (
            <div
              key={item.title}
              className="bg-bg/70 p-8 backdrop-blur-md md:p-10"
            >
              <span className="font-mono text-xs text-accent">
                0{index + 1}
              </span>
              <h3 className="mt-4 font-display text-[1.6rem] leading-tight tracking-[-0.02em] text-ink">
                {item.title}
              </h3>
              <p className="mt-3 leading-relaxed text-ink-soft">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <Button href={`/${lang}/contact`}>{agency.cta}</Button>
        </div>
      </section>
    </>
  );
}
