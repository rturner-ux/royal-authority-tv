import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { getSubscriberStatus } from "@/lib/subscription";
import { getAllVisibleCasesForPatternIntelligence } from "@/lib/cases";
import { findCaseClusters, findDisputedRulingClusters, findCollectionClusters } from "@/lib/patternIntelligence";
import type { CaseCluster, CollectionCluster } from "@/lib/patternIntelligence";
import { getCollection } from "@/lib/collections";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";

const BUCKET_LABELS: Record<string, string> = {
  disputed_ruling: "Disputed Ruling Pattern",
  homicide: "Homicide / Criminal Investigation Pattern",
  missing: "Missing Persons Pattern",
  drowning: "Drowning Report Pattern",
};

function isCollectionCluster(cluster: CaseCluster | CollectionCluster): cluster is CollectionCluster {
  return "collectionSlug" in cluster;
}

export default async function PatternIntelligencePage({ embedded }: { embedded?: boolean } = {}) {
  const { user, isActive } = await getSubscriberStatus();

  if (!user) {
    redirect("/login?next=/pattern-intelligence");
  }

  const allCases = isActive ? await getAllVisibleCasesForPatternIntelligence() : [];
  // Editorially-confirmed collection patterns lead -- a deliberate,
  // human-curated grouping (e.g. Hanging Death Investigations) is a
  // stronger signal than anything geo/time coincidence can surface, so it
  // ranks above disputed-ruling and category clusters, not just by size.
  const clusters: (CaseCluster | CollectionCluster)[] = isActive
    ? [...findCollectionClusters(allCases), ...findDisputedRulingClusters(allCases), ...findCaseClusters(allCases)]
    : [];

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Pattern Intelligence" }]} embedded={embedded} />

        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Subscriber Access</div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">Pattern Intelligence</h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            Surfaces cases across the map that share location, timing, and category proximity, and
            separately flags cases where a family or independent account disputes the official
            ruling, for pattern awareness.
          </p>
        </div>

        <div className="mb-8 max-w-3xl rounded-[24px] border border-amber-500/30 bg-amber-500/[0.06] p-5 text-sm leading-7 text-amber-100/90">
          <span className="font-bold uppercase tracking-wide text-amber-300">Important:</span>{" "}
          This tool does not identify, accuse, or name any individual as responsible for any
          crime. It surfaces cases that happen to share geographic and time proximity, nothing
          more. Two unrelated cases can share these traits by pure coincidence. Overlap shown
          here is not evidence of a connection, and nothing on this page should be treated as an
          accusation against any named person.
        </div>

        {!isActive ? (
          <div className="max-w-md rounded-[30px] border border-[#C9A24A]/30 bg-[#C9A24A]/10 p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D19A]">
              Locked
            </div>
            <h2 className="mt-3 font-serif text-2xl text-white">Subscribe to Unlock</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Pattern Intelligence is reserved for active subscribers. Subscribe for $4.99/mo to
              see cases clustered by location, timing, and category across the entire map.
            </p>
            <Link
              href="/subscribe"
              className="mt-6 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Subscribe for $4.99/mo
            </Link>
          </div>
        ) : clusters.length === 0 ? (
          <div className="max-w-md rounded-[30px] border border-white/10 bg-black/30 p-8 text-sm leading-7 text-slate-300">
            No cases currently share close enough location, timing, and category overlap to
            surface a cluster. Check back as new cases are added.
          </div>
        ) : (
          <div className="space-y-6">
            {clusters.map((cluster, i) => {
              const isDisputed = cluster.bucket === "disputed_ruling";
              const isCollection = isCollectionCluster(cluster);
              const collection = isCollectionCluster(cluster) ? getCollection(cluster.collectionSlug) : null;
              const dominantState = isCollectionCluster(cluster) ? cluster.dominantState : null;
              return (
              <section
                key={i}
                className={`rounded-[30px] border p-6 backdrop-blur-sm ${
                  isCollection
                    ? "border-red-500/50 bg-red-500/[0.06] shadow-[0_0_40px_-12px_rgba(239,68,68,0.35)]"
                    : isDisputed
                    ? "border-amber-500/40 bg-amber-500/[0.04]"
                    : "border-white/10 bg-black/30"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div
                    className={`flex items-center gap-2 text-xs uppercase tracking-[0.26em] ${
                      isCollection ? "text-red-400" : isDisputed ? "text-amber-300" : "text-[#E8D19A]"
                    }`}
                  >
                    {isCollection && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 flex-shrink-0">
                        <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {isCollection ? collection?.name || BUCKET_LABELS[cluster.bucket] || cluster.bucket : BUCKET_LABELS[cluster.bucket] || cluster.bucket}
                  </div>
                  <div className="text-xs text-slate-500">
                    {cluster.cases.length} cases
                    {!isCollection && (
                      <>
                        {" "}&middot; within {cluster.maxDistanceMiles} mi &middot; spans {cluster.spanMonths} mo
                      </>
                    )}
                  </div>
                </div>

                {isCollection && (
                  <p className="mt-2 text-xs leading-6 text-red-100/80">
                    {collection?.description}
                  </p>
                )}

                {dominantState && (
                  <p className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-200">
                    ⚑ {dominantState.count} of {cluster.cases.length} cases in this pattern are in{" "}
                    {dominantState.state} -- the largest single-state concentration.
                  </p>
                )}

                {isDisputed && (
                  <p className="mt-2 text-xs leading-6 text-amber-100/80">
                    Each case below has at least one update where a family member or an independent
                    account contradicts the official version of events. These cases happen to share
                    geography and timing, but that overlap alone does not mean they are connected.
                  </p>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cluster.cases.map((c) => {
                    const inner = (
                      <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25">
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-black"
                          style={{ backgroundColor: CATEGORY_COLORS[c.category] }}
                        >
                          {CATEGORY_LABELS[c.category]}
                        </span>
                        <div className="mt-2 line-clamp-2 text-sm font-bold leading-tight text-white">
                          {c.title}
                        </div>
                        <div className="mt-1.5 text-xs text-slate-500">
                          {c.location_label || "Location unavailable"}
                          {" · "}
                          {new Date(c.occurred_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                        </div>
                      </div>
                    );
                    return c.slug ? (
                      <Link key={c.id} href={`${embedded ? "/account/case-file" : "/case-file"}/${c.slug}`}>
                        {inner}
                      </Link>
                    ) : (
                      <div key={c.id}>{inner}</div>
                    );
                  })}
                </div>
              </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
