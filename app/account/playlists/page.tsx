import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Playlists from "../../components/Playlists";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function PlaylistsPage() {
  const { user, isActive } = await getSubscriberStatus();

  if (!user) {
    redirect("/login?next=/account/playlists");
  }

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <div className="lg:hidden">
          <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Profile", href: "/account" }, { label: "My Playlists" }]} />
        </div>

        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Subscriber Access</div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">My Playlists</h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            Build your own named lists of cases you&apos;re following. Private to you only, sortable, and
            easy to jump back into.
          </p>
        </div>

        {!isActive ? (
          <div className="max-w-md rounded-[30px] border border-[#C9A24A]/30 bg-[#C9A24A]/10 p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D19A]">Locked</div>
            <h2 className="mt-3 font-serif text-2xl text-white">Subscribe to Unlock</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Playlists are reserved for active subscribers. Subscribe for $4.99/mo to start building your own.
            </p>
            <Link
              href="/subscribe"
              className="mt-6 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Subscribe for $4.99/mo
            </Link>
          </div>
        ) : (
          <Playlists />
        )}
      </div>
    </main>
  );
}
