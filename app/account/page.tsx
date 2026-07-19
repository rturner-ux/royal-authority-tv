import { redirect } from "next/navigation";
import Navbar from "../components/Navbar";
import AccountActions from "./AccountActions";
import { supabaseServerAuth } from "@/lib/supabase/serverAuth";

export default async function AccountPage() {
  const db = await supabaseServerAuth();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const { data: subscriber } = await db
    .from("subscribers")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const isActive = subscriber?.status === "active";

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Account" }]} />

        <div className="mx-auto max-w-xl">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            My Account
          </div>
          <h1 className="mt-3 font-serif text-4xl text-white">{user.email}</h1>

          <div className="mt-8 rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
                Subscription
              </div>
              <div
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                  isActive
                    ? "border-green-500/30 bg-green-500/10 text-green-300"
                    : "border-white/15 bg-white/5 text-slate-300"
                }`}
              >
                {subscriber?.status ?? "None"}
              </div>
            </div>

            {isActive ? (
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {subscriber?.current_period_end
                  ? `Renews ${new Date(subscriber.current_period_end).toLocaleDateString()}.`
                  : "Your subscription is active."}{" "}
                You have full access to the Member Room, premium case content,
                and early access cases.
              </p>
            ) : (
              <p className="mt-4 text-sm leading-7 text-slate-300">
                You don&apos;t have an active subscription yet.{" "}
                <a href="/subscribe" className="text-[#E8D19A] hover:underline">
                  Subscribe for $4.99/mo
                </a>{" "}
                to unlock the Member Room, deeper case content, and early
                access to new cases.
              </p>
            )}

            <AccountActions isActive={isActive} />
          </div>
        </div>
      </div>
    </main>
  );
}
