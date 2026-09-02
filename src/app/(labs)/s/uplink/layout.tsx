import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#030303",
  colorScheme: "dark",
};

export default function UplinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#020503] font-sans text-[#f4f4f0]">{children}</div>
  );
}
