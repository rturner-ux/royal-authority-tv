import Navbar from "../components/Navbar";
import LivePlayer from "../components/LivePlayer";
import LiveChat from "../components/LiveChat";
import { getCurrentLiveStream } from "@/lib/live";
import { getSubscriberStatus } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default async function LivePage() {
  const [liveStream, { user }] = await Promise.all([getCurrentLiveStream(), getSubscriberStatus()]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 pb-20 pt-6 text-white">
      <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Live" }]} />

      <h1 className="mb-6 font-serif text-3xl font-bold md:text-4xl">
        {liveStream ? liveStream.title : "Live"}{" "}
        {liveStream && (
          <span className="align-middle text-lg font-bold text-red-500">&#9679; LIVE</span>
        )}
      </h1>

      {liveStream ? (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <LivePlayer playbackId={liveStream.mux_playback_id} title={liveStream.title} />
          <LiveChat streamId={liveStream.id} isSignedIn={Boolean(user)} />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-black p-10 text-center">
          <p className="max-w-xs text-sm text-slate-500">Not live right now. Check back soon.</p>
        </div>
      )}
    </main>
  );
}
