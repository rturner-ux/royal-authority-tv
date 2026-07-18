import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { getCaseBySlug } from "@/lib/cases";

export default async function CaseTranscriptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getCaseBySlug(slug);
  if (!result || result.transcript.length === 0) notFound();

  const { incident, transcript } = result;
  const isDualLanguage = transcript.some((r) => r.translated_text);

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar rightButtonLabel="Case Files" rightButtonHref="/case-file" />

        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            Royal Authority TV
          </div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">
            {incident.source_name}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            Full source transcript for the {incident.title} case
            {isDualLanguage ? ", presented in a dual-language archive format." : "."}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/transcript"
            className="rounded-xl border border-white/20 px-4 py-2 text-sm transition hover:bg-white hover:text-black"
          >
            ← Back to Transcript Archive
          </Link>

          <Link
            href={`/case-file/${slug}`}
            className="rounded-xl bg-[#C9A24A] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
          >
            Open Related Case File
          </Link>
        </div>

        <section className="overflow-hidden rounded-[34px] border border-[#C9A24A]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-2xl shadow-black/30">
          <div className="border-b border-white/10 px-7 py-6 md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
                  Transcript
                </div>
                <h2 className="mt-2 font-serif text-2xl text-white md:text-3xl">
                  {incident.title}
                </h2>
              </div>
              <div className="rounded-full border border-red-500/35 bg-red-500/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-red-200">
                Full Transcript
              </div>
            </div>
          </div>

          {isDualLanguage ? (
            <>
              <div className="grid md:grid-cols-2">
                <div className="border-b border-white/10 px-7 py-4 text-xs uppercase tracking-[0.28em] text-[#E8D19A] md:border-b-0 md:border-r">
                  Original ({transcript[0].original_language})
                </div>
                <div className="px-7 py-4 text-xs uppercase tracking-[0.28em] text-[#E8D19A]">
                  Direct {transcript[0].translated_language} Translation
                </div>
              </div>

              <div className="divide-y divide-white/10">
                {transcript.map((row) => (
                  <div key={row.id} className="grid md:grid-cols-2">
                    <div className="border-b border-white/10 px-7 py-5 text-sm leading-8 text-slate-200 md:border-b-0 md:border-r">
                      {row.original_text}
                    </div>
                    <div className="px-7 py-5 text-sm leading-8 text-slate-300">
                      {row.translated_text}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="divide-y divide-white/10">
              {transcript.map((row) => (
                <div key={row.id} className="px-7 py-5">
                  {row.speaker_label && (
                    <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[#E8D19A]">
                      {row.speaker_label}
                    </div>
                  )}
                  <p className="text-sm leading-8 text-slate-200">{row.original_text}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
