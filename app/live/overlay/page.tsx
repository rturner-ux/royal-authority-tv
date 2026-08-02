import LiveChatOverlay from "../../components/LiveChatOverlay";
import { getCurrentLiveStream } from "@/lib/live";

export const dynamic = "force-dynamic";

// Meant to be added in OBS as a Browser Source over the broadcast video, not
// visited directly -- so the body background is forced transparent here
// (overriding the site-wide dark background) and there's no Navbar/chrome.
export default async function LiveOverlayPage() {
  const liveStream = await getCurrentLiveStream();

  return (
    <>
      <style>{`html, body { background: transparent !important; }`}</style>
      {liveStream && <LiveChatOverlay streamId={liveStream.id} />}
    </>
  );
}
