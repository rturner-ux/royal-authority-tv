import type { StyleSpecification } from "maplibre-gl";

// OpenFreeMap's dark style: free, MIT-licensed vector tiles, no API key,
// no rate limit, no commercial-use restriction -- unlike CARTO's vector
// tiles (75k mapviews/mo cap, non-commercial-only per their own FAQ) which
// would otherwise have been the closest match to today's CARTO raster tiles.
export const DARK_STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

// Same Esri World Imagery XYZ endpoint the current Leaflet map uses,
// expressed as a MapLibre style document instead of a TileLayer -- keeps
// the exact current satellite imagery/attribution with no new dependency.
export const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    esri: {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Tiles &copy; Esri. Source: Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [
    {
      id: "esri-satellite",
      type: "raster",
      source: "esri",
    },
  ],
};

export type MapStyleKey = "satellite" | "dark";

export function resolveMapStyle(key: MapStyleKey): string | StyleSpecification {
  return key === "dark" ? DARK_STYLE_URL : SATELLITE_STYLE;
}
