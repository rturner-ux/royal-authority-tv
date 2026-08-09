"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { Map, Marker, Popup, NavigationControl, type MapRef } from "react-map-gl/maplibre";
import { resolveMapStyle, type MapStyleKey } from "@/lib/mapStyles";
import type { Incident, IncidentCategory, SundownTown } from "@/lib/types";
import { CATEGORY_COLORS, SUNDOWN_CONFIDENCE_COLORS, SUNDOWN_CONFIDENCE_LABELS } from "@/lib/labels";
import MapLegend from "./MapLegend";
import IncidentMarkersGL from "./IncidentMarkersGL";
import BoundariesLayerGL, { type BoundaryMode } from "./BoundariesLayerGL";
import AlprCamerasLayerGL from "./AlprCamerasLayerGL";
import AlprDeckLayerGL from "./AlprDeckLayerGL";
import TraffickingHotspotsLayerGL from "./TraffickingHotspotsLayerGL";

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
    <div style={{ maxWidth: 260 }}>
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

function SundownTownsToggle({ showSundownTowns, onToggle }: { showSundownTowns: boolean; onToggle: () => void }) {
  return (
    <div style={{ maxWidth: 260 }}>
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
          <div style={{ marginBottom: 6 }}>US towns with documented histories of excluding Black residents after dark.</div>
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

function SundownTownMarkers({ towns }: { towns: SundownTown[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = towns.find((t) => t.id === openId);

  return (
    <>
      {towns.map((town) => {
        const color = SUNDOWN_CONFIDENCE_COLORS[town.confidence] || "#EAB308";
        return (
          <Marker
            key={town.id}
            longitude={town.lng}
            latitude={town.lat}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setOpenId(town.id);
            }}
          >
            <div
              style={{ cursor: "pointer" }}
              dangerouslySetInnerHTML={{
                __html: `<div style="width:14px;height:14px;background:${color};transform:rotate(45deg);border:2px solid rgba(255,255,255,0.85);"></div>`,
              }}
            />
          </Marker>
        );
      })}
      {open && (
        <Popup longitude={open.lng} latitude={open.lat} onClose={() => setOpenId(null)} closeButton offset={12}>
          <div style={{ minWidth: 200, fontSize: 13, color: "#0f172a" }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>{open.name}</div>
            <div style={{ color: "#475569", marginBottom: 6 }}>{open.state}</div>
            <div
              style={{
                display: "inline-block",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#fff",
                background: SUNDOWN_CONFIDENCE_COLORS[open.confidence],
                padding: "2px 8px",
                borderRadius: 999,
                marginBottom: 8,
              }}
            >
              {SUNDOWN_CONFIDENCE_LABELS[open.confidence]}
            </div>
            {open.notes && <p style={{ margin: "6px 0", lineHeight: 1.5 }}>{open.notes}</p>}
            {open.source_url && (
              <a href={open.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: 700 }}>
                {open.source_name || "Source"} →
              </a>
            )}
          </div>
        </Popup>
      )}
    </>
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
  const [showHotspots, setShowHotspots] = useState(false);
  const [sundownTowns, setSundownTowns] = useState<SundownTown[]>([]);
  const [showSundownTowns, setShowSundownTowns] = useState(false);
  const [mobileLayersOpen, setMobileLayersOpen] = useState(false);

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
        {mapLoaded && isActive && showHotspots && mapRef.current && <TraffickingHotspotsLayerGL map={mapRef.current} />}
        {mapLoaded && showSundownTowns && <SundownTownMarkers towns={sundownTowns} />}
      </Map>

      {/* NavigationControl is top:10, ~87px tall (3 stacked buttons vs
          Leaflet's 2) -- measured empirically via Playwright, not guessed. */}
      <MapLegend hidden={hidden} onToggle={toggleCategory} topOffset={107} />

      {/* Desktop: always-visible stack. On a narrow phone viewport these
          full-width pills were wide enough to collide with the Filter
          Cases button and cover a large share of the map underneath, so
          below sm they're collapsed behind a single trigger instead --
          same pattern Filter Cases itself already uses for the same
          reason. */}
      <div
        className="hidden sm:flex"
        style={{ position: "absolute", top: 10, right: 10, zIndex: 1000, flexDirection: "column", gap: 8 }}
      >
        {mapLoaded && mapRef.current && <ViewAllCasesButton map={mapRef.current} incidents={visibleIncidents} />}
        <TraffickingHotspotsToggle isActive={isActive} showHotspots={showHotspots} onToggle={() => setShowHotspots((v) => !v)} />
        <SundownTownsToggle showSundownTowns={showSundownTowns} onToggle={() => setShowSundownTowns((v) => !v)} />
        <AlprCamerasToggle showAlprCameras={showAlprCameras} onToggle={() => setShowAlprCameras((v) => !v)} />
        <MapStyleToggle mapStyle={mapStyle} onToggle={switchStyle} />
      </div>

      <div className="sm:hidden" style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}>
        <button
          onClick={() => setMobileLayersOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f172a]/95 px-3 py-2 text-xs font-black uppercase tracking-[0.15em] text-[#E8D19A] backdrop-blur-sm"
        >
          Map Layers {mobileLayersOpen ? "▾" : "▸"}
        </button>
        {mobileLayersOpen && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8, maxWidth: "70vw" }}>
            {mapLoaded && mapRef.current && <ViewAllCasesButton map={mapRef.current} incidents={visibleIncidents} />}
            <TraffickingHotspotsToggle isActive={isActive} showHotspots={showHotspots} onToggle={() => setShowHotspots((v) => !v)} />
            <SundownTownsToggle showSundownTowns={showSundownTowns} onToggle={() => setShowSundownTowns((v) => !v)} />
            <AlprCamerasToggle showAlprCameras={showAlprCameras} onToggle={() => setShowAlprCameras((v) => !v)} />
            <MapStyleToggle mapStyle={mapStyle} onToggle={switchStyle} />
          </div>
        )}
      </div>
    </div>
  );
}
