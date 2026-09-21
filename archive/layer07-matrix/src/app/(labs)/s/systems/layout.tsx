import type { Viewport } from "next";
import {
  IBM_Plex_Mono,
  Instrument_Serif,
  Space_Grotesk,
} from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sys-sans",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-sys-mono",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-sys-serif",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0c0e10",
  colorScheme: "dark",
};

export default function SystemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${spaceGrotesk.variable} ${plexMono.variable} ${instrumentSerif.variable} sys-root bg-[#0c0e10] text-[#ECECE6]`}
    >
      {children}
    </div>
  );
}