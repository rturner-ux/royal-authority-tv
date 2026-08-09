"use client";

import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import type { Layer, StyleFunction } from "leaflet";

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

// Subtle county-line texture under the dark basemap, matching the look of
// DeFlock's own map, with a bold-outline hover highlight per county.
// Source: US Census county boundaries (Plotly's public GeoJSON mirror of
// the Census cartographic boundary files), self-hosted in /public so this
// doesn't depend on GitHub's raw CDN at request time.
export default function CountyBoundariesLayer() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/data/us-counties.geojson")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {
        // Purely decorative; fail silently rather than break the map.
      });
  }, []);

  if (!data) return null;

  const style: StyleFunction = () => BASE_STYLE;

  function onEachFeature(feature: GeoJSON.Feature, layer: Layer) {
    const name = feature.properties?.NAME;
    const lsad = feature.properties?.LSAD;
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

  return <GeoJSON data={data} style={style} onEachFeature={onEachFeature} />;
}
