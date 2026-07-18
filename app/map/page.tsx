import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import SiteMapClient from "../components/SiteMapClient";

export default function MapPage() {
  return (
    <main className="relative flex h-screen flex-col bg-[#05070b] text-white">
      <div className="mx-auto w-full max-w-7xl px-6 pt-6">
        <Navbar rightButtonLabel="Case Files" rightButtonHref="/case-file" />
      </div>
      <div className="relative flex-1">
        <SiteMapClient />
      </div>
    </main>
  );
}
