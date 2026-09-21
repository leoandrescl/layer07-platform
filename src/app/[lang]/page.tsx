import { notFound } from "next/navigation";
import { AboutPreview } from "@/components/home/AboutPreview";
import { Agency } from "@/components/home/Agency";
import { Capabilities } from "@/components/home/Capabilities";
import { ContactCta } from "@/components/home/ContactCta";
import { L07ParticleHero } from "@/components/hero/L07ParticleHero";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { WorkPreview } from "@/components/home/WorkPreview";
import { Marquee } from "@/components/ui/Marquee";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale } from "@/lib/i18n/config";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <L07ParticleHero />
      <Marquee items={dict.home.hero.capabilities} />
      <WorkPreview locale={lang} dict={dict} />
      <Capabilities dict={dict} />
      <ServicesPreview locale={lang} dict={dict} />
      <AboutPreview locale={lang} dict={dict} />
      <Agency locale={lang} dict={dict} />
      <ContactCta locale={lang} dict={dict} />
    </>
  );
}
