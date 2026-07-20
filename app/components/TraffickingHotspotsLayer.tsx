"use client";

import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import type { Feature, Geometry } from "geojson";
import { STATE_TRAFFICKING_DATA, TRAFFICKING_HOTLINE_DATA_YEAR, casesPer100k } from "@/lib/traffickingHotspots";

function colorForRate(rate: number | null): string {
  if (rate === null) return "#334155";
  if (rate < 2.0) return "#4c1d1d";
  if (rate < 2.75) return "#7a2323";
  if (rate < 3.5) return "#a32626";
  if (rate < 4.5) return "#d1342f";
  return "#ff4d3d";
}

type StateProperties = { name: string };

export default function TraffickingHotspotsLayer() {
  const [geoJson, setGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/us-states.json")
      .then((r) => r.json())
      .then(setGeoJson)
      .catch(() => setGeoJson(null));
  }, []);

  if (!geoJson) return null;

  return (
    <GeoJSON
      data={geoJson}
      style={(feature?: Feature<Geometry, StateProperties>) => {
        const name = feature?.properties?.name;
        const rate = name ? casesPer100k(name) : null;
        return {
          fillColor: colorForRate(rate),
          fillOpacity: 0.45,
          color: "rgba(255,255,255,0.25)",
          weight: 1,
        };
      }}
      onEachFeature={(feature: Feature<Geometry, StateProperties>, layer) => {
        const name = feature.properties?.name;
        const entry = name ? STATE_TRAFFICKING_DATA[name] : undefined;
        const rate = name ? casesPer100k(name) : null;
        if (!name || !entry || rate === null) return;
        layer.bindPopup(
          `<div style="min-width:200px;font-size:13px;color:#0f172a">
            <div style="font-weight:700;margin-bottom:4px">${name}</div>
            <div style="color:#475569">${entry.cases.toLocaleString()} reported cases (${TRAFFICKING_HOTLINE_DATA_YEAR})</div>
            <div style="color:#475569">${rate.toFixed(1)} cases per 100,000 residents</div>
            <div style="margin-top:6px;font-size:11px;color:#64748b">Source: National Human Trafficking Hotline</div>
          </div>`
        );
      }}
    />
  );
}
