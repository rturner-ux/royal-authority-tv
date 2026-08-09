"use client";

import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import type { Layer, StyleFunction } from "leaflet";

export type BoundaryMode = "county" | "state";

const BASE_STYLE = {
  color: "rgba(255,255,255,0.07)",
  weight: 1,
  fillOpacity: 0,
};

const HOVER_STYLE = {
  color: "rgba(255,255,255,0.75)",
  weight: 2,
  fillOpacity: 0,
};

const SOURCES: Record<BoundaryMode, string> = {
  county: "/data/us-counties.geojson",
  state: "/data/us-states.geojson",
};

// Subtle boundary-line texture under the dark basemap, matching the look of
// DeFlock's own map, with a bold-outline hover highlight per county/state.
// Sources: US Census county boundaries and PublicaMundi's public US states
// GeoJSON, self-hosted in /public so this doesn't depend on GitHub's raw
// CDN at request time.
export default function BoundariesLayer({ mode }: { mode: BoundaryMode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setData(null);
    fetch(SOURCES[mode])
      .then((r) => r.json())
      .then(setData)
      .catch(() => {
        // Purely decorative; fail silently rather than break the map.
      });
  }, [mode]);

  if (!data) return null;

  const style: StyleFunction = () => BASE_STYLE;

  function onEachFeature(feature: GeoJSON.Feature, layer: Layer) {
    const name =
      mode === "state" ? feature.properties?.name : feature.properties?.NAME;
    const lsad = mode === "county" ? feature.properties?.LSAD : null;
    if (name) {
      layer.bindTooltip(lsad ? `${name} ${lsad}` : name, { sticky: true, className: "county-tooltip" });
    }
    layer.on("mouseover", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (layer as any).setStyle(HOVER_STYLE);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (layer as any).bringToFront();
    });
    layer.on("mouseout", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (layer as any).setStyle(BASE_STYLE);
    });
  }

  // key={mode} forces a clean remount when switching modes instead of
  // react-leaflet trying to diff two structurally unrelated GeoJSON trees.
  return <GeoJSON key={mode} data={data} style={style} onEachFeature={onEachFeature} />;
}
