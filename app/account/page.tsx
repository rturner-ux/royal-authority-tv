import { redirect } from "next/navigation";
import Navbar from "../components/Navbar";
import AccountActions from "./AccountActions";
import InvestigatorProfile from "./InvestigatorProfile";
import { supabaseServerAuth } from "@/lib/supabase/serverAuth";
import { supabase } from "@/lib/supabase/server";
import { getRole } from "@/lib/roles";

export default async function AccountPage() {
  const db = await supabaseServerAuth();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const [{ data: subscriber }, { data: profile }] = await Promise.all([
    db.from("subscribers").select("status, current_period_end").eq("user_id", user.id).maybeSingle(),
    db.from("subscriber_profiles").select("role, callsign").eq("user_id", user.id).maybeSingle(),
  ]);

  const isActive = subscriber?.status === "active";
  const role = getRole(profile?.role);

  // incidents has no authenticated-role RLS policy (service-role only, same
  // as everywhere else this data is read), so the embedded join needs the
  // service-role client rather than the user's own RLS-scoped session.
  const myRequests = isActive
    ? (
        await supabase()
          .from("member_questions")
          .select("id, topic, message, created_at, incidents(title, slug)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      ).data ?? []
    : [];

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
          <h1 className="mt-3 font-serif text-4xl text-white">
            {role
              ? `Welcome back, ${role.title}${profile?.callsign ? ` ${profile.callsign}` : ""}`
              : user.email}
          </h1>
          {role && <p className="mt-2 text-sm text-slate-500">{user.email}</p>}

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

          {isActive && (
            <InvestigatorProfile
              userId={user.id}
              initialRole={profile?.role ?? null}
              initialCallsign={profile?.callsign ?? null}
            />
          )}

          {isActive && (
            <div className="mt-8 rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
                  My Case Requests
                </div>
                <div className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D19A]">
                  Subscriber Perk
                </div>
              </div>

              {myRequests.length === 0 ? (
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  You haven&apos;t submitted any case requests yet. Open any
                  case&apos;s Member Room to submit one.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {myRequests.map((r) => {
                    const incident = Array.isArray(r.incidents) ? r.incidents[0] : r.incidents;
                    return (
                      <div
                        key={r.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-semibold text-white">{r.topic}</h3>
                          <span className="text-xs text-slate-500">
                            {new Date(r.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{r.message}</p>
                        {incident?.slug && (
                          <a
                            href={`/case-file/${incident.slug}`}
                            className="mt-3 inline-block text-xs uppercase tracking-[0.15em] text-[#E8D19A] hover:underline"
                          >
                            {incident.title}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
