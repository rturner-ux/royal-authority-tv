"use client";

import { useEffect, useRef, useState } from "react";
import { Source, Layer, Popup } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import type { MapGeoJSONFeature, MapLayerMouseEvent } from "maplibre-gl";

export type BoundaryMode = "county" | "state" | "municipality";

const BASE_COLOR = "rgba(255,255,255,0.07)";
const HOVER_COLOR = "rgba(255,255,255,0.75)";
const MUNICIPALITY_BASE_COLOR = "rgba(56,189,248,0.18)";
const MUNICIPALITY_HOVER_COLOR = "rgba(56,189,248,0.9)";

// Matches the API route's MIN_ZOOM -- below this the viewport bbox would
// span thousands of places, both a large payload and unreadable clutter.
const MUNICIPALITY_MIN_ZOOM = 8;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hoverLinePaint(baseColor: string, hoverColor: string): any {
  return {
    "line-color": ["case", ["boolean", ["feature-state", "hover"], false], hoverColor, baseColor],
    "line-width": ["case", ["boolean", ["feature-state", "hover"], false], 2, 1],
  };
}

type HoverInfo = { lng: number; lat: number; text: string };

function useBoundaryHover(map: MapRef, sourceId: string, layerId: string, nameOf: (f: MapGeoJSONFeature) => string | null) {
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const hoveredId = useRef<string | number | null>(null);

  useEffect(() => {
    const m = map.getMap();

    function clearHover() {
      if (hoveredId.current !== null) {
        m.setFeatureState({ source: sourceId, id: hoveredId.current }, { hover: false });
        hoveredId.current = null;
      }
    }

    function onMove(e: MapLayerMouseEvent) {
      const feature = e.features?.[0];
      if (!feature || feature.id == null) return;
      if (hoveredId.current === feature.id) return;
      clearHover();
      hoveredId.current = feature.id;
      m.setFeatureState({ source: sourceId, id: feature.id }, { hover: true });
      const name = nameOf(feature);
      setHoverInfo(name ? { lng: e.lngLat.lng, lat: e.lngLat.lat, text: name } : null);
    }

    function onLeave() {
      clearHover();
      setHoverInfo(null);
    }

    m.on("mousemove", layerId, onMove);
    m.on("mouseleave", layerId, onLeave);
    return () => {
      m.off("mousemove", layerId, onMove);
      m.off("mouseleave", layerId, onLeave);
      clearHover();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, sourceId, layerId]);

  return hoverInfo;
}

function BoundaryTooltip({ hoverInfo }: { hoverInfo: HoverInfo | null }) {
  if (!hoverInfo) return null;
  return (
    <Popup
      longitude={hoverInfo.lng}
      latitude={hoverInfo.lat}
      closeButton={false}
      closeOnClick={false}
      className="county-tooltip"
      offset={8}
    >
      {hoverInfo.text}
    </Popup>
  );
}

function CountyLayer({ map }: { map: MapRef }) {
  const hoverInfo = useBoundaryHover(map, "counties", "county-line", (f) => {
    const name = f.properties?.NAME;
    const lsad = f.properties?.LSAD;
    return name ? (lsad ? `${name} ${lsad}` : name) : null;
  });
  return (
    <>
      <Source id="counties" type="geojson" data="/data/us-counties.geojson" generateId>
        <Layer id="county-line" type="line" paint={hoverLinePaint(BASE_COLOR, HOVER_COLOR)} />
      </Source>
      <BoundaryTooltip hoverInfo={hoverInfo} />
    </>
  );
}

function StateLayer({ map }: { map: MapRef }) {
  const hoverInfo = useBoundaryHover(map, "states", "state-line", (f) => f.properties?.name || null);
  return (
    <>
      <Source id="states" type="geojson" data="/data/us-states.geojson" generateId>
        <Layer id="state-line" type="line" paint={hoverLinePaint(BASE_COLOR, HOVER_COLOR)} />
      </Source>
      <BoundaryTooltip hoverInfo={hoverInfo} />
    </>
  );
}

function MunicipalityLayer({ map }: { map: MapRef }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>({ type: "FeatureCollection", features: [] });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const m = map.getMap();

    function load() {
      const zoom = m.getZoom();
      if (zoom < MUNICIPALITY_MIN_ZOOM) {
        setData({ type: "FeatureCollection", features: [] });
        return;
      }
      const b = m.getBounds();
      const params = new URLSearchParams({
        south: String(b.getSouth()),
        west: String(b.getWest()),
        north: String(b.getNorth()),
        east: String(b.getEast()),
        zoom: String(zoom),
      });
      fetch(`/api/municipality-boundaries?${params}`)
        .then((r) => r.json())
        .then(setData)
        .catch(() => {
          // Purely decorative; fail silently rather than break the map.
        });
    }

    load();
    function onMoveEnd() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(load, 80);
    }
    m.on("moveend", onMoveEnd);
    return () => {
      m.off("moveend", onMoveEnd);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  const hoverInfo = useBoundaryHover(map, "municipalities", "municipality-line", (f) => f.properties?.NAMELSAD || f.properties?.NAME || null);

  return (
    <>
      {/* Passing `data` directly (not an imperative setData ref/key-remount
          trick) -- react-map-gl's <Source> deep-compares props and calls
          the underlying source's setData() itself when this object
          changes, so there's no need for the old Leaflet layer's
          key={fetchKey} forced-remount workaround. */}
      <Source id="municipalities" type="geojson" data={data} generateId>
        <Layer id="municipality-line" type="line" paint={hoverLinePaint(MUNICIPALITY_BASE_COLOR, MUNICIPALITY_HOVER_COLOR)} />
      </Source>
      <BoundaryTooltip hoverInfo={hoverInfo} />
    </>
  );
}

// Subtle boundary-line texture matching DeFlock's own map, with a bold
// hover highlight + tooltip per county/state/municipality. All three can
// be active simultaneously (independent toggles), not mutually exclusive.
export default function BoundariesLayerGL({ map, activeModes }: { map: MapRef; activeModes: BoundaryMode[] }) {
  return (
    <>
      {activeModes.includes("county") && <CountyLayer map={map} />}
      {activeModes.includes("state") && <StateLayer map={map} />}
      {activeModes.includes("municipality") && <MunicipalityLayer map={map} />}
    </>
  );
}
