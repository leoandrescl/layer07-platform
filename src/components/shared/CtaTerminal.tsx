import { NeonButton } from "@/components/ui/NeonButton";

type CtaTerminalProps = {
  title?: string;
  command?: string;
  href?: string;
  cta?: string;
};

export function CtaTerminal({
  title = "Establecer canal de trabajo",
  command = "connect --to /contacto",
  href = "/contacto",
  cta = "Abrir canal",
}: CtaTerminalProps) {
  return (
    <section className="border-y border-border bg-surface/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.28em] text-cyan uppercase">
            CTA // TERMINAL
          </p>
          <h2 className="mt-3 text-xl text-foreground sm:text-2xl">{title}</h2>
          <p className="mt-3 font-mono text-sm text-muted-dim">
            <span className="text-neon">root@layer07</span>
            <span className="text-cyan">:~$</span> {command}
          </p>
        </div>
        <NeonButton href={href}>{cta}</NeonButton>
      </div>
    </section>
  );
}
