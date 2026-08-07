import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/Navbar";
import DiscussionSection from "./DiscussionSection";
import { getCaseBySlug } from "@/lib/cases";
import { getSubscriberStatus } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default async function DiscussionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getCaseBySlug(slug);
  if (!result) notFound();

  const { incident } = result;
  const { user } = await getSubscriberStatus();

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-6 lg:px-10">
        <Navbar
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Case Files", href: "/case-file" },
            { label: incident.title, href: `/case-file/${slug}` },
            { label: "Discussion" },
          ]}
        />

        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Case Discussion</div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">{incident.title}</h1>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            Discuss case facts, the timeline, and the available record. Keep it factual and respectful, and
            don&apos;t post private information, unsupported accusations as fact, or harassment toward anyone
            connected to the case. Read the{" "}
            <Link href="/community-guidelines" className="text-[#E8D19A] hover:underline">
              Community Guidelines
            </Link>
            .
          </p>
        </div>

        <DiscussionSection incidentId={incident.id} initialShareCount={incident.share_count} isSignedIn={!!user} />
      </div>
    </main>
  );
}
