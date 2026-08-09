"use client";

import { useEffect } from "react";
import { useControl } from "react-map-gl/maplibre";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScatterplotLayer } from "@deck.gl/layers";

// [lat, lng] tuples, matching the API's compact response shape.
type LightPoint = [number, number];

// Replaces the old Leaflet version's hand-rolled canvas creation + manual
// move/zoomstart/zoomend event sync + zoom-fade opacity hack +
// leafletZoomToDeckZoom offset math entirely. MapboxOverlay (which also
// works with MapLibre, not just literal Mapbox) hooks directly into
// MapLibre's own render/camera-sync lifecycle via map.addControl(), so
// pan/zoom/pitch/rotate stay frame-accurate automatically -- no custom
// code, and (unlike the old canvas) it tracks correctly through a pitch/
// rotate gesture since it's interleaved into the same WebGL context and
// projection matrix as the base map itself. `interleaved: true` is the
// specific flag that gives real interleaving instead of a separately-
// composited overlay canvas that would visibly detach mid-gesture.
export default function AlprDeckLayerGL({ points }: { points: LightPoint[] }) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay({ interleaved: true, layers: [] }));

  useEffect(() => {
    overlay.setProps({
      layers: [
        new ScatterplotLayer<LightPoint>({
          id: "alpr-points",
          data: points,
          getPosition: (d) => [d[1], d[0]],
          radiusUnits: "pixels",
          getRadius: 1.5,
          radiusMinPixels: 1,
          radiusMaxPixels: 3,
          getFillColor: [56, 189, 248, 140],
          stroked: false,
          pickable: false,
        }),
      ],
    });
  }, [overlay, points]);

  return null;
}
