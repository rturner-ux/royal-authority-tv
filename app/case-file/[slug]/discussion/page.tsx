"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";

type Reply = { id: number; author: string; body: string; time: string };
type Thread = {
  id: number;
  author: string;
  tag: string;
  title: string;
  body: string;
  time: string;
  replies: Reply[];
  pinned?: boolean;
};

const tags = ["General", "Timeline", "Transcript", "Scene Analysis", "Questions"];

export default function DiscussionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const starterThreads: Thread[] = useMemo(
    () => [
      {
        id: 1,
        author: "Royal Authority",
        tag: "Moderator Note",
        title: "Discussion Guidelines",
        body: "Keep discussion factual, respectful, and tied to the available record. Do not post private information, unsupported accusations as fact, or harassment toward individuals connected to the case.",
        time: "Pinned",
        pinned: true,
        replies: [],
      },
    ],
    []
  );

  const [threads, setThreads] = useState<Thread[]>(starterThreads);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("General");
  const [search, setSearch] = useState("");
  const [openReplyId, setOpenReplyId] = useState<number | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [likedThreads, setLikedThreads] = useState<number[]>([]);
  const [savedThreads, setSavedThreads] = useState<number[]>([]);

  function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setThreads((prev) => [
      { id: Date.now(), author: "Member", tag, title: title.trim(), body: body.trim(), time: "Just now", replies: [] },
      ...prev,
    ]);
    setTitle("");
    setBody("");
    setTag("General");
  }

  function handleReplySubmit(threadId: number) {
    const draft = replyDrafts[threadId]?.trim();
    if (!draft) return;
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? { ...thread, replies: [...thread.replies, { id: Date.now(), author: "Member", body: draft, time: "Just now" }] }
          : thread
      )
    );
    setReplyDrafts((prev) => ({ ...prev, [threadId]: "" }));
  }

  const filteredThreads = useMemo(() => {
    const filtered = threads.filter((thread) => {
      const haystack = `${thread.author} ${thread.tag} ${thread.title} ${thread.body}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
    return [...filtered].sort((a, b) => (a.pinned && !b.pinned ? -1 : !a.pinned && b.pinned ? 1 : 0));
  }, [threads, search]);

  const totalReplies = threads.reduce((sum, t) => sum + t.replies.length, 0);

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar rightButtonLabel="Back to Case" rightButtonHref={`/case-file/${slug}`} />

        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Open Forum</div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">Case Discussion Room</h1>
          <p className="mt-4 max-w-4xl text-sm leading-8 text-slate-300 md:text-base">
            Open discussion space for case observations, timeline questions, and evidence debate. Keep discussion
            factual, respectful, and tied to available information.
          </p>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.22em] text-[#E8D19A]">Active Threads</div>
            <div className="mt-3 text-3xl font-semibold text-white">{threads.length}</div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.22em] text-[#E8D19A]">Total Replies</div>
            <div className="mt-3 text-3xl font-semibold text-white">{totalReplies}</div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.22em] text-[#E8D19A]">Discussion Status</div>
            <div className="mt-3 text-lg font-semibold text-red-300">Open and Active</div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">Discussion Rules</div>
            <div className="mt-5 grid gap-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                Discuss evidence, timeline, transcript details, and case facts.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                Do not post private information, threats, harassment, or doxxing.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                Do not state unsupported accusations as confirmed fact.
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/case-file/${slug}`}
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Back to Case File
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">Start a Thread</div>
                <h2 className="mt-2 font-serif text-2xl text-white">Add to the Discussion</h2>
              </div>
              <div className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-200">
                Live Discussion
              </div>
            </div>

            <form onSubmit={handlePost} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[0.7fr_0.3fr]">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Thread title"
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
                />
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-[#C9A24A]/40"
                >
                  {tags.map((item) => (
                    <option key={item} value={item} className="bg-[#0d1117]">
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder="Share your question, timeline observation, or case theory..."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
              />

              <button
                type="submit"
                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Post Thread
              </button>
            </form>
          </div>
        </section>

        <section className="mb-6 rounded-[28px] border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
          <div className="mb-3 text-xs uppercase tracking-[0.26em] text-[#E8D19A]">Search Discussion</div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, tag, author, or thread content..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
          />
        </section>

        <section className="space-y-5">
          {filteredThreads.map((thread) => (
            <article
              key={thread.id}
              className={`rounded-[28px] border p-6 backdrop-blur-sm ${
                thread.pinned
                  ? "border-[#C9A24A]/30 bg-[linear-gradient(180deg,rgba(201,162,74,0.10),rgba(255,255,255,0.03))]"
                  : "border-white/10 bg-black/30"
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {thread.pinned && (
                      <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-200">
                        Pinned
                      </span>
                    )}
                    <span className="rounded-full border border-[#C9A24A]/25 bg-[#C9A24A]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E8D19A]">
                      {thread.tag}
                    </span>
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{thread.time}</span>
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-white">{thread.title}</h3>
                  <div className="mt-2 text-sm text-slate-400">Posted by {thread.author}</div>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {thread.replies.length} Replies
                </div>
              </div>

              <p className="mt-5 text-sm leading-8 text-slate-300">{thread.body}</p>

              {thread.replies.length > 0 && (
                <div className="mt-6 space-y-3">
                  {thread.replies.map((reply) => (
                    <div key={reply.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-white">{reply.author}</div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{reply.time}</div>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{reply.body}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setOpenReplyId(openReplyId === thread.id ? null : thread.id)}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {openReplyId === thread.id ? "Close Reply" : "Reply"}
                </button>
                <button
                  onClick={() =>
                    setLikedThreads((prev) =>
                      prev.includes(thread.id) ? prev.filter((id) => id !== thread.id) : [...prev, thread.id]
                    )
                  }
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                    likedThreads.includes(thread.id)
                      ? "border-red-500/30 bg-red-500/10 text-red-200"
                      : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {likedThreads.includes(thread.id) ? "Upvoted" : "Upvote"}
                </button>
                <button
                  onClick={() =>
                    setSavedThreads((prev) =>
                      prev.includes(thread.id) ? prev.filter((id) => id !== thread.id) : [...prev, thread.id]
                    )
                  }
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                    savedThreads.includes(thread.id)
                      ? "border-[#C9A24A]/30 bg-[#C9A24A]/10 text-[#E8D19A]"
                      : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {savedThreads.includes(thread.id) ? "Saved" : "Save"}
                </button>
              </div>

              {openReplyId === thread.id && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 text-xs uppercase tracking-[0.2em] text-[#E8D19A]">Add Reply</div>
                  <textarea
                    value={replyDrafts[thread.id] || ""}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [thread.id]: e.target.value }))}
                    rows={4}
                    placeholder="Write your reply..."
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
                  />
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleReplySubmit(thread.id)}
                      className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Post Reply
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}

          {filteredThreads.length === 0 && (
            <div className="rounded-[28px] border border-white/10 bg-black/30 p-8 text-center text-slate-400 backdrop-blur-sm">
              No discussion threads matched your search.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
