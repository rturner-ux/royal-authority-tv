"use client";

import { useEffect, useRef, useState } from "react";
import { Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";

type AlprCamera = {
  id: number;
  lat: number;
  lng: number;
  manufacturer: string | null;
  direction: string | null;
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
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMapEvents({
    moveend() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(load, 400);
    },
  });

  if (zoomedOut) {
    return (
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          zIndex: 1000,
          background: "rgba(10,12,18,0.92)",
          border: "1px solid rgba(56,189,248,0.4)",
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 12,
          color: "#cbd5e1",
        }}
      >
        Zoom in to see ALPR camera locations.
      </div>
    );
  }

  return (
    <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
      {cameras.map((cam) => (
        <Marker key={cam.id} position={[cam.lat, cam.lng]} icon={CAMERA_ICON}>
          <Popup>
            <div style={{ minWidth: 200, fontSize: 13, color: "#0f172a" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Automated License Plate Reader</div>
              {cam.manufacturer && (
                <div style={{ marginBottom: 2 }}>
                  <strong>Manufacturer:</strong> {cam.manufacturer}
                </div>
              )}
              {cam.direction && (
                <div style={{ marginBottom: 6 }}>
                  <strong>Facing:</strong> {cam.direction}
                </div>
              )}
              <p style={{ margin: "8px 0 4px", lineHeight: 1.5, color: "#334155", fontSize: 11 }}>
                Crowdsourced location from OpenStreetMap / DeFlock. Not independently verified.
              </p>
              <a
                href={`https://maps.deflock.org/?lat=${cam.lat}&lng=${cam.lng}&zoom=17`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#2563eb", fontWeight: 700 }}
              >
                View on DeFlock →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}
