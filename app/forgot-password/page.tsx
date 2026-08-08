"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    // Shown regardless of whether the email exists -- an error here would
    // let anyone probe which addresses have accounts.
    if (!error) setSent(true);
    else setError(error.message);
  }

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Sign In", href: "/login" }, { label: "Forgot Password" }]}
        />

        <div className="mx-auto max-w-md">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Member Access</div>
          <h1 className="mt-3 font-serif text-4xl text-white">Reset Password</h1>

          {sent ? (
            <div className="mt-8 rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
              <p className="text-sm leading-7 text-slate-300">
                If an account exists for <span className="text-white">{email}</span>, a password reset link is on
                its way. Check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-4 rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm"
            >
              <p className="text-sm leading-6 text-slate-400">
                Enter the email on your account and we&apos;ll send you a link to reset your password.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
                required
              />

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>

              <p className="text-center text-sm text-slate-400">
                <Link href="/login" className="text-[#E8D19A] hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
