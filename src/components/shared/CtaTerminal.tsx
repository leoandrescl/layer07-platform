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
    <section className="border-y border-dashed border-[#00ff66]/25 bg-black/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.28em] text-[#00f0ff] uppercase">
            handshake
          </p>
          <h2 className="font-sans mt-3 text-xl font-normal tracking-[0.06em] text-[#e8fff8] lowercase sm:text-2xl">
            {title}
          </h2>
          <p className="mt-3 font-mono text-sm text-[#8fb8b0]">
            <span className="text-[#00ff66]">guest@layer07</span>
            <span className="text-[#00f0ff]">:~$</span> {command}
          </p>
        </div>
        <NeonButton href={href}>{cta}</NeonButton>
      </div>
    </section>
  );
}
