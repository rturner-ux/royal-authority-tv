"use client";

import dynamic from "next/dynamic";

const SiteMap = dynamic(() => import("./SiteMap"), { ssr: false });

export default function SiteMapClient({ isActive = false }: { isActive?: boolean }) {
  return <SiteMap isActive={isActive} />;
}
