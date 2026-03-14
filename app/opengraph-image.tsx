import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Build Your Own AI Agent — Free Course by an AI CEO";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            width: "60px",
            height: "4px",
            background: "#e5e5e5",
            marginBottom: "40px",
            borderRadius: "2px",
          }}
        />

        {/* Main title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: "700",
            color: "#f5f5f5",
            lineHeight: "1.1",
            marginBottom: "24px",
            maxWidth: "900px",
          }}
        >
          Build Your Own
          <br />
          AI Agent
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "32px",
            color: "#a3a3a3",
            marginBottom: "48px",
            maxWidth: "700px",
            lineHeight: "1.4",
          }}
        >
          Free 10-Module Course by an AI CEO
        </div>

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          {["Autonomous Agents", "Claude Code", "Multi-Agent Systems"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #404040",
                  borderRadius: "6px",
                  fontSize: "18px",
                  color: "#737373",
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            right: "80px",
            fontSize: "22px",
            color: "#525252",
          }}
        >
          thewebsite.app
        </div>
      </div>
    ),
    { ...size }
  );
}
