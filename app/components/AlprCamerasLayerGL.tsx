"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Supercluster from "supercluster";
import { Marker, Popup } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import type { BoundaryMode } from "./BoundariesLayerGL";
import AlprRoutePlannerGL from "./AlprRoutePlannerGL";

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

// At or above this zoom, the API returns individually-poppable raw camera
// points with full detail. Below it, it returns every camera's bare
// coordinates -- Phase 5 renders those as a deck.gl point cloud.
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
      {notFound && <div style={{ marginTop: 4, color: "#f87171", fontSize: 11 }}>Location not found.</div>}
    </div>
  );
}

type CameraLeafProps = { cluster: false; cameraId: number };

function CameraMarkers({ map, cameras }: { map: MapRef; cameras: AlprCamera[] }) {
  const [viewport, setViewport] = useState<{ bbox: [number, number, number, number]; zoom: number } | null>(null);
  const [openPopupId, setOpenPopupId] = useState<number | null>(null);

  const index = useMemo(() => {
    const idx = new Supercluster<CameraLeafProps>({ radius: 40, maxZoom: 18 });
    idx.load(
      cameras.map((cam) => ({
        type: "Feature",
        properties: { cluster: false, cameraId: cam.id },
        geometry: { type: "Point", coordinates: [cam.lng, cam.lat] },
      }))
    );
    return idx;
  }, [cameras]);

  useEffect(() => {
    const m = map.getMap();
    function update() {
      const b = m.getBounds();
      setViewport({ bbox: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], zoom: Math.round(m.getZoom()) });
    }
    update();
    m.on("moveend", update);
    return () => {
      m.off("moveend", update);
    };
  }, [map]);

  const clusters = useMemo(() => (viewport ? index.getClusters(viewport.bbox, viewport.zoom) : []), [index, viewport]);

  const cameraById = useMemo(() => {
    const byId = new Map<number, AlprCamera>();
    for (const cam of cameras) byId.set(cam.id, cam);
    return byId;
  }, [cameras]);

  const openCamera = openPopupId != null ? cameraById.get(openPopupId) : undefined;

  return (
    <>
      {clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties as (CameraLeafProps & { cluster: false }) | { cluster: true; cluster_id: number; point_count: number };

        if (props.cluster) {
          const size = props.point_count >= 20 ? 34 : props.point_count >= 8 ? 28 : 22;
          return (
            <Marker
              key={`camera-cluster-${props.cluster_id}`}
              longitude={lng}
              latitude={lat}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                const expansionZoom = Math.min(index.getClusterExpansionZoom(props.cluster_id), 18);
                map.getMap().flyTo({ center: [lng, lat], zoom: expansionZoom, duration: 500 });
              }}
            >
              <div
                style={{ cursor: "pointer" }}
                dangerouslySetInnerHTML={{
                  __html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:rgba(12,74,110,0.9);border:2px solid rgba(56,189,248,0.8);box-shadow:0 0 8px rgba(56,189,248,0.6);display:flex;align-items:center;justify-content:center;font:700 11px system-ui;color:#e0f2fe;">${props.point_count}</div>`,
                }}
              />
            </Marker>
          );
        }

        const cam = cameraById.get(props.cameraId);
        if (!cam) return null;

        return (
          <Marker
            key={cam.id}
            longitude={lng}
            latitude={lat}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setOpenPopupId(cam.id);
            }}
          >
            <div
              style={{ cursor: "pointer" }}
              dangerouslySetInnerHTML={{
                __html: `<div style="width:12px;height:12px;background:#38bdf8;border:2px solid rgba(255,255,255,0.85);border-radius:3px;box-shadow:0 0 6px rgba(56,189,248,0.8);"></div>`,
              }}
            />
          </Marker>
        );
      })}

      {openCamera && (
        <Popup longitude={openCamera.lng} latitude={openCamera.lat} onClose={() => setOpenPopupId(null)} closeButton offset={12}>
          <div style={{ minWidth: 210, fontSize: 13, color: "#0f172a" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Automated License Plate Reader</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8 }}>
              <div>
                <strong>ID:</strong> {openCamera.id}
              </div>
              {openCamera.operator && (
                <div>
                  <strong>Operated by:</strong> {openCamera.operator}
                </div>
              )}
              {openCamera.manufacturer && (
                <div>
                  <strong>Made by:</strong> {openCamera.manufacturer}
                </div>
              )}
              {openCamera.zone && (
                <div>
                  <strong>Zone:</strong> {openCamera.zone}
                </div>
              )}
              {openCamera.direction && (
                <div>
                  <strong>Facing:</strong> {openCamera.direction}
                </div>
              )}
              <div>
                <strong>Coords:</strong> {openCamera.lat.toFixed(5)}, {openCamera.lng.toFixed(5)}
              </div>
            </div>
            <p style={{ margin: "0 0 8px", lineHeight: 1.5, color: "#334155", fontSize: 11 }}>
              Crowdsourced location from OpenStreetMap / DeFlock. Not independently verified.
            </p>
            <a
              href={`https://www.openstreetmap.org/node/${openCamera.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#2563eb", fontWeight: 700 }}
            >
              View on OpenStreetMap →
            </a>
          </div>
        </Popup>
      )}
    </>
  );
}

export default function AlprCamerasLayerGL({
  map,
  activeBoundaryModes,
  onToggleBoundaryMode,
  onLightPointsChange,
}: {
  map: MapRef;
  activeBoundaryModes: BoundaryMode[];
  onToggleBoundaryMode: (mode: BoundaryMode) => void;
  // Phase 5 renders the light-point cloud via deck.gl outside this
  // component (interleaved directly into the MapLibre GL context), so this
  // just reports the current light points up rather than rendering them.
  onLightPointsChange: (points: LightPoint[]) => void;
}) {
  const [tab, setTab] = useState<"cameras" | "route">("cameras");
  const [cameras, setCameras] = useState<AlprCamera[]>([]);
  const [detailed, setDetailed] = useState(map.getMap().getZoom() >= RAW_POINT_ZOOM);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const m = map.getMap();

    function load() {
      const zoom = m.getZoom();
      const b = m.getBounds();
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
            onLightPointsChange([]);
          } else {
            onLightPointsChange(d.points);
            setCameras([]);
          }
        })
        .catch(() => {
          // Best-effort overlay; fail silently rather than break the map.
        });
    }

    load();
    function onMoveEnd() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(load, 80);
    }
    m.on("moveend", onMoveEnd);
    return () => {
      m.off("moveend", onMoveEnd);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onLightPointsChange([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  const totalInView = detailed ? cameras.length : undefined;

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
    map.getMap().flyTo({ center: [lng, lat], zoom, duration: 1000 });
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
              <span style={{ color: "#94a3b8", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.05 }}>
                Boundaries
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {(
                  [
                    ["state", "States"],
                    ["county", "Counties"],
                    ["municipality", "Municipalities"],
                  ] as const
                ).map(([m, label]) => {
                  const active = activeBoundaryModes.includes(m);
                  return (
                    <div key={m} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: active ? "#e2e8f0" : "#94a3b8" }}>{label}</span>
                      <button
                        type="button"
                        onClick={() => onToggleBoundaryMode(m)}
                        aria-pressed={active}
                        style={{
                          position: "relative",
                          width: 34,
                          height: 18,
                          borderRadius: 999,
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          background: active ? "#0c4a6e" : "rgba(255,255,255,0.1)",
                          transition: "background 150ms ease-in-out",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: 2,
                            left: active ? 18 : 2,
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: active ? "#38bdf8" : "#94a3b8",
                            transition: "left 150ms ease-in-out",
                          }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
              {activeBoundaryModes.includes("municipality") && (
                <p style={{ margin: "8px 0 0", fontSize: 10, lineHeight: 1.4, color: "#64748b" }}>
                  Municipality lines appear once you zoom in close enough.
                </p>
              )}
            </div>

            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ color: "#94a3b8", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.05 }}>
                  Cameras in view
                </span>
                {totalInView !== undefined && (
                  <span style={{ color: "#38bdf8", fontWeight: 700, fontSize: 18 }}>{totalInView.toLocaleString()}</span>
                )}
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
          <AlprRoutePlannerGL map={map} />
        )}
      </div>

      {detailed && <CameraMarkers map={map} cameras={cameras} />}
    </>
  );
}
