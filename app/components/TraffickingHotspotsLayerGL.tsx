"use client";

import { useEffect, useState } from "react";
import { Source, Layer, Popup } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "maplibre-gl";
import { TRAFFICKING_CORRIDORS, type TraffickingCorridor } from "@/lib/traffickingCorridors";

const LAYER_IDS = TRAFFICKING_CORRIDORS.map((c) => `trafficking-${c.name}-line`);

export default function TraffickingHotspotsLayerGL({ map }: { map: MapRef }) {
  const [openCorridor, setOpenCorridor] = useState<TraffickingCorridor | null>(null);
  const [popupPos, setPopupPos] = useState<{ lng: number; lat: number } | null>(null);

  useEffect(() => {
    const m = map.getMap();
    function onClick(e: MapLayerMouseEvent) {
      const feature = e.features?.[0];
      if (!feature) return;
      const corridor = TRAFFICKING_CORRIDORS.find((c) => `trafficking-${c.name}-line` === feature.layer.id);
      if (!corridor) return;
      setOpenCorridor(corridor);
      setPopupPos({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    }
    m.on("click", LAYER_IDS, onClick);
    return () => {
      m.off("click", LAYER_IDS, onClick);
    };
  }, [map]);

  return (
    <>
      {TRAFFICKING_CORRIDORS.map((corridor) => (
        <Source
          key={corridor.name}
          id={`trafficking-${corridor.name}`}
          type="geojson"
          data={{
            type: "Feature",
            properties: {},
            // waypoints are stored [lat,lng] (Leaflet convention); GeoJSON/MapLibre want [lng,lat].
            geometry: { type: "LineString", coordinates: corridor.waypoints.map(([lat, lng]) => [lng, lat]) },
          }}
        >
          <Layer
            id={`trafficking-${corridor.name}-line`}
            type="line"
            paint={{ "line-color": "#ff4d3d", "line-width": 4, "line-opacity": 0.75 }}
          />
        </Source>
      ))}

      {openCorridor && popupPos && (
        <Popup longitude={popupPos.lng} latitude={popupPos.lat} onClose={() => setOpenCorridor(null)} closeButton offset={12}>
          <div style={{ minWidth: 220, fontSize: 13, color: "#0f172a" }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{openCorridor.name} Corridor</div>
            <p style={{ margin: "0 0 8px", lineHeight: 1.5, color: "#334155" }}>{openCorridor.description}</p>
            <a
              href={openCorridor.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#2563eb", fontWeight: 700 }}
            >
              {openCorridor.sourceName} →
            </a>
          </div>
        </Popup>
      )}
    </>
  );
}
