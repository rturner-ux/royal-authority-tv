import Navbar from "../components/Navbar";
import LivePlayer from "../components/LivePlayer";
import LiveChat from "../components/LiveChat";
import { getCurrentLiveStream } from "@/lib/live";
import { getSubscriberStatus } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default async function LivePage() {
  const [liveStream, { user }] = await Promise.all([getCurrentLiveStream(), getSubscriberStatus()]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Live" }]} />

        <div className="mb-8 flex items-center gap-4">
          {liveStream && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Live
            </span>
          )}
          <div>
            <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Royal Authority TV</div>
            <h1 className="mt-1 font-serif text-3xl font-bold md:text-4xl">
              {liveStream ? liveStream.title : "Live"}
            </h1>
          </div>
        </div>

        {liveStream ? (
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <LivePlayer playbackId={liveStream.mux_playback_id} title={liveStream.title} />
            <LiveChat streamId={liveStream.id} isSignedIn={Boolean(user)} />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-[32px] border border-white/10 bg-black/30 p-10 text-center backdrop-blur-sm">
            <p className="max-w-xs text-sm text-slate-400">Not live right now. Check back soon.</p>
          </div>
        )}
      </div>
    </main>
  );
}
