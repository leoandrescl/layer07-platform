import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
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
          background: "#030b0c",
          border: "1px dashed #7FFFD4",
          color: "#7FFFD4",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: -0.5,
        }}
      >
        07
      </div>
    ),
    size,
  );
}
