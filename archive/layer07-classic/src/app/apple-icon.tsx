import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          border: "6px solid #00FF66",
          color: "#00FF66",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, color: "#00F0FF" }}>LAYER</div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 4 }}>07</div>
      </div>
    ),
    size,
  );
}
