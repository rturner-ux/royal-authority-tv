"use client";

import { useState } from "react";
import FollowersModal from "../components/FollowersModal";

export default function FollowStatChips({
  followingCount,
  followerCount,
}: {
  followingCount: number;
  followerCount: number;
}) {
  const [openTab, setOpenTab] = useState<"following" | "followers" | null>(null);

  return (
    <>
      <button onClick={() => setOpenTab("followers")} className="text-left">
        <div className="text-lg font-bold text-white">{followerCount}</div>
        <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Followers</div>
      </button>
      <button onClick={() => setOpenTab("following")} className="text-left">
        <div className="text-lg font-bold text-white">{followingCount}</div>
        <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Following</div>
      </button>

      {openTab && <FollowersModal initialTab={openTab} onClose={() => setOpenTab(null)} />}
    </>
  );
}
