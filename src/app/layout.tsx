import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "LAYER07",
  description: "Enterprise Architecture",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth selection:bg-zinc-800 selection:text-white">
      <body className={cn(
        GeistSans.variable, 
        GeistMono.variable, 
        "min-h-screen bg-[#000] font-sans antialiased text-[#EDEDED]"
      )}>
        {/* Sutil textura de grano para look premium */}
        <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {children}
      </body>
    </html>
  );
}
