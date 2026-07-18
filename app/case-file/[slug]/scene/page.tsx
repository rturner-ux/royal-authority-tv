import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/Navbar";
import CaseMapClient from "../../../components/CaseMapClient";
import AshleeSceneReconstruction from "../../../components/AshleeSceneReconstruction";
import { getCaseBySlug } from "@/lib/cases";

export default async function SceneAnalysisPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getCaseBySlug(slug);
  if (!result || !result.incident.scene_description) notFound();

  const { incident } = result;

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar rightButtonLabel="Back to Case" rightButtonHref={`/case-file/${slug}`} />

        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            Scene Analysis
          </div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">
            {incident.location_label || incident.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            {incident.scene_description}
          </p>
        </div>

        {slug === "ashlee-robinson" ? (
          <AshleeSceneReconstruction />
        ) : (
          <section className="mb-10 overflow-hidden rounded-[32px] border border-white/10 bg-black/30 backdrop-blur-sm">
            <div className="p-6 pb-0 text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
              Location
            </div>
            <div className="h-[480px] w-full">
              <CaseMapClient lat={incident.lat} lng={incident.lng} label={incident.location_label} />
            </div>
          </section>
        )}

        <div className="mt-4">
          <Link
            href={`/case-file/${slug}`}
            className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            ← Back to Case
          </Link>
        </div>
      </div>
    </main>
  );
}
