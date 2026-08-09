"use client";

import dynamic from "next/dynamic";

const SiteMapGL = dynamic(() => import("./SiteMapGL"), { ssr: false });

export default function SiteMapClientGL({ isActive = false }: { isActive?: boolean }) {
  return <SiteMapGL isActive={isActive} />;
}
