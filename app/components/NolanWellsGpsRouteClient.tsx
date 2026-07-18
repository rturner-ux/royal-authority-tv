"use client";

import dynamic from "next/dynamic";

const NolanWellsGpsRoute = dynamic(() => import("./NolanWellsGpsRoute"), { ssr: false });

export default function NolanWellsGpsRouteClient() {
  return <NolanWellsGpsRoute />;
}
