import Link from "next/link";
import Navbar from "../components/Navbar";

const transcriptItems = [
  {
    slug: "ashlee",
    tag: "Featured Press Conference",
    title: "Zanzibar Police Press Conference",
    subtitle: "Ashlee Robinson case",
    description:
      "Official dual-language transcript of the Zanzibar police statement with direct English translation.",
  },
  {
    slug: "coming-soon-1",
    tag: "Archive",
    title: "More press conferences coming",
    subtitle: "Transcript library expanding",
    description:
      "Future official statements, translated briefings, and source-based transcript resources will appear here.",
  },
];

export default function TranscriptArchivePage() {
  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar rightButtonLabel="Case Files" rightButtonHref="/case-file" />

        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            Royal Authority TV
          </div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">
            Transcript Archive
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            Source transcripts, press conferences, translated statements, and
            archive-ready reference material.
          </p>
        </div>

        {/* Search Bar */}
        <section className="mb-10">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
            <div className="mb-3 text-xs uppercase tracking-[0.28em] text-[#E8D19A]">
              Search Archive
            </div>
            <input
              type="text"
              placeholder="Search transcripts, press conferences, names, or locations..."
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
            />
          </div>
        </section>

        {/* Transcript Cards */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/transcript/ashlee"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:scale-[1.02] hover:border-[#C9A24A]/30"
          >
            <div className="text-xs uppercase tracking-[0.22em] text-red-400">
              {transcriptItems[0].tag}
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white">
              {transcriptItems[0].title}
            </h2>
            <div className="mt-2 text-sm font-medium text-[#E8D19A]">
              {transcriptItems[0].subtitle}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              {transcriptItems[0].description}
            </p>
            <div className="mt-6 text-sm font-semibold text-[#C9A24A] transition group-hover:text-white">
              Open Transcript →
            </div>
          </Link>

          <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-800/30 p-6 text-gray-500">
            <div className="text-xs uppercase tracking-[0.22em] text-gray-500">
              {transcriptItems[1].tag}
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-300">
              {transcriptItems[1].title}
            </h2>
            <div className="mt-2 text-sm font-medium text-gray-400">
              {transcriptItems[1].subtitle}
            </div>
            <p className="mt-4 text-sm leading-7 text-gray-500">
              {transcriptItems[1].description}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}