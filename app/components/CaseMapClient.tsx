"use client";

import dynamic from "next/dynamic";

const CaseMap = dynamic(() => import("./CaseMap"), { ssr: false });

export default function CaseMapClient(props: {
  lat: number;
  lng: number;
  label?: string | null;
}) {
  return <CaseMap {...props} />;
}
