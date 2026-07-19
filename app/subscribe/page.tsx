import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import SubscribeForm from "../components/SubscribeForm";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function SubscribePage() {
  const { user, isActive } = await getSubscriberStatus();

  if (!user) {
    redirect("/login?next=/subscribe");
  }

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
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
                Your $4.99/mo subscription is active. The Member Room, deeper
                case content, and early access to new cases are unlocked.
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
                Unlocks the Member Room, deeper case content, and early access to
                new cases. Cancel anytime.
              </p>
              <SubscribeForm />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
