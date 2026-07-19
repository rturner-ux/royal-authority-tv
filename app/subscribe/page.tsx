"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { supabaseBrowser } from "@/lib/supabase/browser";

type SquareCard = {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<{
    status: string;
    token?: string;
    errors?: { message: string }[];
  }>;
};

declare global {
  interface Window {
    Square?: {
      payments: (
        appId: string,
        locationId: string
      ) => Promise<{ card: () => Promise<SquareCard> }>;
    };
  }
}

const SQUARE_JS_SRC =
  process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === "production"
    ? "https://web.squarecdn.com/v1/square.js"
    : "https://sandbox.web.squarecdn.com/v1/square.js";

export default function SubscribePage() {
  const router = useRouter();
  const cardRef = useRef<SquareCard | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data } = await supabaseBrowser().auth.getUser();
      if (!data.user) {
        router.push("/login?next=/subscribe");
        return;
      }

      const script = document.createElement("script");
      script.src = SQUARE_JS_SRC;
      script.async = true;
      script.onload = async () => {
        if (cancelled || !window.Square) return;
        const payments = await window.Square.payments(
          process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
        );
        const card = await payments.card();
        await card.attach("#square-card-container");
        cardRef.current = card;
        if (!cancelled) setReady(true);
      };
      document.body.appendChild(script);
    }

    init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit() {
    if (!cardRef.current) return;
    setSubmitting(true);
    setError(null);

    const result = await cardRef.current.tokenize();

    if (result.status !== "OK" || !result.token) {
      setSubmitting(false);
      setError(result.errors?.[0]?.message || "Card declined. Please try another card.");
      return;
    }

    const res = await fetch("/api/square/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId: result.token }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Couldn't start your subscription. Please try again.");
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar rightButtonLabel="Back Home" rightButtonHref="/" />

        <div className="mx-auto max-w-md">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            Subscriber Access
          </div>
          <h1 className="mt-3 font-serif text-4xl text-white">
            $4.99<span className="text-lg font-normal text-slate-400">/mo</span>
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Unlocks the Member Room, deeper case content, and early access to
            new cases. Cancel anytime.
          </p>

          <div className="mt-8 rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            <div id="square-card-container" className="min-h-[90px]" />

            {error && (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!ready || submitting}
              className="mt-4 w-full rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Processing…" : "Subscribe — $4.99/mo"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
