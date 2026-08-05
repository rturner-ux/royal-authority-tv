"use client";

import { useRouter } from "next/navigation";
import { getRole } from "@/lib/roles";

export default function ThreadDetailsPanel({
  friendId,
  friendName,
  friendRole,
}: {
  friendId: string;
  friendName: string;
  friendRole: string | null;
}) {
  const router = useRouter();
  const role = getRole(friendRole);

  async function blockUser() {
    if (!confirm(`Block ${friendName}? This removes your friendship and they won't be able to message you.`)) return;
    const res = await fetch("/api/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: friendId }),
    });
    if (res.ok) router.push("/account/messages");
  }

  async function reportUser() {
    const reason = prompt(`Report ${friendName}. What happened?`);
    if (!reason?.trim()) return;
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: friendId, reason }),
    });
    alert("Report filed. Thanks for flagging it.");
  }

  return (
    <div className="flex h-full w-72 flex-shrink-0 flex-col border-l border-white/10 p-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-xl font-bold text-white/50">
          {friendName.charAt(0).toUpperCase()}
        </div>
        <div className="mt-3 text-sm font-semibold text-white">{friendName}</div>
        {role && (
          <span className="mt-1 rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#E8D19A]">
            {role.title}
          </span>
        )}
      </div>

      <div className="mt-8 border-t border-white/10 pt-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Safety</div>
        <button
          onClick={reportUser}
          className="mt-3 flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-300 transition hover:bg-white/5"
        >
          Report {friendName}
        </button>
        <button
          onClick={blockUser}
          className="mt-1 flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
        >
          Block {friendName}
        </button>
      </div>
    </div>
  );
}
