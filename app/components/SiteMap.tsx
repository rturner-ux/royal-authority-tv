"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { Incident, IncidentCategory } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";
import MapLegend from "./MapLegend";

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

function markerIcon(incident: Incident): L.DivIcon {
  const color = CATEGORY_COLORS[incident.category] || "#94a3b8";
  const opacity = incident.status === "active" ? 1 : 0.5;
  const ring = incident.is_featured
    ? `<div style="position:absolute;top:50%;left:50%;width:34px;height:34px;margin-top:-17px;margin-left:-17px;border-radius:50%;border:3px solid #ef4444;animation:ra-flash 1.1s ease-in-out infinite;"></div>`
    : "";

  const html = `
    <div style="position:relative;width:${incident.is_featured ? 40 : 18}px;height:${incident.is_featured ? 40 : 18}px;">
      ${ring}
      <div style="position:absolute;top:50%;left:50%;width:18px;height:18px;margin-top:-9px;margin-left:-9px;border-radius:50%;background:${color};opacity:${opacity};border:2px solid rgba(255,255,255,0.85);"></div>
    </div>
  `;

  const size = incident.is_featured ? 40 : 18;
  return L.divIcon({ html, className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

export default function SiteMap() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hidden, setHidden] = useState<Set<IncidentCategory>>(new Set());

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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ViewAllCasesButton incidents={visibleIncidents} />
        <MapLegend hidden={hidden} onToggle={toggleCategory} />
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
      </MapContainer>
    </div>
  );
}
