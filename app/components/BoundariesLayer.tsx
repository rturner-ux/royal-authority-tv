"use client";

import { useEffect, useRef, useState } from "react";
import { GeoJSON, useMap, useMapEvents } from "react-leaflet";
import type { Layer, StyleFunction } from "leaflet";

export type BoundaryMode = "county" | "state" | "municipality";

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

// Municipality boundaries use a slightly dimmer base line -- at any zoom
// where they're visible there are usually many more of them on screen at
// once than counties/states, so a matching weight would read as visual
// noise layered on top of the other two.
const MUNICIPALITY_BASE_STYLE = {
  color: "rgba(56,189,248,0.18)",
  weight: 1,
  fillOpacity: 0,
};

const MUNICIPALITY_HOVER_STYLE = {
  color: "rgba(56,189,248,0.9)",
  weight: 2,
  fillOpacity: 0,
};

// County/state are small enough (3,221 / 52 features) to self-host as a
// single static file fetched once. Municipality is ~31,900 features --
// served bbox-filtered from /api/municipality-boundaries instead, matching
// the ALPR camera pattern (see MunicipalityLayer below).
const SOURCES: Record<"county" | "state", string> = {
  county: "/data/us-counties.geojson",
  state: "/data/us-states.geojson",
};

// Matches the API route's MIN_ZOOM -- below this the viewport bbox would
// span thousands of places, both a large payload and unreadable clutter.
const MUNICIPALITY_MIN_ZOOM = 8;

function StaticBoundaryLayer({ mode }: { mode: "county" | "state" }) {
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
    const name = mode === "state" ? feature.properties?.name : feature.properties?.NAME;
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

  return <GeoJSON key={mode} data={data} style={style} onEachFeature={onEachFeature} />;
}

function MunicipalityLayer() {
  const map = useMap();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [fetchKey, setFetchKey] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function load() {
    const zoom = map.getZoom();
    if (zoom < MUNICIPALITY_MIN_ZOOM) {
      setData(null);
      return;
    }
    const b = map.getBounds();
    const params = new URLSearchParams({
      south: String(b.getSouth()),
      west: String(b.getWest()),
      north: String(b.getNorth()),
      east: String(b.getEast()),
      zoom: String(zoom),
    });
    fetch(`/api/municipality-boundaries?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setFetchKey((k) => k + 1);
      })
      .catch(() => {
        // Purely decorative; fail silently rather than break the map.
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMapEvents({
    moveend() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(load, 80);
    },
  });

  if (!data || !data.features?.length) return null;

  const style: StyleFunction = () => MUNICIPALITY_BASE_STYLE;

  function onEachFeature(feature: GeoJSON.Feature, layer: Layer) {
    const name = feature.properties?.NAMELSAD || feature.properties?.NAME;
    if (name) {
      layer.bindTooltip(name, { sticky: true, className: "county-tooltip" });
    }
    layer.on("mouseover", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (layer as any).setStyle(MUNICIPALITY_HOVER_STYLE);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (layer as any).bringToFront();
    });
    layer.on("mouseout", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (layer as any).setStyle(MUNICIPALITY_BASE_STYLE);
    });
  }

  return <GeoJSON key={fetchKey} data={data} style={style} onEachFeature={onEachFeature} />;
}

// Subtle boundary-line texture under the dark basemap, matching the look of
// DeFlock's own map, with a bold-outline hover highlight per county/state/
// municipality. County and state render from self-hosted static files;
// municipality is fetched bbox-filtered as the user pans/zooms. All three
// can be active simultaneously (independent toggles), not mutually exclusive.
export default function BoundariesLayer({ activeModes }: { activeModes: BoundaryMode[] }) {
  return (
    <>
      {activeModes.includes("county") && <StaticBoundaryLayer mode="county" />}
      {activeModes.includes("state") && <StaticBoundaryLayer mode="state" />}
      {activeModes.includes("municipality") && <MunicipalityLayer />}
    </>
  );
}
