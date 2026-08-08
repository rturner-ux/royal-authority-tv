"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The reset link lands here already carrying a recovery session --
    // supabase-js exchanges it for one automatically and fires this event.
    // Also check for an existing session directly, in case that already
    // happened before this listener attached.
    const { data: sub } = supabaseBrowser().auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabaseBrowser()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) setReady(true);
      });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/account");
      router.refresh();
    }, 2000);
  }

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Reset Password" }]} />

        <div className="mx-auto max-w-md">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Member Access</div>
          <h1 className="mt-3 font-serif text-4xl text-white">Choose a New Password</h1>

          <div className="mt-8 rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            {done ? (
              <p className="text-sm leading-7 text-slate-300">
                Password updated. Taking you to your account&hellip;
              </p>
            ) : !ready ? (
              <p className="text-sm leading-7 text-slate-400">
                Waiting on your reset link&hellip; if you opened this page directly instead of from the email, request
                a new link from{" "}
                <Link href="/forgot-password" className="text-[#E8D19A] hover:underline">
                  Forgot Password
                </Link>
                .
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
                  required
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
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
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
