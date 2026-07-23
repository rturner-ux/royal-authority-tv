import Link from "next/link";
import Navbar from "../components/Navbar";
import FeaturedCaseCard from "../components/FeaturedCaseCard";
import { getFeaturedCases } from "@/lib/cases";
import { COLLECTIONS } from "@/lib/collections";

// No auth/cookie call on this page to otherwise force per-request rendering,
// so without this it gets fully cached by Vercel at build/first-hit and
// never reflects later is_featured/is_hidden changes until the next deploy.
export const dynamic = "force-dynamic";

export default async function CaseFilePage() {
  const cases = await getFeaturedCases();

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-6">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Case Files" }]} />

        <div className="mb-12">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            Royal Authority TV
          </div>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Case Files</h1>
          <p className="mt-3 max-w-2xl text-gray-400">
            Investigative breakdowns. Real stories. Verified sources.
          </p>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {Object.values(COLLECTIONS).map((collection) => (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-[#C9A24A]/20 bg-gradient-to-r from-[#C9A24A]/[0.06] to-transparent p-6 transition hover:border-[#C9A24A]/40"
            >
              <div>
                <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
                  Collection
                </div>
                <h2 className="mt-2 text-xl font-bold text-white">{collection.name}</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">
                  {collection.description}
                </p>
              </div>
              <span className="flex-shrink-0 text-[#E8D19A] transition group-hover:translate-x-1">
                →
              </span>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((c) => (
            <FeaturedCaseCard key={c.id} incident={c} />
          ))}

          <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-zinc-800/30 text-center text-gray-500">
            <div className="px-6">
              <div className="text-sm uppercase tracking-[0.25em] text-gray-500">
                Coming Soon
              </div>
              <div className="mt-3 text-lg font-semibold text-gray-400">
                More cases will appear here
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
