import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { getSubscriberStatus } from "@/lib/subscription";
import { getAllVisibleCasesForPatternIntelligence } from "@/lib/cases";
import { findCaseClusters, findDisputedRulingClusters, findStateMethodTrends } from "@/lib/patternIntelligence";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";

const BUCKET_LABELS: Record<string, string> = {
  disputed_ruling: "Disputed Ruling Pattern",
  homicide: "Homicide / Criminal Investigation Pattern",
  missing: "Missing Persons Pattern",
  drowning: "Drowning Report Pattern",
  other: "Cross-Category Pattern",
};

export default async function PatternIntelligencePage({ embedded }: { embedded?: boolean } = {}) {
  const { user, isActive } = await getSubscriberStatus();

  if (!user) {
    redirect("/login?next=/pattern-intelligence");
  }

  const allCases = isActive ? await getAllVisibleCasesForPatternIntelligence() : [];
  // Disputed-ruling clusters go first -- a family or independent account
  // contradicting the official version of events, in more than one nearby
  // case, is the highest-signal pattern this tool can surface with current
  // data, so it leads rather than sorting purely by cluster size.
  const clusters = isActive
    ? [...findDisputedRulingClusters(allCases), ...findCaseClusters(allCases)]
    : [];
  const trends = isActive ? findStateMethodTrends(allCases) : [];

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Pattern Intelligence" }]} embedded={embedded} />

        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Subscriber Access</div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">Pattern Intelligence</h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            Surfaces cases across the map that share timing, distance, and real similarity --
            method of death, victim demographics, or category -- and separately flags cases where
            a family or independent account disputes the official ruling.
          </p>
          <Link href="/history" className="mt-3 inline-flex items-center gap-2 text-sm text-[#E8D19A] hover:underline">
            Read the documented history behind the disputed-ruling pattern →
          </Link>
        </div>

        <div className="mb-8 max-w-3xl rounded-[24px] border border-amber-500/30 bg-amber-500/[0.06] p-5 text-sm leading-7 text-amber-100/90">
          <span className="font-bold uppercase tracking-wide text-amber-300">Important:</span>{" "}
          This tool does not identify, accuse, or name any individual as responsible for any
          crime. It surfaces cases that happen to share timing, distance, and similarity, nothing
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
              see cases clustered by timing, distance, and similarity across the entire map.
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
            No cases currently share close enough timing, distance, and similarity to surface a
            cluster. Check back as new cases are added.
          </div>
        ) : (
          <div className="space-y-6">
            {clusters.map((cluster, i) => {
              const isDisputed = cluster.bucket === "disputed_ruling";
              return (
              <section
                key={i}
                className={`rounded-[30px] border p-6 backdrop-blur-sm ${
                  isDisputed ? "border-amber-500/40 bg-amber-500/[0.04]" : "border-white/10 bg-black/30"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div
                    className={`text-xs uppercase tracking-[0.26em] ${isDisputed ? "text-amber-300" : "text-[#E8D19A]"}`}
                  >
                    {BUCKET_LABELS[cluster.bucket] || cluster.bucket}
                  </div>
                  <div className="text-xs text-slate-500">
                    {cluster.cases.length} cases &middot; within {cluster.maxDistanceMiles} mi &middot;
                    spans {cluster.spanMonths} mo
                  </div>
                </div>

                {cluster.reasons.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cluster.reasons.map((reason) => (
                      <span
                        key={reason}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          isDisputed
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                            : "border-[#C9A24A]/30 bg-[#C9A24A]/10 text-[#E8D19A]"
                        }`}
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
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

        {isActive && trends.length > 0 && (
          <div className="mt-12">
            <div className="mb-2 text-xs uppercase tracking-[0.34em] text-slate-500">Long-Running Trends</div>
            <p className="mb-6 max-w-3xl text-sm leading-7 text-slate-400">
              Not a tight cluster -- these cases share a method and a state, but happened years
              apart, not close together in time. This is a different signal: not "these happened
              together," but "this keeps happening here."
            </p>
            <div className="space-y-4">
              {trends.map((trend, i) => (
                <section key={i} className="rounded-[30px] border border-sky-500/30 bg-sky-500/[0.04] p-6 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs uppercase tracking-[0.26em] text-sky-300">
                      {trend.method.replace(/_/g, " ")} deaths in {trend.state}
                    </div>
                    <div className="text-xs text-slate-500">
                      {trend.cases.length} cases &middot; over {trend.spanYears} {trend.spanYears === 1 ? "year" : "years"}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {trend.cases.map((c) => {
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
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
