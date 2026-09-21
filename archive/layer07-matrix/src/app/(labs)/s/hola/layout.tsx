import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "hola",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function HolaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-white font-sans text-black">{children}</div>
  );
}
