"use client";

import { use, useState } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";

export default function MemberRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar rightButtonLabel="Back to Case" rightButtonHref={`/case-file/${slug}`} />

        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            Subscriber Access
          </div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">
            Case Member Room
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            Private space for subscribers to submit questions, request deeper
            breakdowns, and follow premium case updates.
          </p>
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
              Member Access
            </div>

            <div className="mt-5 space-y-4 text-sm leading-8 text-slate-300">
              <p>This room is designed for premium subscribers who want more than the public case page.</p>
              <p>Use this space to submit:</p>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Case questions and theory requests
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Requests for deeper transcript analysis
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Follow-up topics for live breakdowns
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Corrections, tips, or scene analysis questions
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href={`/case-file/${slug}`}
                  className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Back to Case File
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
                  Member Question Form
                </div>
                <h2 className="mt-2 font-serif text-2xl text-white">
                  Submit a Case Request
                </h2>
              </div>

              <div className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D19A]">
                Premium
              </div>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
                    required
                  />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Your email"
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
                    required
                  />
                </div>

                <input
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  placeholder="Topic or question title"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
                  required
                />

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Type your question, theory, or request here..."
                  rows={7}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
                  required
                />

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
                <div className="text-sm font-semibold text-green-300">Request submitted</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Your subscriber question has been recorded for review.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
