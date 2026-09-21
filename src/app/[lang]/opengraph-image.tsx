import { ImageResponse } from "next/og";
import { locales } from "@/lib/i18n/config";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const alt = "layer07 — Digital product studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f3f0ea",
          padding: 72,
          color: "#0d0d0f",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#6e6e76",
          }}
        >
          <span>layer07</span>
          <span>Santiago, Chile</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.02,
              letterSpacing: -3,
              maxWidth: 900,
            }}
          >
            Digital product studio
          </div>
          <div style={{ fontSize: 34, color: "#1b2cff", letterSpacing: -1 }}>
            Websites · E-commerce · Apps · Systems · WebGL
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#6e6e76",
          }}
        >
          <span>{SITE.email}</span>
          <span>{SITE.domain}</span>
        </div>
      </div>
    ),
    size,
  );
}
