"use client";

import { useEffect, useMemo, useState } from "react";
import Supercluster from "supercluster";
import Link from "next/link";
import { Marker, Popup } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import type { Incident } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";
import { CATEGORY_SHAPES, shapeSvg } from "@/lib/mapShapes";

type ClusterProps = { cluster: true; cluster_id: number; point_count: number };
type LeafProps = { cluster: false; incidentId: string };

function clusterSizeFor(count: number) {
  return count >= 20 ? 52 : count >= 8 ? 44 : 36;
}

// DOM markers (not GL symbol/circle layers) for individual pins and cluster
// bubbles alike -- at this site's marker counts (few hundred to low
// thousands) DOM nodes are cheap, and it lets the exact existing
// shapeSvg()/pulsing-ring HTML system drop in unchanged instead of building
// a sprite-sheet pipeline. Clustering itself uses `supercluster` directly
// (the same library MapLibre's own GeoJSONSource(cluster:true) uses
// internally) rather than a GL cluster layer, so cluster bubbles can keep
// the exact gold-on-navy custom look pixel-for-pixel instead of being
// redone as circle-layer paint expressions.
export default function IncidentMarkersGL({ map, incidents }: { map: MapRef; incidents: Incident[] }) {
  const [viewport, setViewport] = useState<{ bbox: [number, number, number, number]; zoom: number } | null>(null);
  const [openPopupId, setOpenPopupId] = useState<string | null>(null);

  const index = useMemo(() => {
    const idx = new Supercluster<LeafProps>({ radius: 50, maxZoom: 16 });
    idx.load(
      incidents.map((incident) => ({
        type: "Feature",
        properties: { cluster: false, incidentId: incident.id },
        geometry: { type: "Point", coordinates: [incident.lng, incident.lat] },
      }))
    );
    return idx;
  }, [incidents]);

  useEffect(() => {
    const m = map.getMap();
    function update() {
      const b = m.getBounds();
      setViewport({ bbox: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], zoom: Math.round(m.getZoom()) });
    }
    update();
    m.on("moveend", update);
    return () => {
      m.off("moveend", update);
    };
  }, [map]);

  const clusters = useMemo(() => {
    if (!viewport) return [];
    return index.getClusters(viewport.bbox, viewport.zoom);
  }, [index, viewport]);

  const incidentById = useMemo(() => {
    const byId = new Map<string, Incident>();
    for (const incident of incidents) byId.set(incident.id, incident);
    return byId;
  }, [incidents]);

  const openIncident = openPopupId ? incidentById.get(openPopupId) : undefined;

  return (
    <>
      {clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties as ClusterProps | LeafProps;

        if (props.cluster) {
          const size = clusterSizeFor(props.point_count);
          return (
            <Marker
              key={`cluster-${props.cluster_id}`}
              longitude={lng}
              latitude={lat}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                const expansionZoom = Math.min(index.getClusterExpansionZoom(props.cluster_id), 16);
                map.getMap().flyTo({ center: [lng, lat], zoom: expansionZoom, duration: 500 });
              }}
            >
              <div
                style={{ cursor: "pointer" }}
                dangerouslySetInnerHTML={{
                  __html: `
                    <div style="width:${size}px;height:${size}px;border-radius:50%;background:rgba(15,23,42,0.9);border:2px solid rgba(201,162,74,0.8);box-shadow:0 0 14px rgba(201,162,74,0.5);display:flex;align-items:center;justify-content:center;font:700 ${size >= 44 ? 15 : 13}px system-ui;color:#E8D19A;">
                      ${props.point_count}
                    </div>
                  `,
                }}
              />
            </Marker>
          );
        }

        const incident = incidentById.get(props.incidentId);
        if (!incident) return null;

        const color = CATEGORY_COLORS[incident.category] || "#94a3b8";
        const shape = CATEGORY_SHAPES[incident.category] || "circle";
        const opacity = incident.status === "active" ? 1 : 0.5;
        const glyphSize = incident.is_featured ? 26 : 18;
        const size = incident.is_featured ? 40 : 18;
        const ring = incident.is_featured
          ? `<div style="position:absolute;top:50%;left:50%;width:${size}px;height:${size}px;margin-top:-${size / 2}px;margin-left:-${size / 2}px;border-radius:50%;border:3px solid #ef4444;animation:ra-flash 1.1s ease-in-out infinite;"></div>`
          : "";
        const glyph = shapeSvg(shape, color, glyphSize);

        return (
          <Marker
            key={incident.id}
            longitude={lng}
            latitude={lat}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setOpenPopupId(incident.id);
            }}
          >
            <div
              style={{ position: "relative", width: size, height: size, cursor: "pointer" }}
              dangerouslySetInnerHTML={{
                __html: `
                  ${ring}
                  <div style="position:absolute;top:50%;left:50%;width:${glyphSize}px;height:${glyphSize}px;margin-top:-${glyphSize / 2}px;margin-left:-${glyphSize / 2}px;opacity:${opacity};filter:drop-shadow(0 0 6px ${color}cc) drop-shadow(0 1px 3px rgba(0,0,0,0.6));">${glyph}</div>
                `,
              }}
            />
          </Marker>
        );
      })}

      {openIncident && (
        <Popup
          longitude={openIncident.lng}
          latitude={openIncident.lat}
          onClose={() => setOpenPopupId(null)}
          closeButton
          offset={20}
        >
          <div style={{ minWidth: 200, fontSize: 13, color: "#0f172a" }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{openIncident.title}</div>
            <div style={{ color: "#475569", marginBottom: 6 }}>{CATEGORY_LABELS[openIncident.category]}</div>
            {openIncident.location_label && <div style={{ marginBottom: 6 }}>{openIncident.location_label}</div>}
            {openIncident.slug && (
              <Link href={`/case-file/${openIncident.slug}`} style={{ fontWeight: 700, color: "#2563eb" }}>
                View case file →
              </Link>
            )}
          </div>
        </Popup>
      )}
    </>
  );
}
