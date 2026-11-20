import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "FIXORA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #142b4a 0%, #0e1f36 100%)",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#3976c6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              color: "white",
              fontWeight: 700,
            }}
          >
            F
          </div>
          <div style={{ fontSize: 52, fontWeight: 700, color: "white", letterSpacing: -1 }}>
            FIXORA
          </div>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.15,
            maxWidth: 900,
            letterSpacing: -1.5,
          }}
        >
          Perbaikan Rumah Jadi Simpel.
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 30,
            color: "rgba(255,255,255,0.75)",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Tenaga profesional terpercaya untuk perawatan dan perbaikan rumah Anda.
        </div>
        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 24,
            color: "#36a77a",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#36a77a",
            }}
          />
          fixora.id
        </div>
      </div>
    ),
    { ...size },
  );
}
