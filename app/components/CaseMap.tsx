"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// CSI-style establishing shot: render a wide global view first, then
// swoop the map down into the precise location a beat later.
function AutoZoomIn({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.flyTo([lat, lng], 16, { duration: 2.4, easeLinearity: 0.25 });
    }, 400);
    return () => clearTimeout(timer);
  }, [map, lat, lng]);

  return null;
}

function markerIcon(): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="position:relative;width:26px;height:26px;">
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
}: {
  lat: number;
  lng: number;
  label?: string | null;
}) {
  return (
    <>
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
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution="Tiles &copy; Esri. Source: Esri, Maxar, Earthstar Geographics"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <AutoZoomIn lat={lat} lng={lng} />
        <Marker position={[lat, lng]} icon={markerIcon()}>
          {label && <Popup>{label}</Popup>}
        </Marker>
      </MapContainer>
    </>
  );
}
