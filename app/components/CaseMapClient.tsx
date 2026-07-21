"use client";

import dynamic from "next/dynamic";

const CaseMap = dynamic(() => import("./CaseMap"), { ssr: false });

export default function CaseMapClient(props: {
  lat: number;
  lng: number;
  label?: string | null;
  preciseLat?: number | null;
  preciseLng?: number | null;
  preciseLabel?: string | null;
  isActive?: boolean;
  onDeepZoomChange?: (deepZoomed: boolean) => void;
}) {
  return <CaseMap {...props} />;
}
