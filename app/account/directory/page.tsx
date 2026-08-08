import { redirect } from "next/navigation";
import Navbar from "../../components/Navbar";
import DirectoryClient from "./DirectoryClient";
import { supabaseServerAuth } from "@/lib/supabase/serverAuth";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function DirectoryPage() {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/directory");
  if (!isActive) redirect("/account");

  const db = await supabaseServerAuth();
  const { data: profile } = await db
    .from("subscriber_profiles")
    .select("role, callsign")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-6">
        <div className="lg:hidden">
          <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Profile", href: "/account" }, { label: "Directory" }]} />
        </div>

        <h1 className="font-serif text-3xl font-bold text-white">Subscriber Directory</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Every member with a callsign. Send a friend request to start a conversation.
        </p>

        {!profile?.callsign && (
          <p className="mt-4 rounded-2xl border border-[#C9A24A]/20 bg-[#C9A24A]/[0.05] p-4 text-sm leading-6 text-slate-300">
            Set a callsign on your{" "}
            <a href="/account" className="text-[#E8D19A] hover:underline">
              profile
            </a>{" "}
            to appear in the directory.
          </p>
        )}

        <div className="mt-8">
          <DirectoryClient />
        </div>
      </div>
    </main>
  );
}
