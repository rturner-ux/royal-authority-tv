import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import MemberRoomForm from "./MemberRoomForm";
import { getSubscriberStatus } from "@/lib/subscription";
import { supabase } from "@/lib/supabase/server";

export default async function MemberRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { user, isActive } = await getSubscriberStatus();

  if (!user) {
    redirect(`/login?next=/case-file/${slug}/member-room`);
  }

  const { data: incident } = await supabase()
    .from("incidents")
    .select("id, title")
    .eq("slug", slug)
    .maybeSingle();

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Case Files", href: "/case-file" },
            { label: incident?.title || slug.replace(/-/g, " "), href: `/case-file/${slug}` },
            { label: "Member Room" },
          ]}
        />

        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            Subscriber Access
          </div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">
            Case Member Room
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            Private space for subscribers to submit questions, request deeper
            breakdowns, and follow premium case updates.
          </p>
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
              Member Access
            </div>

            <div className="mt-5 space-y-4 text-sm leading-8 text-slate-300">
              <p>This room is designed for premium subscribers who want more than the public case page.</p>
              <p>Use this space to submit:</p>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Case questions and theory requests
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Requests for deeper transcript analysis
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Follow-up topics for live breakdowns
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Corrections, tips, or scene analysis questions
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href={`/case-file/${slug}`}
                  className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Back to Case File
                </Link>
              </div>
            </div>
          </div>

          {isActive && incident ? (
            <MemberRoomForm incidentId={incident.id} />
          ) : (
            <div className="rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
                    Locked
                  </div>
                  <h2 className="mt-2 font-serif text-2xl text-white">
                    Subscribe to Unlock
                  </h2>
                </div>
                <div className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D19A]">
                  Premium
                </div>
              </div>

              <p className="text-sm leading-7 text-slate-300">
                The Member Room is reserved for active subscribers. Subscribe
                for $4.99/mo to submit case questions and get deeper
                breakdowns.
              </p>

              <Link
                href="/subscribe"
                className="mt-5 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Subscribe for $4.99/mo
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
