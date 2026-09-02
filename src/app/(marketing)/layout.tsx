import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppTerminal } from "@/components/layout/WhatsAppTerminal";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="seven-root relative flex min-h-dvh flex-col bg-[#030b0c]">
      <div className="nebula-field" aria-hidden>
        <span className="nebula-blob nebula-a" />
        <span className="nebula-blob nebula-b" />
        <span className="nebula-blob nebula-c" />
        <span className="nebula-blob nebula-d" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-35 mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.28) 2px, rgba(0,0,0,0.28) 3px)",
        }}
        aria-hidden
      />
      <div className="relative z-10 flex min-h-dvh flex-1 flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <WhatsAppTerminal />
    </div>
  );
}
