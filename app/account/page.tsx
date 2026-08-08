import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import AccountActions from "./AccountActions";
import InvestigatorProfile from "./InvestigatorProfile";
import EmailAlertsToggle from "./EmailAlertsToggle";
import InterestsPicker from "./InterestsPicker";
import AvatarUpload from "./AvatarUpload";
import VerifiedBadge from "../components/VerifiedBadge";
import AccountTabs from "./AccountTabs";
import { supabaseServerAuth } from "@/lib/supabase/serverAuth";
import { supabase } from "@/lib/supabase/server";
import { getRole } from "@/lib/roles";
import { getPlaylistPreviews } from "@/lib/playlists";

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
    db
      .from("subscriber_profiles")
      .select("role, callsign, email_alerts_enabled, avatar_url, is_verified, interests")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const isActive = subscriber?.status === "active";

  // A signed-in, non-subscribed visitor lands here after confirming their
  // email and logging in -- without this, the account page just showed a
  // small buried "Subscribe for $4.99/mo" note among otherwise-empty
  // sections, and real users read that as "I'm done" and never reached the
  // card form. Send them straight to checkout instead.
  if (!isActive) {
    redirect("/subscribe");
  }

  const role = getRole(profile?.role);

  // incidents/subscriber_playlists/playlist_cases have no authenticated-role
  // RLS policy (service-role only, same as everywhere else this data is
  // read), so these need the service-role client rather than the user's own
  // RLS-scoped session.
  const svc = supabase();

  const [{ data: myRequestsRaw }, { previews: playlistPreviews, savedIncidentIds: allSavedIncidentIds }] =
    await Promise.all([
      svc
        .from("member_questions")
        .select("id, topic, message, created_at, incidents(title, slug)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      getPlaylistPreviews(user.id),
    ]);

  const myRequests = (myRequestsRaw ?? []).map((r) => ({
    ...r,
    incident: Array.isArray(r.incidents) ? r.incidents[0] : r.incidents,
  }));

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <div className="lg:hidden">
          <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Profile" }]} />
        </div>

        {/* Two-column social-profile layout: a compact left profile card,
            a wider right content area -- fills the screen on desktop
            instead of one narrow centered card, and stacks to a single
            column on mobile. */}
        <div className="grid gap-6 lg:grid-cols-[340px_1fr] lg:items-start">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-black/30 backdrop-blur-sm lg:sticky lg:top-24">
            <div className="h-24 bg-gradient-to-r from-[#C9A24A]/25 via-red-700/15 to-transparent" />
            <div className="px-6 pb-6">
              <div className="-mt-12 flex items-end gap-4">
                <AvatarUpload
                  userId={user.id}
                  initialAvatarUrl={profile?.avatar_url ?? null}
                  roleBadge={role?.badge ?? null}
                  name={profile?.callsign || user.email || "?"}
                  size={96}
                />
                <div
                  className={`mb-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    isActive
                      ? "border-green-500/30 bg-green-500/10 text-green-300"
                      : "border-white/15 bg-white/5 text-slate-300"
                  }`}
                >
                  {subscriber?.status ?? "None"}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-3xl text-white">
                    {profile?.callsign || "Unnamed Investigator"}
                  </h1>
                  {profile?.is_verified && <VerifiedBadge className="h-5 w-5" />}
                  {role && (
                    <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#E8D19A]">
                      {role.title}
                    </span>
                  )}
                </div>
                {role && <p className="mt-3 text-sm leading-6 text-slate-400">{role.tagline}</p>}
                {memberSince && <p className="mt-2 text-xs text-slate-600">Member since {memberSince}</p>}
              </div>

              {/* Stat chips */}
              <div className="mt-5 flex flex-wrap gap-6 border-t border-white/10 pt-4">
                <div>
                  <div className="text-lg font-bold text-white">{playlistPreviews.length}</div>
                  <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Playlists</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{allSavedIncidentIds.size}</div>
                  <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Cases Saved</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{myRequests.length}</div>
                  <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Case Requests</div>
                </div>
              </div>

              {isActive && (
                <div className="mt-5 grid gap-2">
                  <Link
                    href="/account/videos"
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#C9A24A]/30 bg-gradient-to-r from-[#C9A24A]/[0.1] to-transparent px-4 py-3 transition hover:border-[#C9A24A]/50"
                  >
                    <span className="text-sm font-semibold text-[#E8D19A]">My Video Profile</span>
                    <span className="text-[#E8D19A]">→</span>
                  </Link>
                  <Link
                    href="/account/directory"
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/25"
                  >
                    <span className="text-sm font-semibold text-white">Subscriber Directory</span>
                    <span className="text-white/50">→</span>
                  </Link>
                  <Link
                    href="/account/friends"
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/25"
                  >
                    <span className="text-sm font-semibold text-white">Friends & Requests</span>
                    <span className="text-white/50">→</span>
                  </Link>
                  <Link
                    href="/account/messages"
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/25"
                  >
                    <span className="text-sm font-semibold text-white">Messages</span>
                    <span className="text-white/50">→</span>
                  </Link>
                </div>
              )}

              {isActive && (
                <InterestsPicker userId={user.id} initialInterests={profile?.interests ?? []} />
              )}

              <AccountActions isActive={isActive} />

              {subscriber?.current_period_end && (
                <p className="mt-4 text-xs text-slate-500">
                  Renews {new Date(subscriber.current_period_end).toLocaleDateString()}.
                </p>
              )}

              {isActive && (
                <InvestigatorProfile
                  userId={user.id}
                  initialRole={profile?.role ?? null}
                  initialCallsign={profile?.callsign ?? null}
                />
              )}

              {isActive && (
                <EmailAlertsToggle
                  userId={user.id}
                  initialEnabled={profile?.email_alerts_enabled ?? true}
                />
              )}
            </div>
          </div>

          {isActive && (
            <div className="min-w-0">
              <AccountTabs playlists={playlistPreviews} caseRequests={myRequests} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
