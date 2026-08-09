import Navbar from "../components/Navbar";
import SiteMapClientGL from "../components/SiteMapClientGL";
import { getSubscriberStatus } from "@/lib/subscription";

// Temporary, unlinked verification route for the Leaflet -> MapLibre GL
// migration. Not linked from anywhere in the site nav. Removed once the
// migration cuts over /map itself to SiteMapClientGL -- see the migration
// plan for the phase breakdown.
export default async function MapGLTestPage() {
  const { isActive } = await getSubscriberStatus();

  return (
    <main className="relative flex h-screen flex-col bg-[#05070b] text-white">
      <div className="mx-auto w-full max-w-7xl px-6 pt-6">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Investigation Map (GL preview)" }]} />
      </div>
      <div className="relative flex-1">
        <SiteMapClientGL isActive={isActive} />
      </div>
    </main>
  );
}
