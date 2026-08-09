"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
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
    // Leaflet transforms its own panes from a 0,0 origin during zoom
    // animations (see onZoomAnim below) -- match that here or the scale
    // applied mid-animation lands off-center.
    canvas.style.transformOrigin = "0 0";
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

    function onMove() {
      // The real WebGL redraw is now happening at the correct position/
      // scale internally -- clear any leftover mid-animation CSS transform
      // from onZoomAnim so it doesn't double up with deck's own redraw.
      canvas.style.transform = "";
      deck.setProps({ viewState: currentViewState() });
    }

    // Leaflet's default zoom uses a ~250ms CSS transition on its own panes;
    // it fires no move/zoom events until that finishes, so without this the
    // WebGL canvas sits frozen at its pre-zoom render for the whole
    // animation and then visibly snaps into place. zoomanim fires
    // synchronously at the start of the animation with the target
    // center/zoom, letting us apply the same kind of CSS transform to our
    // canvas that Leaflet applies to its own tile/marker panes, so the
    // dots visually scale and slide in lockstep with the basemap instead
    // of lagging behind it.
    function onZoomAnim(e: L.ZoomAnimEvent) {
      const scale = map.getZoomScale(e.zoom, map.getZoom());
      const topLeftLatLng = map.containerPointToLatLng([0, 0]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const offset = (map as any)._latLngToNewLayerPoint(topLeftLatLng, e.zoom, e.center);
      L.DomUtil.setTransform(canvas, offset, scale);
    }

    map.on("move", onMove);
    map.on("zoomanim", onZoomAnim);
    map.on("resize", syncSize);
    syncSize();

    return () => {
      map.off("move", onMove);
      map.off("zoomanim", onZoomAnim);
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
