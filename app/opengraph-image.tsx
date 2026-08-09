import { ImageResponse } from "next/og";
import { getSiteStats } from "@/lib/cases";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

// See case-file/[slug]/opengraph-image.tsx for why explicit cache headers
// matter here (next/og defaults to no-cache otherwise).
const CACHE_HEADERS = {
  "cache-control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
};

export default async function Image() {
  const stats = await getSiteStats().catch(() => ({ totalCases: 0, featuredCases: 0, transcriptRows: 0 }));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #020617 0%, #0b1120 100%)",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 900, color: "#f8fafc", letterSpacing: -1 }}>
            Royal Authority TV
          </div>
          <div style={{ display: "flex", width: 220, height: 6, background: "#dc2626", borderRadius: 3, marginTop: 10 }} />
        </div>

        <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#E8D19A", marginTop: 32 }}>
          Verified Investigative Case Coverage
        </div>

        <div style={{ display: "flex", fontSize: 22, color: "#94a3b8", marginTop: 16, maxWidth: 820, lineHeight: 1.5 }}>
          Documentary-grade case coverage with verified sourcing, claim-type labeling, multi-language transcripts, and a real-time case map.
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 48 }}>
          {[
            `${stats.totalCases.toLocaleString()} Verified Cases`,
            "Real-Time Case Map",
            "Multi-Language Transcripts",
          ].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                background: "rgba(232,209,154,0.1)",
                border: "1px solid rgba(232,209,154,0.35)",
                color: "#E8D19A",
                fontSize: 20,
                fontWeight: 700,
                padding: "10px 20px",
                borderRadius: 100,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, headers: CACHE_HEADERS }
  );
}
