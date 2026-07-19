"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

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
        zoom={15}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution="Tiles &copy; Esri. Source: Esri, Maxar, Earthstar Geographics"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <Marker position={[lat, lng]} icon={markerIcon()}>
          {label && <Popup>{label}</Popup>}
        </Marker>
      </MapContainer>
    </>
  );
}
