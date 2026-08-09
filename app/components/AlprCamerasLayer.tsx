"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";

type AlprCamera = {
  id: number;
  lat: number;
  lng: number;
  manufacturer: string | null;
  direction: string | null;
  operator: string | null;
  zone: string | null;
};

const CAMERA_ICON = L.divIcon({
  html: `<div style="width:12px;height:12px;background:#38bdf8;border:2px solid rgba(255,255,255,0.85);border-radius:3px;box-shadow:0 0 6px rgba(56,189,248,0.8);"></div>`,
  className: "",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// Below this zoom, a nationwide-density tag like this would mean tens of
// thousands of points and a slow/rejected Overpass query -- matches the
// same practical limit DeFlock's own map imposes.
const MIN_ZOOM = 11;

const PANEL_STYLE: React.CSSProperties = {
  position: "absolute",
  bottom: 10,
  left: 10,
  zIndex: 1000,
  width: 240,
  maxWidth: "calc(100vw - 2.5rem)",
  background: "rgba(10,12,18,0.94)",
  border: "1px solid rgba(56,189,248,0.35)",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 12,
  color: "#cbd5e1",
};

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
  const [cameras, setCameras] = useState<AlprCamera[]>([]);
  const [zoomedOut, setZoomedOut] = useState(map.getZoom() < MIN_ZOOM);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function load() {
    const zoom = map.getZoom();
    if (zoom < MIN_ZOOM) {
      setZoomedOut(true);
      setCameras([]);
      return;
    }
    setZoomedOut(false);

    const b = map.getBounds();
    const params = new URLSearchParams({
      south: String(b.getSouth()),
      west: String(b.getWest()),
      north: String(b.getNorth()),
      east: String(b.getEast()),
    });

    fetch(`/api/alpr-cameras?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCameras(d.cameras);
      })
      .catch(() => {
        // Best-effort overlay; fail silently rather than break the map.
      });
  }

  useEffect(() => {
    // Turning the layer on at a zoomed-out view used to just print a small
    // "zoom in" note in the opposite corner from the toggle button --
    // indistinguishable from the click doing nothing. Zoom the map in for
    // them instead, so the toggle visibly does something immediately.
    if (map.getZoom() < MIN_ZOOM) {
      map.flyTo(map.getCenter(), MIN_ZOOM, { duration: 1 });
    } else {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMapEvents({
    moveend() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(load, 400);
    },
  });

  const manufacturerBreakdown = useMemo(() => {
    if (cameras.length === 0) return [];
    const counts = new Map<string, number>();
    for (const cam of cameras) {
      const key = cam.manufacturer || "Unidentified";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, pct: Math.round((count / cameras.length) * 100) }));
  }, [cameras]);

  function goTo(lat: number, lng: number) {
    map.flyTo([lat, lng], 14, { duration: 1 });
  }

  return (
    <>
      <div style={PANEL_STYLE}>
        <SearchBox onResolved={(lat, lng) => goTo(lat, lng)} />

        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {zoomedOut ? (
            <div style={{ color: "#94a3b8" }}>Zoom in to see ALPR camera locations.</div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ color: "#94a3b8", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.05 }}>
                  Cameras in view
                </span>
                <span style={{ color: "#38bdf8", fontWeight: 700, fontSize: 16 }}>{cameras.length}</span>
              </div>
              {manufacturerBreakdown.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                  {manufacturerBreakdown.map((m) => (
                    <div key={m.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                        <span style={{ color: "#e2e8f0" }}>{m.name}</span>
                        <span style={{ color: "#94a3b8" }}>{m.pct}%</span>
                      </div>
                      <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginTop: 2 }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${m.pct}%`,
                            background: "#38bdf8",
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

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
    </>
  );
}
