import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d0f",
          color: "#f3f0ea",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        07
        <span style={{ color: "#7a88ff" }}>.</span>
      </div>
    ),
    size,
  );
}
