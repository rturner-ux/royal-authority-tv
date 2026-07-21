import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import { getCasesByCollection } from "@/lib/cases";
import { getCollection } from "@/lib/collections";
import { CATEGORY_LABELS } from "@/lib/labels";

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

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((c) => (
            <Link
              key={c.id}
              href={`/case-file/${c.slug}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 transition hover:scale-[1.02] hover:border-[#C9A24A]/30"
            >
              <div className="relative h-[280px] overflow-hidden border-b border-white/10 bg-gradient-to-b from-white/[0.02] to-white/[0.01]">
                {c.image_url ? (
                  <Image
                    src={c.image_url}
                    alt={c.title}
                    fill
                    unoptimized
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl text-white/10">?</div>
                )}
              </div>

              <div className="space-y-3 p-5">
                <span className="text-xs tracking-[0.2em] text-red-400">
                  {CATEGORY_LABELS[c.category].toUpperCase()}
                </span>

                <h3 className="text-xl font-bold text-white">{c.title}</h3>

                <p className="text-sm leading-6 text-gray-400">
                  {c.location_label || ""}
                </p>

                <div className="pt-2">
                  <span className="text-sm font-semibold text-[#C9A24A] transition group-hover:text-white">
                    Open Case →
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {cases.length === 0 && (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-zinc-800/30 text-center text-gray-500 md:col-span-2 xl:col-span-3">
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
      </div>
    </main>
  );
}
