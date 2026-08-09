"use client";

import { useEffect, useMemo, useState } from "react";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";

// Subtle county-line texture under the dark basemap, matching the look of
// DeFlock's own map. Source: US Census county boundaries (Plotly's public
// GeoJSON mirror of the Census cartographic boundary files), self-hosted
// in /public so this doesn't depend on GitHub's raw CDN at request time.
export default function CountyBoundariesLayer() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const canvasRenderer = useMemo(() => L.canvas({ padding: 0.5 }), []);

  useEffect(() => {
    fetch("/data/us-counties.geojson")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {
        // Purely decorative; fail silently rather than break the map.
      });
  }, []);

  if (!data) return null;

  return (
    <GeoJSON
      data={data}
      renderer={canvasRenderer}
      interactive={false}
      style={{
        color: "rgba(255,255,255,0.16)",
        weight: 1,
        fillOpacity: 0,
      }}
    />
  );
}
