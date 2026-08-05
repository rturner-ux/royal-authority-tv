import { redirect, notFound } from "next/navigation";
import Navbar from "../../../components/Navbar";
import ThreadClient from "./ThreadClient";
import { getSubscriberStatus } from "@/lib/subscription";
import { areFriends, isUuid } from "@/lib/friends";
import { supabase } from "@/lib/supabase/server";

export default async function ThreadPage({ params }: { params: Promise<{ friendId: string }> }) {
  const { friendId } = await params;
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect(`/login?next=/account/messages/${friendId}`);
  if (!isActive) redirect("/account");
  if (!isUuid(friendId)) notFound();
  if (!(await areFriends(user.id, friendId))) redirect("/account/messages");

  const db = supabase();
  const { data: friendProfile } = await db
    .from("subscriber_profiles")
    .select("callsign, role")
    .eq("user_id", friendId)
    .maybeSingle();

  const friendName = friendProfile?.callsign || "Unnamed Investigator";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 pb-20 pt-6">
        <div className="lg:hidden">
          <Navbar
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Profile", href: "/account" },
              { label: "Messages", href: "/account/messages" },
              { label: friendName },
            ]}
          />
        </div>

        <ThreadClient currentUserId={user.id} friendId={friendId} friendName={friendName} />
      </div>
    </main>
  );
}
