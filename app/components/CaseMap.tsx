"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Link from "next/link";
import L from "leaflet";

const INITIAL_ZOOM = 16;
const DEEP_ZOOM = 19;

// CSI-style establishing shot: render a wide global view first, then
// swoop the map down into the precise location a beat later.
function AutoZoomIn({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    const startTimer = setTimeout(() => {
      map.flyTo([lat, lng], INITIAL_ZOOM, { duration: 2.4, easeLinearity: 0.25 });
    }, 400);
    return () => clearTimeout(startTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, lat, lng]);

  return null;
}

// Fires the deep "drone view" zoom whenever `trigger` increments -- kept
// declarative (like AutoZoomIn above) instead of grabbing a map ref.
function DeepZoomTrigger({ lat, lng, trigger }: { lat: number; lng: number; trigger: number }) {
  const map = useMap();

  useEffect(() => {
    if (trigger > 0) {
      map.flyTo([lat, lng], DEEP_ZOOM, { duration: 1.8, easeLinearity: 0.2 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return null;
}

function markerIcon(): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="position:relative;width:26px;height:26px;cursor:pointer;">
        <div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid #C9A24A;animation:case-map-pulse 1.6s ease-out infinite;"></div>
        <div style="width:26px;height:26px;border-radius:50%;background:#C9A24A;border:3px solid rgba(255,255,255,0.95);box-shadow:0 0 14px rgba(201,162,74,0.9),0 1px 4px rgba(0,0,0,0.6);"></div>
      </div>
    `,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export default function CaseMap({
  lat,
  lng,
  label,
  preciseLat,
  preciseLng,
  preciseLabel,
  isActive,
}: {
  lat: number;
  lng: number;
  label?: string | null;
  preciseLat?: number | null;
  preciseLng?: number | null;
  preciseLabel?: string | null;
  isActive?: boolean;
}) {
  const [deepZoomed, setDeepZoomed] = useState(false);
  const [deepZoomTrigger, setDeepZoomTrigger] = useState(0);
  const [showLockedPrompt, setShowLockedPrompt] = useState(false);

  const targetLat = preciseLat ?? lat;
  const targetLng = preciseLng ?? lng;

  function handleMarkerClick() {
    if (!isActive) {
      setShowLockedPrompt(true);
      return;
    }
    setDeepZoomed(true);
    setDeepZoomTrigger((n) => n + 1);
  }

  return (
    <div className="relative h-full w-full">
      <style>{`
        @keyframes case-map-pulse {
          0% { transform: scale(0.7); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
      <MapContainer
        center={[lat, lng]}
        zoom={3}
        zoomControl={false}
        dragging={deepZoomed}
        scrollWheelZoom={deepZoomed}
        doubleClickZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution="Tiles &copy; Esri. Source: Esri, Maxar, Earthstar Geographics"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxNativeZoom={19}
          maxZoom={21}
        />
        <AutoZoomIn lat={lat} lng={lng} />
        <DeepZoomTrigger lat={targetLat} lng={targetLng} trigger={deepZoomTrigger} />
        <Marker
          position={[lat, lng]}
          icon={markerIcon()}
          eventHandlers={{ click: handleMarkerClick }}
        >
          {(preciseLabel || label) && <Popup>{deepZoomed ? preciseLabel || label : label}</Popup>}
        </Marker>
      </MapContainer>

      {!deepZoomed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
          <div className="rounded-full border border-[#C9A24A]/40 bg-black/70 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-[#E8D19A] backdrop-blur-sm">
            {isActive
              ? "Click the location marker for a high-resolution aerial view"
              : "🔒 Subscribers can unlock a high-resolution aerial view of this location"}
          </div>
        </div>
      )}

      {showLockedPrompt && !isActive && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="max-w-xs rounded-2xl border border-[#C9A24A]/30 bg-[#0a0d14] p-6 text-center shadow-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D19A]">
              Subscriber Feature
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              High-resolution aerial imagery of the exact location is reserved for subscribers.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Link
                href="/subscribe"
                className="rounded-xl bg-[#C9A24A] px-4 py-2 text-xs font-bold text-black transition hover:opacity-90"
              >
                Subscribe for $4.99/mo
              </Link>
              <button
                onClick={() => setShowLockedPrompt(false)}
                className="rounded-xl border border-white/15 px-4 py-2 text-xs text-white transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
