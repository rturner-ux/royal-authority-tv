import Navbar from "../components/Navbar";
import SiteMapClient from "../components/SiteMapClientGL";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function MapPage({ embedded }: { embedded?: boolean } = {}) {
  const { isActive } = await getSubscriberStatus();

  return (
    <main className="relative flex h-screen flex-col bg-[#05070b] text-white">
      <div className="mx-auto w-full max-w-7xl px-6 pt-6">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Investigation Map" }]} embedded={embedded} />
      </div>
      <div className="relative flex-1">
        <SiteMapClient isActive={isActive} />
      </div>
    </main>
  );
}
