"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import AlprDeckLayer from "./AlprDeckLayer";
import AlprRoutePlanner from "./AlprRoutePlanner";

type AlprCamera = {
  id: number;
  lat: number;
  lng: number;
  manufacturer: string | null;
  direction: string | null;
  operator: string | null;
  zone: string | null;
};

// [lat, lng] tuples, matching the API's compact response shape.
type LightPoint = [number, number];

const CAMERA_ICON = L.divIcon({
  html: `<div style="width:12px;height:12px;background:#38bdf8;border:2px solid rgba(255,255,255,0.85);border-radius:3px;box-shadow:0 0 6px rgba(56,189,248,0.8);"></div>`,
  className: "",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// At or above this zoom, the API returns individually-poppable raw camera
// points with full detail. Below it, it returns every camera's bare
// coordinates, rendered as small fixed-size dots -- a real point cloud
// (like DeFlock's own map) instead of synthetic count-sized cluster blobs.
const RAW_POINT_ZOOM = 11;

const PANEL_STYLE: React.CSSProperties = {
  position: "absolute",
  bottom: 10,
  left: 10,
  zIndex: 1000,
  width: 250,
  maxWidth: "calc(100vw - 2.5rem)",
  background: "rgba(10,12,18,0.94)",
  backdropFilter: "blur(6px)",
  border: "1px solid rgba(56,189,248,0.35)",
  borderRadius: 12,
  padding: "14px 16px",
  fontSize: 12,
  color: "#cbd5e1",
  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
};

const MANUFACTURER_COLORS = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#94a3b8"];

function SearchBox({ onResolved }: { onResolved: (lat: number, lng: number, label: string) => void }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function search() {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setNotFound(false);
    try {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      if (d.success && d.result) {
        onResolved(d.result.lat, d.result.lng, d.result.label);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search zip, city, or address..."
          style={{
            flex: 1,
            minWidth: 0,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 6,
            padding: "6px 8px",
            fontSize: 12,
            color: "#fff",
            outline: "none",
          }}
        />
        <button
          onClick={search}
          disabled={searching}
          style={{
            background: "#0c4a6e",
            border: "1px solid rgba(56,189,248,0.5)",
            borderRadius: 6,
            padding: "6px 10px",
            fontSize: 12,
            color: "#fff",
            cursor: searching ? "default" : "pointer",
            opacity: searching ? 0.6 : 1,
          }}
        >
          →
        </button>
      </div>
      {notFound && (
        <div style={{ marginTop: 4, color: "#f87171", fontSize: 11 }}>
          Location not found.
        </div>
      )}
    </div>
  );
}


export default function AlprCamerasLayer() {
  const map = useMap();
  const [tab, setTab] = useState<"cameras" | "route">("cameras");
  const [cameras, setCameras] = useState<AlprCamera[]>([]);
  const [lightPoints, setLightPoints] = useState<LightPoint[]>([]);
  const [detailed, setDetailed] = useState(map.getZoom() >= RAW_POINT_ZOOM);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function load() {
    const zoom = map.getZoom();
    const b = map.getBounds();
    const params = new URLSearchParams({
      south: String(b.getSouth()),
      west: String(b.getWest()),
      north: String(b.getNorth()),
      east: String(b.getEast()),
      zoom: String(zoom),
    });

    fetch(`/api/alpr-cameras?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return;
        setDetailed(Boolean(d.detailed));
        if (d.detailed) {
          setCameras(d.cameras);
          setLightPoints([]);
        } else {
          setLightPoints(d.points);
          setCameras([]);
        }
      })
      .catch(() => {
        // Best-effort overlay; fail silently rather than break the map.
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMapEvents({
    moveend() {
      // Was 400ms -- on top of the zoom animation itself, that read as a
      // second, separate lag before new cameras appeared for the new view.
      // Short enough to still coalesce a rapid flick-pan's multiple
      // moveend firings, tight enough not to feel like a delay.
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(load, 80);
    },
  });

  const totalInView = detailed ? cameras.length : lightPoints.length;

  const manufacturerBreakdown = useMemo(() => {
    if (!detailed || cameras.length === 0) return [];
    const counts = new Map<string, number>();
    for (const cam of cameras) {
      const key = cam.manufacturer || "Unidentified";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, pct: Math.round((count / cameras.length) * 100) }));
  }, [detailed, cameras]);

  function goTo(lat: number, lng: number, zoom = 14) {
    map.flyTo([lat, lng], zoom, { duration: 1 });
  }

  return (
    <>
      <div style={PANEL_STYLE}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: -0.2 }}>ALPR Cameras</div>
          <p style={{ margin: "3px 0 0", fontSize: 11, lineHeight: 1.5, color: "#94a3b8" }}>
            Crowdsourced automated license plate reader locations from{" "}
            <a href="https://deflock.org" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8" }}>
              DeFlock
            </a>{" "}
            / OpenStreetMap.
          </p>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
          {(["cameras", "route"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                background: tab === t ? "#0c4a6e" : "rgba(255,255,255,0.05)",
                border: `1px solid ${tab === t ? "rgba(56,189,248,0.5)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 6,
                padding: "5px 0",
                fontSize: 11,
                fontWeight: 700,
                color: tab === t ? "#38bdf8" : "#94a3b8",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 0.05,
              }}
            >
              {t === "cameras" ? "Map" : "Route"}
            </button>
          ))}
        </div>

        {tab === "cameras" ? (
          <>
            <SearchBox onResolved={(lat, lng) => goTo(lat, lng)} />

            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ color: "#94a3b8", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.05 }}>
                  Cameras in view
                </span>
                <span style={{ color: "#38bdf8", fontWeight: 700, fontSize: 18 }}>{totalInView.toLocaleString()}</span>
              </div>

              {!detailed ? (
                <div style={{ marginTop: 8, color: "#94a3b8", fontSize: 11 }}>
                  Zoom in for individual camera details and manufacturer breakdown.
                </div>
              ) : (
                manufacturerBreakdown.length > 0 && (
                  <>
                    <div
                      style={{
                        marginTop: 8,
                        height: 6,
                        borderRadius: 3,
                        overflow: "hidden",
                        display: "flex",
                        background: "rgba(255,255,255,0.08)",
                      }}
                    >
                      {manufacturerBreakdown.map((m, i) => (
                        <div
                          key={m.name}
                          style={{ width: `${m.pct}%`, background: MANUFACTURER_COLORS[i % MANUFACTURER_COLORS.length] }}
                        />
                      ))}
                    </div>
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {manufacturerBreakdown.map((m, i) => (
                        <div key={m.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#e2e8f0" }}>
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: MANUFACTURER_COLORS[i % MANUFACTURER_COLORS.length],
                                flexShrink: 0,
                              }}
                            />
                            {m.name}
                          </span>
                          <span style={{ color: "#94a3b8" }}>{m.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )
              )}
            </div>
          </>
        ) : (
          <AlprRoutePlanner />
        )}
      </div>

      {!detailed ? (
        <AlprDeckLayer points={lightPoints} />
      ) : (
        <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
          {cameras.map((cam) => (
            <Marker key={cam.id} position={[cam.lat, cam.lng]} icon={CAMERA_ICON}>
              <Popup>
                <div style={{ minWidth: 210, fontSize: 13, color: "#0f172a" }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Automated License Plate Reader</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8 }}>
                    <div>
                      <strong>ID:</strong> {cam.id}
                    </div>
                    {cam.operator && (
                      <div>
                        <strong>Operated by:</strong> {cam.operator}
                      </div>
                    )}
                    {cam.manufacturer && (
                      <div>
                        <strong>Made by:</strong> {cam.manufacturer}
                      </div>
                    )}
                    {cam.zone && (
                      <div>
                        <strong>Zone:</strong> {cam.zone}
                      </div>
                    )}
                    {cam.direction && (
                      <div>
                        <strong>Facing:</strong> {cam.direction}
                      </div>
                    )}
                    <div>
                      <strong>Coords:</strong> {cam.lat.toFixed(5)}, {cam.lng.toFixed(5)}
                    </div>
                  </div>
                  <p style={{ margin: "0 0 8px", lineHeight: 1.5, color: "#334155", fontSize: 11 }}>
                    Crowdsourced location from OpenStreetMap / DeFlock. Not independently verified.
                  </p>
                  <a
                    href={`https://www.openstreetmap.org/node/${cam.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: "#2563eb", fontWeight: 700 }}
                  >
                    View on OpenStreetMap →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}
    </>
  );
}
