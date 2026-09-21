import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { defaultLocale } from "@/lib/i18n/config";

export default function NotFound() {
  const dict = getDictionary(defaultLocale);

  return (
    <section className="shell flex min-h-[70svh] flex-col justify-center py-40">
      <p className="eyebrow">{dict.notFound.eyebrow}</p>
      <h1 className="display-lg mt-6 max-w-3xl text-ink">
        {dict.notFound.title}
      </h1>
      <p className="lede mt-6 max-w-xl">{dict.notFound.body}</p>
      <div className="mt-10">
        <Button href="/">{dict.notFound.cta}</Button>
      </div>
      <Link
        href="/work"
        className="link-line mt-8 w-fit font-mono text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase"
      >
        {dict.nav.work}
      </Link>
    </section>
  );
}
