import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function SevenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="seven-root min-h-dvh bg-[#050505] font-sans text-white [@media(pointer:fine)]:cursor-none [&_input]:cursor-text">
      {children}
    </div>
  );
}
