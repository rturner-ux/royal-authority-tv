import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import InvestigationBoard from "../components/InvestigationBoard";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function InvestigationBoardPage() {
  const { user, isActive } = await getSubscriberStatus();

  if (!user) {
    redirect("/login?next=/investigation-board");
  }

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Investigation Board" }]} />

        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Subscriber Access</div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">Investigation Board</h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            Your own private corkboard. Pin cases and people from the site, add your own private
            theory notes, and connect them with string. Only you can ever see this board.
          </p>
        </div>

        <div className="mb-6 max-w-3xl rounded-[20px] border border-amber-500/30 bg-amber-500/[0.06] p-4 text-xs leading-6 text-amber-100/90">
          <span className="font-bold uppercase tracking-wide text-amber-300">Private, personal notes only.</span>{" "}
          Anything you write here is visible to you alone. This is a tool for organizing your own
          theories, not a place to publish accusations. Please don&apos;t use it to harass or target
          a real person.
        </div>

        {!isActive ? (
          <div className="max-w-md rounded-[30px] border border-[#C9A24A]/30 bg-[#C9A24A]/10 p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D19A]">Locked</div>
            <h2 className="mt-3 font-serif text-2xl text-white">Subscribe to Unlock</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              The Investigation Board is reserved for active subscribers. Subscribe for $4.99/mo to
              build your own private case board.
            </p>
            <Link
              href="/subscribe"
              className="mt-6 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Subscribe for $4.99/mo
            </Link>
          </div>
        ) : (
          <InvestigationBoard />
        )}
      </div>
    </main>
  );
}
