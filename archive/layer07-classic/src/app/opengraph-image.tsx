import { ImageResponse } from "next/og";

export const alt = "layer07 — Full Stack Engineering";
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
          background: "#050505",
          padding: 64,
          color: "#E2E8F0",
          border: "2px solid #00FF66",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: 6,
            color: "#00FF66",
            textTransform: "uppercase",
          }}
        >
          <span>layer07.cl</span>
          <span style={{ color: "#00F0FF" }}>STATUS // ONLINE</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 72, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.05 }}>
            Full Stack Engineering
          </div>
          <div style={{ fontSize: 36, color: "#00FF66" }}>
            & High-Performance E-commerce
          </div>
          <div style={{ fontSize: 24, color: "#94A3B8", marginTop: 8 }}>
            Sistemas a medida · Headless · Integraciones API
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 20,
            letterSpacing: 3,
            color: "#00F0FF",
            textTransform: "uppercase",
          }}
        >
          Leonardo Contreras · Santiago, Chile
        </div>
      </div>
    ),
    size,
  );
}
