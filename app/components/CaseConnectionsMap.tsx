"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { CaseConnectionNode, CaseConnectionEdge, ConnectionRelationshipType } from "@/lib/types";

const RELATIONSHIP_STYLE: Record<ConnectionRelationshipType, { label: string; color: string; dashed: boolean }> = {
  parent: { label: "Parent / Step-Parent", color: "#C9A24A", dashed: false },
  grandparent: { label: "Grandparent / Grandchild", color: "#60a5fa", dashed: false },
  sibling: { label: "Sibling", color: "#4ade80", dashed: false },
  spouse: { label: "Spouse", color: "#f472b6", dashed: false },
  possible: { label: "Possible Family Tie (unconfirmed)", color: "#94a3b8", dashed: true },
};

function ConnectionNodeCard({ data }: NodeProps) {
  const node = data as unknown as CaseConnectionNode;

  return (
    <div className="w-[220px] rounded-2xl border border-white/15 bg-[#0b1220] p-4 shadow-lg">
      <Handle type="target" position={Position.Top} className="!bg-[#C9A24A]" />
      <Handle type="source" position={Position.Bottom} className="!bg-[#C9A24A]" />

      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5">
          {node.photo_url ? (
            <Image src={node.photo_url} alt={node.name} fill unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg text-white/20">
              {node.is_unidentified ? "?" : node.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          {node.group_label && (
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#E8D19A]">
              {node.group_label}
            </div>
          )}
          <div className="truncate text-sm font-semibold text-white">{node.name}</div>
          {node.subtitle && <div className="truncate text-xs text-slate-400">{node.subtitle}</div>}
        </div>
      </div>

      {node.details.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-white/10 pt-3">
          {node.details.map((d, i) => (
            <li key={i} className="text-xs leading-5 text-slate-300">
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const nodeTypes = { connectionCard: ConnectionNodeCard };

export default function CaseConnectionsMap({
  nodes: rawNodes,
  edges: rawEdges,
}: {
  nodes: CaseConnectionNode[];
  edges: CaseConnectionEdge[];
}) {
  const nodes: Node[] = useMemo(
    () =>
      rawNodes.map((n) => ({
        id: n.id,
        type: "connectionCard",
        position: { x: n.position_x, y: n.position_y },
        data: n as unknown as Record<string, unknown>,
      })),
    [rawNodes]
  );

  const edges: Edge[] = useMemo(
    () =>
      rawEdges.map((e) => {
        const style = RELATIONSHIP_STYLE[e.relationship_type];
        return {
          id: e.id,
          source: e.from_node_id,
          target: e.to_node_id,
          style: { stroke: style.color, strokeWidth: 2, strokeDasharray: style.dashed ? "6 4" : undefined },
        };
      }),
    [rawEdges]
  );

  const usedRelationships = useMemo(
    () => Array.from(new Set(rawEdges.map((e) => e.relationship_type))),
    [rawEdges]
  );

  const [expanded, setExpanded] = useState(false);

  if (rawNodes.length === 0) return null;

  return (
    <section className="mt-10 rounded-[32px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">Connections Map</div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5"
        >
          {expanded ? "Minimize" : "Expand"}
        </button>
      </div>

      {expanded ? (
        <>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Drag to rearrange, scroll to zoom. Dashed lines mark relationships that have not been confirmed.
          </p>

          <div className="mt-5 h-[520px] w-full overflow-hidden rounded-2xl border border-white/10">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#ffffff10" gap={24} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>

          {usedRelationships.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {usedRelationships.map((r) => {
                const style = RELATIONSHIP_STYLE[r];
                return (
                  <div key={r} className="flex items-center gap-2 text-xs text-slate-400">
                    <span
                      className="inline-block h-0.5 w-6"
                      style={{
                        backgroundColor: style.dashed ? "transparent" : style.color,
                        borderTop: style.dashed ? `2px dashed ${style.color}` : undefined,
                      }}
                    />
                    {style.label}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          {rawNodes.length} {rawNodes.length === 1 ? "person" : "people"} mapped in this case's relationship diagram.
        </p>
      )}
    </section>
  );
}
