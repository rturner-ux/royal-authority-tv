"use client";

import { useState, type ReactNode } from "react";

// Reusable chevron tab hugging either edge of the map, vertically centered
// -- matches maps.deflock.org's reference collapsed-sidebar treatment.
// Used for both Filter Cases (left) and the Map Layers stack (right),
// replacing each panel's own previous labeled-pill-button chrome. The
// panel content is positioned absolutely relative to the tab (not in
// normal flex flow), so its width never affects the tab's own position at
// the edge, collapsed or expanded.
export default function CollapsibleEdgeTab({
  side,
  badge,
  children,
}: {
  side: "left" | "right";
  badge?: number;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLeft = side === "left";

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        [isLeft ? "left" : "right"]: 0,
        transform: "translateY(-50%)",
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? "Collapse panel" : "Expand panel"}
        style={{
          position: "relative",
          width: 26,
          height: 56,
          background: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderLeft: isLeft ? "1px solid rgba(255,255,255,0.1)" : "none",
          borderRight: isLeft ? "none" : "1px solid rgba(255,255,255,0.1)",
          borderTopLeftRadius: isLeft ? 0 : 10,
          borderBottomLeftRadius: isLeft ? 0 : 10,
          borderTopRightRadius: isLeft ? 10 : 0,
          borderBottomRightRadius: isLeft ? 10 : 0,
          color: "#E8D19A",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}
      >
        <span style={{ fontSize: 15, transform: isLeft === expanded ? "scaleX(-1)" : undefined }}>›</span>
        {!!badge && badge > 0 && (
          <span
            style={{
              position: "absolute",
              top: -6,
              [isLeft ? "right" : "left"]: -6,
              minWidth: 16,
              height: 16,
              padding: "0 3px",
              borderRadius: 999,
              background: "#C9A24A",
              color: "#0f172a",
              fontSize: 10,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {badge}
          </span>
        )}
      </button>

      <div
        style={{
          position: "absolute",
          top: 0,
          [isLeft ? "left" : "right"]: "100%",
          width: 220,
          maxWidth: "calc(100vw - 4rem)",
          transform: expanded ? "translateX(0)" : `translateX(${isLeft ? "-" : ""}16px)`,
          opacity: expanded ? 1 : 0,
          transition: "transform 220ms ease-out, opacity 180ms ease-out",
          pointerEvents: expanded ? "auto" : "none",
        }}
        className="rounded-xl border border-white/10 bg-[#0f172a]/55 p-4 text-xs text-slate-200 backdrop-blur-sm"
      >
        {children}
      </div>
    </div>
  );
}
