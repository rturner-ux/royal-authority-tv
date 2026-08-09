"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { Map, NavigationControl, type MapRef } from "react-map-gl/maplibre";
import { resolveMapStyle, type MapStyleKey } from "@/lib/mapStyles";
import type { Incident, IncidentCategory } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/labels";
import MapLegend from "./MapLegend";
import IncidentMarkersGL from "./IncidentMarkersGL";
import BoundariesLayerGL, { type BoundaryMode } from "./BoundariesLayerGL";
import AlprCamerasLayerGL from "./AlprCamerasLayerGL";
import AlprDeckLayerGL from "./AlprDeckLayerGL";

const DFW_CENTER = { longitude: -97.05, latitude: 32.85 };

function MapStyleToggle({ mapStyle, onToggle }: { mapStyle: MapStyleKey; onToggle: () => void }) {
  return (
    <div style={{ maxWidth: 260 }}>
      <button
        onClick={onToggle}
        style={{
          background: "#0f172a",
          color: "#fff",
          border: "1px solid rgba(201,162,74,0.5)",
          borderRadius: 8,
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          width: "100%",
        }}
      >
        {mapStyle === "satellite" ? "Switch to Dark Map" : "Switch to Satellite"}
      </button>
    </div>
  );
}

function AlprCamerasToggle({ showAlprCameras, onToggle }: { showAlprCameras: boolean; onToggle: () => void }) {
  return (
    <div style={{ maxWidth: 260 }}>
      <button
        onClick={onToggle}
        style={{
          background: showAlprCameras ? "#0c4a6e" : "#0f172a",
          color: "#fff",
          border: "1px solid rgba(56,189,248,0.5)",
          borderRadius: 8,
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          width: "100%",
        }}
      >
        {showAlprCameras ? "Hide" : "Show"} ALPR Cameras
      </button>
      {showAlprCameras && (
        <div
          style={{
            marginTop: 8,
            background: "rgba(10,12,18,0.92)",
            border: "1px solid rgba(56,189,248,0.3)",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 11,
            lineHeight: 1.5,
            color: "#cbd5e1",
          }}
        >
          Automated license plate reader locations, crowdsourced from{" "}
          <a href="https://deflock.org" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8" }}>
            DeFlock
          </a>{" "}
          / OpenStreetMap. Community-reported, not independently verified.
        </div>
      )}
    </div>
  );
}

function ViewAllCasesButton({ map, incidents }: { map: MapRef; incidents: Incident[] }) {
  if (incidents.length === 0) return null;

  return (
    <button
      onClick={() => {
        const lats = incidents.map((i) => i.lat);
        const lngs = incidents.map((i) => i.lng);
        const bounds: [[number, number], [number, number]] = [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ];
        map.getMap().fitBounds(bounds, { padding: 60, maxZoom: 10 });
      }}
      style={{
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

// Phase 2: incident markers + clustering + Filter Cases panel + View All
// Cases, on top of the Phase 1 base map/style toggle. Boundaries, ALPR,
// sundown towns, and trafficking corridors are added in later phases -- see
// the migration plan for the phase breakdown.
export default function SiteMapGL({ isActive = false }: { isActive?: boolean }) {
  void isActive;
  const [mapStyle, setMapStyle] = useState<MapStyleKey>("satellite");
  const mapRef = useRef<MapRef | null>(null);
  const lastViewState = useRef({ ...DFW_CENTER, zoom: 9, pitch: 0, bearing: 0 });
  const [mapLoaded, setMapLoaded] = useState(false);

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hidden, setHidden] = useState<Set<IncidentCategory>>(
    new Set(Object.keys(CATEGORY_COLORS) as IncidentCategory[])
  );
  const [activeBoundaryModes, setActiveBoundaryModes] = useState<BoundaryMode[]>(["county"]);
  function toggleBoundaryMode(mode: BoundaryMode) {
    setActiveBoundaryModes((prev) => (prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]));
  }
  const [showAlprCameras, setShowAlprCameras] = useState(false);
  const [lightPoints, setLightPoints] = useState<[number, number][]>([]);

  useEffect(() => {
    fetch("/api/incidents", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setIncidents(d.incidents);
      });
  }, []);

  function toggleCategory(category: IncidentCategory) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  const visibleIncidents = incidents.filter((i) => !hidden.has(i.category));

  function switchStyle() {
    const map = mapRef.current?.getMap();
    if (map) {
      lastViewState.current = {
        longitude: map.getCenter().lng,
        latitude: map.getCenter().lat,
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      };
    }
    setMapLoaded(false);
    setMapStyle((v) => (v === "satellite" ? "dark" : "satellite"));
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <style>{`
        @keyframes ra-flash {
          0% { transform: scale(0.6); opacity: 1; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .county-tooltip .maplibregl-popup-content {
          background: rgba(10,12,18,0.92);
          border: 1px solid rgba(56,189,248,0.35);
          color: #e2e8f0;
          font-size: 11px;
          padding: 3px 8px;
          box-shadow: none;
        }
        .county-tooltip .maplibregl-popup-tip {
          display: none;
        }
      `}</style>

      {/* key={mapStyle} forces a clean remount on style switch instead of
          relying on MapLibre's default diffed setStyle() -- switching
          between a raster-only style and a vector style with its own
          sprite/glyph stack silently registered the new vector source but
          never actually requested tiles for it under diffed updates,
          confirmed via a network-request trace. Same forced-remount
          pattern the old Leaflet TileLayer already used via `key`. */}
      <Map
        key={mapStyle}
        ref={mapRef}
        initialViewState={lastViewState.current}
        minZoom={4}
        mapStyle={resolveMapStyle(mapStyle)}
        style={{ width: "100%", height: "100%" }}
        onLoad={() => setMapLoaded(true)}
      >
        <NavigationControl position="top-left" />
        {mapLoaded && mapRef.current && mapStyle === "dark" && (
          <BoundariesLayerGL map={mapRef.current} activeModes={activeBoundaryModes} />
        )}
        {mapLoaded && mapRef.current && <IncidentMarkersGL map={mapRef.current} incidents={visibleIncidents} />}
        {mapLoaded && mapRef.current && showAlprCameras && (
          <AlprCamerasLayerGL
            map={mapRef.current}
            activeBoundaryModes={activeBoundaryModes}
            onToggleBoundaryMode={toggleBoundaryMode}
            onLightPointsChange={setLightPoints}
          />
        )}
        {mapLoaded && showAlprCameras && <AlprDeckLayerGL points={lightPoints} />}
      </Map>

      {/* NavigationControl is top:10, ~87px tall (3 stacked buttons vs
          Leaflet's 2) -- measured empirically via Playwright, not guessed. */}
      <MapLegend hidden={hidden} onToggle={toggleCategory} topOffset={107} />

      <div
        className="hidden sm:flex"
        style={{ position: "absolute", top: 10, right: 10, zIndex: 1000, flexDirection: "column", gap: 8 }}
      >
        {mapLoaded && mapRef.current && <ViewAllCasesButton map={mapRef.current} incidents={visibleIncidents} />}
        <AlprCamerasToggle showAlprCameras={showAlprCameras} onToggle={() => setShowAlprCameras((v) => !v)} />
        <MapStyleToggle mapStyle={mapStyle} onToggle={switchStyle} />
      </div>
    </div>
  );
}
