"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FilmGrain from "./FilmGrain";

export default function JoinLanding() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/signup?email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="absolute inset-0">
        <Image src="/hero-wallpaper.webp" alt="" fill priority className="object-cover opacity-[0.6]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-[#020617]" />
      <FilmGrain opacity={0.045} />

      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-16">
        <Link href="/">
          <Image src="/royal-authority-wordmark.png" alt="Royal Authority TV" width={80} height={74} unoptimized className="h-14 w-auto" />
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-white/25 bg-black/30 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
        >
          Sign In
        </Link>
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-32 pt-16 text-center lg:pt-24">
        <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight md:text-6xl">
          Every case. Every timeline.
          <span className="block italic text-red-500">All in one place.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
          Verified sourcing, claim-type labeling, and coverage that stays with a
          case long after the headlines move on. Starts at $4.99/mo. Cancel
          anytime.
        </p>

        <p className="mt-8 text-base font-semibold text-white/90">
          Ready to join? Enter your email to get started.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex w-full max-w-lg flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="flex-1 rounded-md border border-white/20 bg-black/40 px-5 py-4 text-base text-white outline-none placeholder:text-white/40 focus:border-[#C9A24A]/60"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
          >
            Get Started <span>→</span>
          </button>
        </form>

        <Link
          href="/case-file"
          className="mt-8 text-sm text-white/60 underline underline-offset-4 transition hover:text-white"
        >
          Just want to browse? See Case Files free →
        </Link>
      </div>
    </main>
  );
}
