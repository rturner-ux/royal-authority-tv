"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

function markerIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:20px;height:20px;border-radius:50%;background:#C9A24A;border:3px solid rgba(255,255,255,0.9);box-shadow:0 0 12px rgba(201,162,74,0.8);"></div>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Marker position={[lat, lng]} icon={markerIcon()}>
        {label && <Popup>{label}</Popup>}
      </Marker>
    </MapContainer>
  );
}
