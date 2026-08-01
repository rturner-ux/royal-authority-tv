"use client";

import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import Link from "next/link";
import type { Incident, IncidentCategory, SundownTown } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS, SUNDOWN_CONFIDENCE_COLORS, SUNDOWN_CONFIDENCE_LABELS } from "@/lib/labels";
import { CATEGORY_SHAPES, shapeSvg } from "@/lib/mapShapes";
import MapLegend from "./MapLegend";
import TraffickingHotspotsLayer from "./TraffickingHotspotsLayer";

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
          {showHotspots ? "Hide" : "Show"} Trafficking Corridors
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
          🔒 Trafficking Corridors (Subscribe)
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
          <strong style={{ color: "#ff8a7a" }}>Not a claim of activity at any specific point.</strong>{" "}
          Highlighted routes are interstate highways publicly identified by federal data and
          multiple independent news reports as documented human trafficking corridors. It does
          not identify any specific city, neighborhood, business, or individual along the route.
        </div>
      )}
      {showHotspots && isActive && (
        <div
          style={{
            marginTop: 8,
            background: "rgba(122,35,35,0.25)",
            border: "1px solid rgba(255,77,61,0.4)",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 11,
            lineHeight: 1.6,
            color: "#f1f5f9",
          }}
        >
          <div style={{ fontWeight: 700, color: "#ff8a7a", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.05 }}>
            If You Suspect Trafficking
          </div>
          <p style={{ margin: "0 0 6px" }}>
            Common warning signs: someone who seems fearful, coached, or unable to speak for
            themselves; who doesn't control their own ID or travel documents; who shows signs of
            malnourishment or fatigue; or who can't say where they are or where they're headed.
          </p>
          <p style={{ margin: "0 0 6px" }}>
            Don't approach directly, it can endanger the victim and you. Note details safely if you
            can (location, vehicle, description) and report them.
          </p>
          <div style={{ fontWeight: 700 }}>
            Call{" "}
            <a href="tel:18883737888" style={{ color: "#ff8a7a" }}>
              1-888-373-7888
            </a>{" "}
            or text{" "}
            <a href="sms:233733" style={{ color: "#ff8a7a" }}>
              233733
            </a>{" "}
            (National Human Trafficking Hotline). Call 911 for immediate danger.
          </div>
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

function sundownTownIcon(town: SundownTown): L.DivIcon {
  const color = SUNDOWN_CONFIDENCE_COLORS[town.confidence] || "#EAB308";
  const html = `
    <div style="position:relative;width:14px;height:14px;">
      <div style="width:14px;height:14px;background:${color};transform:rotate(45deg);border:2px solid rgba(255,255,255,0.85);position:absolute;top:0;left:0;"></div>
    </div>
  `;
  return L.divIcon({ html, className: "", iconSize: [14, 14], iconAnchor: [7, 7] });
}

function SundownTownsToggle({
  showSundownTowns,
  onToggle,
}: {
  showSundownTowns: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ position: "absolute", top: 102, right: 10, zIndex: 1000, maxWidth: 260 }}>
      <button
        onClick={onToggle}
        style={{
          background: showSundownTowns ? "#7C2D12" : "#0f172a",
          color: "#fff",
          border: "1px solid rgba(234,88,12,0.5)",
          borderRadius: 8,
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          width: "100%",
        }}
      >
        {showSundownTowns ? "Hide" : "Show"} Sundown Towns
      </button>
      {showSundownTowns && (
        <div
          style={{
            marginTop: 8,
            background: "rgba(10,12,18,0.92)",
            border: "1px solid rgba(234,88,12,0.3)",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 11,
            lineHeight: 1.5,
            color: "#cbd5e1",
          }}
        >
          <div style={{ marginBottom: 6 }}>
            US towns with documented histories of excluding Black residents after dark.
          </div>
          {(["confirmed", "probable", "unconfirmed"] as const).map((c) => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  background: SUNDOWN_CONFIDENCE_COLORS[c],
                  transform: "rotate(45deg)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span>{SUNDOWN_CONFIDENCE_LABELS[c]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
  const [hidden, setHidden] = useState<Set<IncidentCategory>>(
    new Set(Object.keys(CATEGORY_COLORS) as IncidentCategory[])
  );
  const [showHotspots, setShowHotspots] = useState(false);
  const [sundownTowns, setSundownTowns] = useState<SundownTown[]>([]);
  const [showSundownTowns, setShowSundownTowns] = useState(false);

  useEffect(() => {
    fetch("/api/incidents", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setIncidents(d.incidents);
      });
  }, []);

  useEffect(() => {
    fetch("https://map.royalauthorityofficial.com/api/sundown-towns", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSundownTowns(d.towns);
      })
      .catch(() => {
        // Historical overlay is non-critical; fail silently.
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
        <SundownTownsToggle
          showSundownTowns={showSundownTowns}
          onToggle={() => setShowSundownTowns((v) => !v)}
        />
        {showSundownTowns &&
          sundownTowns.map((town) => (
            <Marker key={town.id} position={[town.lat, town.lng]} icon={sundownTownIcon(town)}>
              <Popup>
                <div style={{ minWidth: 200, fontSize: 13, color: "#0f172a" }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>{town.name}</div>
                  <div style={{ color: "#475569", marginBottom: 6 }}>{town.state}</div>
                  <div
                    style={{
                      display: "inline-block",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "#fff",
                      background: SUNDOWN_CONFIDENCE_COLORS[town.confidence],
                      padding: "2px 8px",
                      borderRadius: 999,
                      marginBottom: 8,
                    }}
                  >
                    {SUNDOWN_CONFIDENCE_LABELS[town.confidence]}
                  </div>
                  {town.notes && <p style={{ margin: "6px 0", lineHeight: 1.5 }}>{town.notes}</p>}
                  {town.source_url && (
                    <a href={town.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: 700 }}>
                      {town.source_name || "Source"} →
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
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
