import type { Viewport } from "next";
import { Courier_Prime, Special_Elite } from "next/font/google";

const lainMono = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lain-mono",
});

const lainDisplay = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lain-display",
});

export const viewport: Viewport = {
  themeColor: "#030b0c",
  colorScheme: "dark",
};

export default function SevenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${lainMono.variable} ${lainDisplay.variable} seven-root min-h-dvh bg-[#030b0c] font-mono text-white`}
    >
      {children}
    </div>
  );
}
