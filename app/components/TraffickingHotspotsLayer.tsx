"use client";

import { Polyline, Popup } from "react-leaflet";
import { TRAFFICKING_CORRIDORS } from "@/lib/traffickingCorridors";

export default function TraffickingHotspotsLayer() {
  return (
    <>
      {TRAFFICKING_CORRIDORS.map((corridor) => (
        <Polyline
          key={corridor.name}
          positions={corridor.waypoints}
          pathOptions={{ color: "#ff4d3d", weight: 4, opacity: 0.75 }}
        >
          <Popup>
            <div style={{ minWidth: 220, fontSize: 13, color: "#0f172a" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{corridor.name} Corridor</div>
              <p style={{ margin: "0 0 8px", lineHeight: 1.5, color: "#334155" }}>{corridor.description}</p>
              <a
                href={corridor.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#2563eb", fontWeight: 700 }}
              >
                {corridor.sourceName} →
              </a>
            </div>
          </Popup>
        </Polyline>
      ))}
    </>
  );
}
