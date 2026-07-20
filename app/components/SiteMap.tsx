"use client";

import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import Link from "next/link";
import type { Incident, IncidentCategory } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";
import { CATEGORY_SHAPES, shapeSvg } from "@/lib/mapShapes";
import MapLegend from "./MapLegend";
import TraffickingHotspotsLayer from "./TraffickingHotspotsLayer";
import { TRAFFICKING_HOTLINE_DATA_YEAR } from "@/lib/traffickingHotspots";

const DFW_CENTER: [number, number] = [32.85, -97.05];

function ViewAllCasesButton({ incidents }: { incidents: Incident[] }) {
  const map = useMap();

  if (incidents.length === 0) return null;

  return (
    <button
      onClick={() => {
        const bounds = L.latLngBounds(incidents.map((i) => [i.lat, i.lng] as [number, number]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 });
      }}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1000,
        background: "#0f172a",
        color: "#E8D19A",
        border: "1px solid rgba(201,162,74,0.4)",
        borderRadius: 8,
        padding: "8px 14px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      View All Cases
    </button>
  );
}

function TraffickingHotspotsToggle({
  isActive,
  showHotspots,
  onToggle,
}: {
  isActive: boolean;
  showHotspots: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ position: "absolute", top: 56, right: 10, zIndex: 1000, maxWidth: 260 }}>
      {isActive ? (
        <button
          onClick={onToggle}
          style={{
            background: showHotspots ? "#7a2323" : "#0f172a",
            color: "#fff",
            border: "1px solid rgba(255,77,61,0.5)",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
          }}
        >
          {showHotspots ? "Hide" : "Show"} Trafficking Hot Spots
        </button>
      ) : (
        <a
          href="/subscribe"
          style={{
            display: "block",
            background: "#0f172a",
            color: "#E8D19A",
            border: "1px solid rgba(201,162,74,0.4)",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 12,
            fontWeight: 600,
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          🔒 Trafficking Hot Spots (Subscribe)
        </a>
      )}
      {showHotspots && isActive && (
        <div
          style={{
            marginTop: 8,
            background: "rgba(10,12,18,0.92)",
            border: "1px solid rgba(255,77,61,0.3)",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 11,
            lineHeight: 1.5,
            color: "#cbd5e1",
          }}
        >
          <strong style={{ color: "#ff8a7a" }}>Not a claim of trafficking activity.</strong> Shading
          reflects {TRAFFICKING_HOTLINE_DATA_YEAR} reported cases per 100,000 residents from the
          National Human Trafficking Hotline, by state. It does not identify any city,
          neighborhood, or individual.
        </div>
      )}
    </div>
  );
}

function markerIcon(incident: Incident): L.DivIcon {
  const color = CATEGORY_COLORS[incident.category] || "#94a3b8";
  const shape = CATEGORY_SHAPES[incident.category] || "circle";
  const opacity = incident.status === "active" ? 1 : 0.5;
  const glyphSize = incident.is_featured ? 26 : 18;
  const size = incident.is_featured ? 40 : 18;

  const ring = incident.is_featured
    ? `<div style="position:absolute;top:50%;left:50%;width:${size}px;height:${size}px;margin-top:-${size / 2}px;margin-left:-${size / 2}px;border-radius:50%;border:3px solid #ef4444;animation:ra-flash 1.1s ease-in-out infinite;"></div>`
    : "";

  const glyph = shapeSvg(shape, color, glyphSize);

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;">
      ${ring}
      <div style="position:absolute;top:50%;left:50%;width:${glyphSize}px;height:${glyphSize}px;margin-top:-${glyphSize / 2}px;margin-left:-${glyphSize / 2}px;opacity:${opacity};filter:drop-shadow(0 0 6px ${color}cc) drop-shadow(0 1px 3px rgba(0,0,0,0.6));">${glyph}</div>
    </div>
  `;

  return L.divIcon({ html, className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

function clusterIcon(cluster: { getChildCount: () => number }): L.DivIcon {
  const count = cluster.getChildCount();
  const size = count >= 20 ? 52 : count >= 8 ? 44 : 36;
  return L.divIcon({
    html: `
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:rgba(15,23,42,0.9);border:2px solid rgba(201,162,74,0.8);box-shadow:0 0 14px rgba(201,162,74,0.5);display:flex;align-items:center;justify-content:center;font:700 ${size >= 44 ? 15 : 13}px system-ui;color:#E8D19A;">
        ${count}
      </div>
    `,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function SiteMap({ isActive = false }: { isActive?: boolean }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hidden, setHidden] = useState<Set<IncidentCategory>>(new Set());
  const [showHotspots, setShowHotspots] = useState(false);

  useEffect(() => {
    fetch("/api/incidents", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setIncidents(d.incidents);
      });
  }, []);

  const toggleCategory = (category: IncidentCategory) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const visibleIncidents = incidents.filter((i) => !hidden.has(i.category));

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <style>{`
        @keyframes ra-flash {
          0% { transform: scale(0.6); opacity: 1; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
      <MapContainer center={DFW_CENTER} zoom={9} minZoom={4} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          attribution="Tiles &copy; Esri. Source: Esri, Maxar, Earthstar Geographics"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <ViewAllCasesButton incidents={visibleIncidents} />
        <MapLegend hidden={hidden} onToggle={toggleCategory} />
        <TraffickingHotspotsToggle
          isActive={isActive}
          showHotspots={showHotspots}
          onToggle={() => setShowHotspots((v) => !v)}
        />
        {isActive && showHotspots && <TraffickingHotspotsLayer />}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={clusterIcon}
          maxClusterRadius={50}
          spiderfyOnMaxZoom
        >
          {visibleIncidents.map((incident) => (
            <Marker key={incident.id} position={[incident.lat, incident.lng]} icon={markerIcon(incident)}>
              <Popup>
                <div style={{ minWidth: 200, fontSize: 13, color: "#0f172a" }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{incident.title}</div>
                  <div style={{ color: "#475569", marginBottom: 6 }}>
                    {CATEGORY_LABELS[incident.category]}
                  </div>
                  {incident.location_label && <div style={{ marginBottom: 6 }}>{incident.location_label}</div>}
                  {incident.slug && (
                    <Link href={`/case-file/${incident.slug}`} style={{ fontWeight: 700, color: "#2563eb" }}>
                      View case file →
                    </Link>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
