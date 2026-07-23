import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import CaseCard from "../../components/CaseCard";
import { getCasesByCollection } from "@/lib/cases";
import { getCollection, genreSlug } from "@/lib/collections";

// No auth/cookie call on this page to otherwise force per-request rendering,
// so without this it gets fully cached by Vercel and never reflects later
// collection_slug/genre changes until the next deploy.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "Royal Authority TV" };
  return {
    title: `${collection.name} | Royal Authority TV`,
    description: collection.description,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const cases = await getCasesByCollection(slug);

  const genreGroups = new Map<string, { genre: string; count: number }>();
  const uncategorized: typeof cases = [];

  for (const c of cases) {
    if (!c.genre) {
      uncategorized.push(c);
      continue;
    }
    const key = genreSlug(c.genre);
    const existing = genreGroups.get(key);
    if (existing) existing.count += 1;
    else genreGroups.set(key, { genre: c.genre, count: 1 });
  }

  const genres = Array.from(genreGroups.entries()).sort((a, b) => b[1].count - a[1].count);

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-6">
        <Navbar
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Case Files", href: "/case-file" },
            { label: collection.name },
          ]}
        />

        <div className="mb-12">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            Collection
          </div>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">{collection.name}</h1>
          <p className="mt-3 max-w-2xl text-gray-400">{collection.description}</p>
        </div>

        {genres.length > 0 ? (
          <>
            <div className="mb-4 text-xs uppercase tracking-[0.25em] text-gray-500">
              Browse by Genre
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {genres.map(([key, group]) => (
                <Link
                  key={key}
                  href={`/collections/${slug}/${key}`}
                  className="group flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 p-6 transition hover:scale-[1.02] hover:border-[#C9A24A]/30"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white">{group.genre}</h3>
                    <p className="mt-2 text-sm text-gray-400">
                      {group.count} {group.count === 1 ? "case" : "cases"}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-[#E8D19A] transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              ))}
            </div>

            {uncategorized.length > 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-zinc-800/20 p-6 text-sm text-gray-500">
                {uncategorized.length} {uncategorized.length === 1 ? "case hasn't" : "cases haven't"} been assigned a genre yet.
              </div>
            )}
          </>
        ) : cases.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cases.map((c) => (
              <CaseCard key={c.id} incident={c} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-zinc-800/30 text-center text-gray-500">
            <div className="px-6">
              <div className="text-sm uppercase tracking-[0.25em] text-gray-500">
                Coming Soon
              </div>
              <div className="mt-3 text-lg font-semibold text-gray-400">
                No cases in this collection yet
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
