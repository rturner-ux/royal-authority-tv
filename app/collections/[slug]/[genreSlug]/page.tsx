import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "../../../components/Navbar";
import CaseCard from "../../../components/CaseCard";
import { getCasesByCollection } from "@/lib/cases";
import { getCollection, genreSlug } from "@/lib/collections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; genreSlug: string }>;
}): Promise<Metadata> {
  const { slug, genreSlug: targetGenreSlug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "Royal Authority TV" };

  const cases = await getCasesByCollection(slug);
  const match = cases.find((c) => c.genre && genreSlug(c.genre) === targetGenreSlug);
  const genreName = match?.genre ?? "";

  return {
    title: `${collection.name}${genreName ? ` in ${genreName}` : ""} | Royal Authority TV`,
    description: collection.description,
  };
}

export default async function CollectionGenrePage({
  params,
}: {
  params: Promise<{ slug: string; genreSlug: string }>;
}) {
  const { slug, genreSlug: targetGenreSlug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const allCases = await getCasesByCollection(slug);
  const cases = allCases.filter((c) => c.genre && genreSlug(c.genre) === targetGenreSlug);
  if (cases.length === 0) notFound();

  const genreName = cases[0].genre;

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
            { label: collection.name, href: `/collections/${slug}` },
            { label: genreName! },
          ]}
        />

        <div className="mb-12">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            {collection.name}
          </div>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">{genreName}</h1>
          <p className="mt-3 max-w-2xl text-gray-400">
            {cases.length} {cases.length === 1 ? "case" : "cases"} in this collection from {genreName}.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((c) => (
            <CaseCard key={c.id} incident={c} />
          ))}
        </div>
      </div>
    </main>
  );
}
