"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { Deck } from "@deck.gl/core";
import { ScatterplotLayer } from "@deck.gl/layers";

// [lat, lng] tuples, matching the API's compact response shape.
type LightPoint = [number, number];

// deck.gl has no official Leaflet binding (only Mapbox/MapLibre/Google/
// ArcGIS), so this hand-syncs a raw Deck instance's viewState to Leaflet's
// map on every pan/zoom -- the standard pattern for using deck.gl as a
// WebGL overlay on a base map it doesn't natively support. Leaflet's zoom
// convention (zoom 0 = 256px world tile) is one level off deck.gl's
// Mapbox-style convention (zoom 0 = 512px world tile), hence the -1.
function leafletZoomToDeckZoom(zoom: number): number {
  return zoom - 1;
}

export default function AlprDeckLayer({ points }: { points: LightPoint[] }) {
  const map = useMap();
  const deckRef = useRef<Deck | null>(null);

  useEffect(() => {
    const container = map.getContainer();
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "400";
    canvas.style.transition = "opacity 120ms ease-out";
    container.appendChild(canvas);

    function currentViewState() {
      const center = map.getCenter();
      return {
        longitude: center.lng,
        latitude: center.lat,
        zoom: leafletZoomToDeckZoom(map.getZoom()),
        pitch: 0,
        bearing: 0,
      };
    }

    function syncSize() {
      const size = map.getSize();
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;
      deckRef.current?.setProps({ width: size.x, height: size.y, viewState: currentViewState() });
    }

    const deck = new Deck({
      canvas,
      width: map.getSize().x,
      height: map.getSize().y,
      viewState: currentViewState(),
      controller: false,
      layers: [],
    });
    deckRef.current = deck;

    // Plain panning stays tracked continuously via 'move', exactly as
    // before -- this only affects zoom.
    function onMove() {
      deck.setProps({ viewState: currentViewState() });
    }

    // Leaflet's zoom animation (CSS transition on its own panes, or a
    // scroll-wheel's incremental steps) fires no move/zoom events until it
    // settles, so there's no reliable per-frame hook to keep a WebGL
    // canvas visually in lockstep with it -- an earlier attempt at that
    // via the private zoomanim/_latLngToNewLayerPoint APIs produced an
    // instant snap-then-freeze that looked worse than doing nothing.
    // Hiding the canvas for the ~150-250ms a zoom is actually animating
    // and fading it back in once it settles avoids ever showing a
    // mismatched frame, at the cost of a brief clean fade instead of a
    // continuous track. Scoped to zoomstart/zoomend specifically so plain
    // panning is untouched.
    function onZoomStart() {
      canvas.style.opacity = "0";
    }

    function onZoomEnd() {
      deck.setProps({ viewState: currentViewState() });
      canvas.style.opacity = "1";
    }

    map.on("move", onMove);
    map.on("zoomstart", onZoomStart);
    map.on("zoomend", onZoomEnd);
    map.on("resize", syncSize);
    syncSize();

    return () => {
      map.off("move", onMove);
      map.off("zoomstart", onZoomStart);
      map.off("zoomend", onZoomEnd);
      map.off("resize", syncSize);
      deck.finalize();
      container.removeChild(canvas);
      deckRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    deckRef.current?.setProps({
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
  }, [points]);

  return null;
}
