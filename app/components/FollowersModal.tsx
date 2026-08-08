"use client";

import { useEffect, useState } from "react";
import { getRole } from "@/lib/roles";
import Avatar from "./Avatar";
import VerifiedBadge from "./VerifiedBadge";

type OtherUser = {
  user_id: string;
  callsign: string | null;
  role: string | null;
  avatar_url: string | null;
  is_verified: boolean;
};
type Entry = { otherUser: OtherUser; isFollowedByMe: boolean; followsMe: boolean; isFriend: boolean };
type FriendStatus = "none" | "pending" | "friends";

type Tab = "following" | "followers" | "friends";

function Row({
  entry,
  friendStatus,
  onToggleFollow,
  onPartnerUp,
  busy,
}: {
  entry: Entry;
  friendStatus: FriendStatus;
  onToggleFollow: (userId: string, currentlyFollowing: boolean) => void;
  onPartnerUp: (userId: string) => void;
  busy: string | null;
}) {
  const role = getRole(entry.otherUser.role);
  const name = entry.otherUser.callsign || "Unnamed Investigator";
  const isBusy = busy === entry.otherUser.user_id;

  return (
    <div className="flex items-center gap-3 py-3">
      <Avatar avatarUrl={entry.otherUser.avatar_url} roleBadge={role?.badge ?? null} name={name} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-white">{name}</span>
          {entry.otherUser.is_verified && <VerifiedBadge className="h-3.5 w-3.5" />}
        </div>
        {role && <div className="truncate text-xs text-slate-500">{role.title}</div>}
      </div>
      <div className="flex flex-shrink-0 flex-col items-stretch gap-1.5">
        <button
          onClick={() => onToggleFollow(entry.otherUser.user_id, entry.isFollowedByMe)}
          disabled={isBusy}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
            entry.isFollowedByMe
              ? "border border-white/15 text-slate-300 hover:bg-white/5"
              : "bg-[#C9A24A] text-black hover:bg-[#E8D19A]"
          }`}
        >
          {entry.isFollowedByMe ? "Following" : entry.followsMe ? "Follow Back" : "Follow"}
        </button>
        {friendStatus !== "friends" && (
          <button
            onClick={() => onPartnerUp(entry.otherUser.user_id)}
            disabled={isBusy || friendStatus === "pending"}
            className="rounded-full border border-[#C9A24A]/30 px-3.5 py-1.5 text-xs font-semibold text-[#E8D19A] transition hover:bg-[#C9A24A]/10 disabled:opacity-50"
          >
            {friendStatus === "pending" ? "Pending" : "Partner Up"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function FollowersModal({
  initialTab,
  onClose,
}: {
  initialTab: Tab;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Entry[]>([]);
  const [followers, setFollowers] = useState<Entry[]>([]);
  const [friendStatusById, setFriendStatusById] = useState<Record<string, FriendStatus>>({});
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    Promise.all([
      fetch("/api/follows").then((r) => r.json()),
      fetch("/api/friends").then((r) => r.json()),
    ]).then(([fw, fr]) => {
      if (fw.success) {
        setFollowing(fw.following);
        setFollowers(fw.followers);
      }
      if (fr.success) {
        const map: Record<string, FriendStatus> = {};
        for (const f of fr.friends) map[f.otherUser.user_id] = "friends";
        for (const f of fr.incoming) map[f.otherUser.user_id] = "pending";
        for (const f of fr.outgoing) map[f.otherUser.user_id] = "pending";
        setFriendStatusById(map);
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleFollow(userId: string, currentlyFollowing: boolean) {
    setBusy(userId);
    if (currentlyFollowing) {
      await fetch(`/api/follows?followedId=${userId}`, { method: "DELETE" });
    } else {
      await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followedId: userId }),
      });
    }
    setBusy(null);
    load();
  }

  async function partnerUp(userId: string) {
    setBusy(userId);
    await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: userId }),
    });
    setBusy(null);
    load();
  }

  // Friends tab is the union of everyone with an accepted friend_requests
  // row -- independent of follow state, since you can be friends with
  // someone you don't follow (or vice versa).
  const friendEntries = Array.from(
    new Map(
      [...following, ...followers]
        .filter((e) => friendStatusById[e.otherUser.user_id] === "friends")
        .map((e) => [e.otherUser.user_id, e])
    ).values()
  );

  const list = tab === "following" ? following : tab === "followers" ? followers : friendEntries;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0d14] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex gap-5 text-sm font-semibold">
            <button
              onClick={() => setTab("following")}
              className={tab === "following" ? "text-white" : "text-slate-500 hover:text-slate-300"}
            >
              Following {following.length}
            </button>
            <button
              onClick={() => setTab("followers")}
              className={tab === "followers" ? "text-white" : "text-slate-500 hover:text-slate-300"}
            >
              Followers {followers.length}
            </button>
            <button
              onClick={() => setTab("friends")}
              className={tab === "friends" ? "text-white" : "text-slate-500 hover:text-slate-300"}
            >
              Friends {friendEntries.length}
            </button>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-xl leading-none text-slate-400 hover:text-white">
            &times;
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5">
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading...</p>
          ) : list.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              {tab === "following" && "Not following anyone yet."}
              {tab === "followers" && "No followers yet."}
              {tab === "friends" && "No friends yet."}
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {list.map((entry) => (
                <Row
                  key={entry.otherUser.user_id}
                  entry={entry}
                  friendStatus={friendStatusById[entry.otherUser.user_id] ?? "none"}
                  onToggleFollow={toggleFollow}
                  onPartnerUp={partnerUp}
                  busy={busy}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
