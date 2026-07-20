import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { getSubscriberStatus } from "@/lib/subscription";
import { getAllVisibleCases } from "@/lib/cases";
import { findCaseClusters } from "@/lib/patternIntelligence";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";

const BUCKET_LABELS: Record<string, string> = {
  homicide: "Homicide / Criminal Investigation Pattern",
  missing: "Missing Persons Pattern",
  drowning: "Drowning Report Pattern",
};

export default async function PatternIntelligencePage() {
  const { user, isActive } = await getSubscriberStatus();

  if (!user) {
    redirect("/login?next=/pattern-intelligence");
  }

  const clusters = isActive ? findCaseClusters(await getAllVisibleCases()) : [];

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Pattern Intelligence" }]} />

        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Subscriber Access</div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">Pattern Intelligence</h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            Surfaces cases across the map that share location, timing, and category proximity,
            for pattern awareness.
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
            {clusters.map((cluster, i) => (
              <section
                key={i}
                className="rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
                    {BUCKET_LABELS[cluster.bucket] || cluster.bucket}
                  </div>
                  <div className="text-xs text-slate-500">
                    {cluster.cases.length} cases &middot; within {cluster.maxDistanceMiles} mi &middot;
                    spans {cluster.spanMonths} mo
                  </div>
                </div>

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
                          {new Date(c.published_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                        </div>
                      </div>
                    );
                    return c.slug ? (
                      <Link key={c.id} href={`/case-file/${c.slug}`}>
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
        )}
      </div>
    </main>
  );
}
