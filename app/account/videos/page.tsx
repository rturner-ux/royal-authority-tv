import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import VideoProfileTabs from "./VideoProfileTabs";
import { supabaseServerAuth } from "@/lib/supabase/serverAuth";
import { getRole } from "@/lib/roles";
import { getPlaylistPreviews } from "@/lib/playlists";

export default async function VideoProfilePage() {
  const db = await supabaseServerAuth();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) {
    redirect("/login?next=/account/videos");
  }

  const [{ data: profile }, { previews: playlistPreviews, savedIncidentIds }] = await Promise.all([
    db.from("subscriber_profiles").select("role, callsign").eq("user_id", user.id).maybeSingle(),
    getPlaylistPreviews(user.id),
  ]);

  const role = getRole(profile?.role);
  const displayName = profile?.callsign || "Unnamed Investigator";
  const handle = (profile?.callsign || user.email || "investigator")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-6">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "My Profile" }]} />

        <div className="flex flex-col items-center text-center">
          <div className="relative h-24 w-24 flex-shrink-0 rounded-full border-4 border-[#05070b] bg-[#0b0e14]">
            {role ? (
              <Image src={role.badge} alt="" fill unoptimized className="rounded-full object-contain p-3" />
            ) : (
              <div className="grid h-full w-full place-items-center rounded-full text-3xl font-bold text-white/40">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="mt-4 font-serif text-3xl font-bold text-white">{displayName}</h1>
          <p className="text-sm text-slate-500">@{handle}</p>

          <div className="mt-6 flex gap-10">
            <div>
              <div className="text-lg font-bold text-white">{playlistPreviews.length}</div>
              <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Playlists</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{savedIncidentIds.size}</div>
              <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Cases Saved</div>
            </div>
          </div>

          {role && <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">{role.tagline}</p>}

          <div className="mt-6 flex gap-3">
            <Link
              href="/account"
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {playlistPreviews.length > 0 && (
          <div className="mt-10">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#E8D19A]">Playlists</div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {playlistPreviews.map((p) => (
                <Link
                  key={p.id}
                  href="/account/playlists"
                  className="flex w-48 flex-shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/25"
                >
                  {p.thumbnails.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumbnails[0]} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-[#181818]" />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.caseCount} cases</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <VideoProfileTabs />
        </div>
      </div>
    </main>
  );
}
