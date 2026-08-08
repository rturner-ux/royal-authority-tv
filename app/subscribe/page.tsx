import Link from "next/link";
import Navbar from "../components/Navbar";
import SubscribeForm from "../components/SubscribeForm";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function SubscribePage() {
  const { user, isActive } = await getSubscriberStatus();

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Subscribe" }]} />

        <div className="mx-auto max-w-md">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            Subscriber Access
          </div>

          {isActive ? (
            <>
              <h1 className="mt-3 font-serif text-4xl text-white">You&apos;re subscribed</h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Your $4.99/mo subscription is active. Pattern Intelligence,
                Trafficking Hot Spots, Member Analysis, Premium Case Log
                entries, early access, the Case Member Room, the Investigation
                Board, Playlists, the Investigator Toolkit, and the Full
                Court Record are all unlocked.
              </p>
              <div className="mt-8 rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
                <Link
                  href="/account"
                  className="block w-full rounded-2xl bg-[#C9A24A] px-5 py-3 text-center text-sm font-semibold text-black transition hover:opacity-90"
                >
                  Manage Subscription
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-3 font-serif text-4xl text-white">
                $4.99<span className="text-lg font-normal text-slate-400">/mo</span>
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Cancel anytime. Here&apos;s what a subscription unlocks:
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-[#C9A24A]/20 bg-[#C9A24A]/[0.04] px-4 py-3">
                  <span className="font-semibold text-[#E8D19A]">Pattern Intelligence:</span>{" "}
                  <span className="text-sm text-slate-300">
                    see cases across the entire map clustered by location, timing, and category
                  </span>
                </div>
                <div className="rounded-2xl border border-[#C9A24A]/20 bg-[#C9A24A]/[0.04] px-4 py-3">
                  <span className="font-semibold text-[#E8D19A]">Trafficking Hot Spots:</span>{" "}
                  <span className="text-sm text-slate-300">
                    state-by-state shading on the Investigation Map from National Human Trafficking Hotline data
                  </span>
                </div>
                <div className="rounded-2xl border border-[#C9A24A]/20 bg-[#C9A24A]/[0.04] px-4 py-3">
                  <span className="font-semibold text-[#E8D19A]">Member Analysis:</span>{" "}
                  <span className="text-sm text-slate-300">
                    exclusive AI-written commentary on open questions, contradictions, and timeline gaps in every case
                  </span>
                </div>
                <div className="rounded-2xl border border-[#C9A24A]/20 bg-[#C9A24A]/[0.04] px-4 py-3">
                  <span className="font-semibold text-[#E8D19A]">Premium Case Log entries:</span>{" "}
                  <span className="text-sm text-slate-300">
                    deeper updates marked Premium in the timeline, hidden from public view
                  </span>
                </div>
                <div className="rounded-2xl border border-[#C9A24A]/20 bg-[#C9A24A]/[0.04] px-4 py-3">
                  <span className="font-semibold text-[#E8D19A]">Early access:</span>{" "}
                  <span className="text-sm text-slate-300">
                    new cases go live for subscribers up to 48 hours before the public
                  </span>
                </div>
                <div className="rounded-2xl border border-[#C9A24A]/20 bg-[#C9A24A]/[0.04] px-4 py-3">
                  <span className="font-semibold text-[#E8D19A]">Case Member Room:</span>{" "}
                  <span className="text-sm text-slate-300">
                    submit case questions, theory requests, and transcript deep dives directly
                  </span>
                </div>
                <div className="rounded-2xl border border-[#C9A24A]/20 bg-[#C9A24A]/[0.04] px-4 py-3">
                  <span className="font-semibold text-[#E8D19A]">Investigation Board:</span>{" "}
                  <span className="text-sm text-slate-300">
                    your own private corkboard to pin cases, connect them with string, and attach notes that
                    show up automatically with their photo
                  </span>
                </div>
                <div className="rounded-2xl border border-[#C9A24A]/20 bg-[#C9A24A]/[0.04] px-4 py-3">
                  <span className="font-semibold text-[#E8D19A]">Playlists:</span>{" "}
                  <span className="text-sm text-slate-300">
                    build your own named, sortable lists of cases you&apos;re following
                  </span>
                </div>
                <div className="rounded-2xl border border-[#C9A24A]/20 bg-[#C9A24A]/[0.04] px-4 py-3">
                  <span className="font-semibold text-[#E8D19A]">Investigator Toolkit:</span>{" "}
                  <span className="text-sm text-slate-300">
                    generate a headlines-and-questions content kit or a role-specific case brief for any case,
                    tailored to how you think
                  </span>
                </div>
                <div className="rounded-2xl border border-[#C9A24A]/20 bg-[#C9A24A]/[0.04] px-4 py-3">
                  <span className="font-semibold text-[#E8D19A]">Full Court Record:</span>{" "}
                  <span className="text-sm text-slate-300">
                    case information, charges, bond, hearings, and documents sourced straight from the real
                    court and jail records
                  </span>
                </div>
              </div>

              {user ? (
                <SubscribeForm />
              ) : (
                <div className="mt-8 rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
                  <p className="text-sm leading-7 text-slate-300">
                    Create a free account to subscribe. Takes about 30 seconds.
                  </p>
                  <Link
                    href="/signup?next=/subscribe"
                    className="mt-4 block w-full rounded-2xl bg-[#C9A24A] px-5 py-3 text-center text-sm font-semibold text-black transition hover:opacity-90"
                  >
                    Create Account & Subscribe
                  </Link>
                  <p className="mt-4 text-center text-sm text-slate-400">
                    Already have an account?{" "}
                    <Link href="/login?next=/subscribe" className="text-[#E8D19A] hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
