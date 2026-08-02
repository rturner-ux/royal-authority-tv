import LiveLowerThird from "../../../components/LiveLowerThird";
import { getCurrentLiveStream } from "@/lib/live";

export const dynamic = "force-dynamic";

// Second OBS Browser Source alongside /live/overlay -- the animated
// case lower third, toggled live from the Studio page.
export default async function LiveCaseOverlayPage() {
  const liveStream = await getCurrentLiveStream();

  return (
    <>
      <style>{`html, body { background: transparent !important; }`}</style>
      {liveStream && (
        <LiveLowerThird
          streamId={liveStream.id}
          initial={{
            visible: liveStream.graphic_visible,
            title: liveStream.graphic_title,
            location: liveStream.graphic_location,
            status: liveStream.graphic_status,
          }}
        />
      )}
    </>
  );
}
