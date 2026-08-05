import { redirect, notFound } from "next/navigation";
import Navbar from "../../../components/Navbar";
import ThreadClient from "./ThreadClient";
import ThreadDetailsPanel from "./ThreadDetailsPanel";
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
    .select("callsign, role, avatar_url, is_verified")
    .eq("user_id", friendId)
    .maybeSingle();

  const friendName = friendProfile?.callsign || "Unnamed Investigator";

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <div className="lg:hidden">
        <div className="px-6 pt-6">
          <Navbar
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Profile", href: "/account" },
              { label: "Messages", href: "/account/messages" },
              { label: friendName },
            ]}
          />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <ThreadClient
          currentUserId={user.id}
          friendId={friendId}
          friendName={friendName}
          friendAvatarUrl={friendProfile?.avatar_url ?? null}
          friendVerified={friendProfile?.is_verified ?? false}
        />
      </div>

      <div className="hidden lg:block">
        <ThreadDetailsPanel
          friendId={friendId}
          friendName={friendName}
          friendRole={friendProfile?.role ?? null}
          friendAvatarUrl={friendProfile?.avatar_url ?? null}
          friendVerified={friendProfile?.is_verified ?? false}
        />
      </div>
    </div>
  );
}
