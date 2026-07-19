import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { supabase } from "@/lib/supabase/server";
import { getSubscriberStatus } from "@/lib/subscription";
import { CATEGORY_LABELS } from "@/lib/labels";
import type { Incident } from "@/lib/types";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();
  const { user } = await getSubscriberStatus();
  const accountProps = user
    ? { accountLabel: "My Account", accountHref: "/account" }
    : { accountLabel: "Sign In", accountHref: "/login" };

  let results: Incident[] = [];

  if (query) {
    const { data } = await supabase()
      .from("incidents")
      .select("*")
      .eq("is_hidden", false)
      .not("slug", "is", null)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,location_label.ilike.%${query}%`)
      .order("published_at", { ascending: false })
      .limit(30);

    results = (data ?? []) as Incident[];
  }

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
          {...accountProps}
        />

        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            Search Results
          </div>
          <h1 className="mt-3 font-serif text-3xl text-white md:text-4xl">
            {query ? `"${query}"` : "Search Case Files"}
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            {query ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Enter a search term above."}
          </p>
        </div>

        {query && results.length === 0 && (
          <p className="text-sm text-slate-500">No cases matched your search.</p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((incident) => (
            <Link
              key={incident.id}
              href={`/case-file/${incident.slug}`}
              className="group overflow-hidden rounded-[24px] border border-white/10 bg-black/30 transition hover:border-[#C9A24A]/40"
            >
              <div className="relative h-40 w-full bg-white/[0.02]">
                {incident.image_url ? (
                  <Image
                    src={incident.image_url}
                    alt={incident.title}
                    fill
                    unoptimized
                    className="object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl text-white/10">?</div>
                )}
              </div>
              <div className="p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[#E8D19A]">
                  {CATEGORY_LABELS[incident.category]}
                </div>
                <h3 className="mt-1 line-clamp-2 font-serif text-lg text-white">
                  {incident.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
