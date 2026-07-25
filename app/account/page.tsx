import { redirect } from "next/navigation";
import Image from "next/image";
import Navbar from "../components/Navbar";
import AccountActions from "./AccountActions";
import InvestigatorProfile from "./InvestigatorProfile";
import AccountTabs from "./AccountTabs";
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

  // incidents/subscriber_playlists/playlist_cases have no authenticated-role
  // RLS policy (service-role only, same as everywhere else this data is
  // read), so these need the service-role client rather than the user's own
  // RLS-scoped session.
  const svc = supabase();

  const [{ data: myRequestsRaw }, { data: myPlaylists }] = await Promise.all([
    isActive
      ? svc
          .from("member_questions")
          .select("id, topic, message, created_at, incidents(title, slug)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    isActive
      ? svc.from("subscriber_playlists").select("id, name").eq("user_id", user.id).order("sequence", { ascending: true })
      : Promise.resolve({ data: [] }),
  ]);

  const myRequests = (myRequestsRaw ?? []).map((r) => ({
    ...r,
    incident: Array.isArray(r.incidents) ? r.incidents[0] : r.incidents,
  }));

  const playlistIds = (myPlaylists ?? []).map((p) => p.id);
  const { data: playlistCases } = playlistIds.length
    ? await svc
        .from("playlist_cases")
        .select("playlist_id, incident_id, incidents(image_url)")
        .in("playlist_id", playlistIds)
    : { data: [] };

  const casesByPlaylist = new Map<string, { incident_id: string; image_url: string | null }[]>();
  const allSavedIncidentIds = new Set<string>();
  for (const pc of playlistCases ?? []) {
    const incident = Array.isArray(pc.incidents) ? pc.incidents[0] : pc.incidents;
    const list = casesByPlaylist.get(pc.playlist_id) ?? [];
    list.push({ incident_id: pc.incident_id, image_url: incident?.image_url ?? null });
    casesByPlaylist.set(pc.playlist_id, list);
    allSavedIncidentIds.add(pc.incident_id);
  }

  const playlistPreviews = (myPlaylists ?? []).map((p) => {
    const cases = casesByPlaylist.get(p.id) ?? [];
    return {
      id: p.id,
      name: p.name,
      caseCount: cases.length,
      thumbnails: cases.map((c) => c.image_url).filter((u): u is string => !!u),
    };
  });

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Account" }]} />

        <div className="mx-auto max-w-3xl lg:max-w-5xl">
          {/* Profile header: banner + avatar + identity, social-profile style */}
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-black/30 backdrop-blur-sm">
            <div className="h-24 bg-gradient-to-r from-[#C9A24A]/25 via-red-700/15 to-transparent" />
            <div className="px-6 pb-6">
              <div className="-mt-12 flex items-end gap-4">
                <div className="relative h-24 w-24 flex-shrink-0 rounded-full border-4 border-[#05070b] bg-[#0b0e14]">
                  {role ? (
                    <Image src={role.badge} alt="" fill unoptimized className="rounded-full object-contain p-3" />
                  ) : (
                    <div className="grid h-full w-full place-items-center rounded-full text-2xl font-bold text-white/40">
                      {(profile?.callsign || user.email || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
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
                  {role && (
                    <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#E8D19A]">
                      {role.title}
                    </span>
                  )}
                </div>
                {role && <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">{role.tagline}</p>}
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

              <AccountActions isActive={isActive} />

              {!isActive && (
                <p className="mt-4 rounded-2xl border border-[#C9A24A]/20 bg-[#C9A24A]/[0.05] p-4 text-sm leading-7 text-slate-300">
                  You don&apos;t have an active subscription yet.{" "}
                  <a href="/subscribe" className="text-[#E8D19A] hover:underline">
                    Subscribe for $4.99/mo
                  </a>{" "}
                  to unlock the Member Room, deeper case content, playlists, and early access to new
                  cases.
                </p>
              )}
              {isActive && subscriber?.current_period_end && (
                <p className="mt-4 text-xs text-slate-500">
                  Renews {new Date(subscriber.current_period_end).toLocaleDateString()}.
                </p>
              )}
            </div>
          </div>

          {isActive && (
            <InvestigatorProfile
              userId={user.id}
              initialRole={profile?.role ?? null}
              initialCallsign={profile?.callsign ?? null}
            />
          )}

          {isActive && <AccountTabs playlists={playlistPreviews} caseRequests={myRequests} />}
        </div>
      </div>
    </main>
  );
}
