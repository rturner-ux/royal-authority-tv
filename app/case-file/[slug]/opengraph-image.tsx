import { ImageResponse } from "next/og";
import { getCaseBySlug } from "@/lib/cases";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STATUS_LABELS = { active: "ACTIVE", resolved: "RESOLVED", cleared: "CLEARED" } as const;

// satori (the OG image renderer) can't decode WebP, which is what several
// hotlinked photo sources serve regardless of file extension. Route through
// a free conversion proxy so the share card always gets a decodable format,
// without touching the original image_url used everywhere else on the site.
function toRenderableImage(url: string): string {
  return `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ""))}&output=jpg`;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getCaseBySlug(slug);

  if (!result) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#020617",
            color: "#f8fafc",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Royal Authority TV
        </div>
      ),
      { ...size }
    );
  }

  const { incident } = result;
  const color = CATEGORY_COLORS[incident.category];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #020617 0%, #0b1120 100%)",
          padding: 56,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: 14, height: "100%", background: color }} />

        {incident.image_url && (
          <div
            style={{
              width: 340,
              height: 430,
              borderRadius: 20,
              overflow: "hidden",
              border: `4px solid ${color}`,
              display: "flex",
              flexShrink: 0,
              marginRight: 48,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={toRenderableImage(incident.image_url)}
              alt=""
              width={340}
              height={430}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                background: color,
                color: "#000",
                fontSize: 22,
                fontWeight: 900,
                padding: "8px 20px",
                borderRadius: 100,
                letterSpacing: 1,
              }}
            >
              {CATEGORY_LABELS[incident.category].toUpperCase()}
            </div>
            <div
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.1)",
                color: "#e2e8f0",
                fontSize: 22,
                fontWeight: 700,
                padding: "8px 20px",
                borderRadius: 100,
              }}
            >
              {STATUS_LABELS[incident.status]}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: incident.title.length > 50 ? 48 : 60,
              fontWeight: 900,
              color: "#f8fafc",
              lineHeight: 1.15,
              marginBottom: 20,
              maxWidth: 760,
            }}
          >
            {incident.title}
          </div>

          {incident.location_label && (
            <div style={{ display: "flex", fontSize: 28, color: "#94a3b8", marginBottom: 8 }}>
              📍 {incident.location_label}
            </div>
          )}

          <div style={{ display: "flex", fontSize: 24, color: "#E8D19A", fontWeight: 700, marginTop: 24 }}>
            ROYAL AUTHORITY TV
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
