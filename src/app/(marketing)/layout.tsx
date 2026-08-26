import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppTerminal } from "@/components/layout/WhatsAppTerminal";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-grid relative flex min-h-dvh flex-col">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-scanlines opacity-40"
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
