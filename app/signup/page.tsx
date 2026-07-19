"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabaseBrowser().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // If email confirmation is off in the Supabase project, signUp already
    // returns a live session -- go straight to checkout. Otherwise wait for
    // the user to confirm via email first.
    if (data.session) {
      router.push("/subscribe");
      router.refresh();
    } else {
      setCheckEmail(true);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Sign Up" }]} />

        <div className="mx-auto max-w-md">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            Subscriber Access
          </div>
          <h1 className="mt-3 font-serif text-4xl text-white">
            Create Your Account
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            $4.99/mo unlocks the Member Room, deeper case content, and early
            access to new cases.
          </p>

          {checkEmail ? (
            <div className="mt-8 rounded-[30px] border border-green-500/20 bg-green-500/10 p-6">
              <div className="text-sm font-semibold text-green-300">
                Check your email
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                We sent a confirmation link to {email}. Confirm your account,
                then{" "}
                <Link href="/login" className="text-[#E8D19A] hover:underline">
                  sign in
                </Link>{" "}
                to subscribe.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-4 rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                minLength={6}
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
                {loading ? "Creating account…" : "Create Account"}
              </button>

              <p className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="text-[#E8D19A] hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
