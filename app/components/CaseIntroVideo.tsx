export default function CaseIntroVideo({ url, title }: { url: string; title: string }) {
  return (
    <section className="mb-12 overflow-hidden rounded-[32px] border border-[#C9A24A]/30 bg-black/30 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-6 pt-6">
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#E8D19A]">Case Intro</div>
      </div>
      <div className="relative mt-4 aspect-video w-full">
        <video
          src={url}
          controls
          playsInline
          className="absolute inset-0 h-full w-full bg-black"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      <p className="px-6 pb-6 pt-3 text-xs text-slate-500">
        AI-generated presentation summarizing {title}, based on the sourced Case Log below.
      </p>
    </section>
  );
}
