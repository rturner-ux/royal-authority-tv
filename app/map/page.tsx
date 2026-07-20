import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import SiteMapClient from "../components/SiteMapClient";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function MapPage() {
  const { isActive } = await getSubscriberStatus();

  return (
    <main className="relative flex h-screen flex-col bg-[#05070b] text-white">
      <div className="mx-auto w-full max-w-7xl px-6 pt-6">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Investigation Map" }]} />
      </div>
      <div className="relative flex-1">
        <SiteMapClient isActive={isActive} />
      </div>
    </main>
  );
}
