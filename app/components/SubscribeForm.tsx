"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SQUARE_JS_SRC =
  process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === "production"
    ? "https://web.squarecdn.com/v1/square.js"
    : "https://sandbox.web.squarecdn.com/v1/square.js";

export default function SubscribeForm() {
  const router = useRouter();
  const cardRef = useRef<SquareCard | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const recaptchaLoaded = useRef(false);

  useEffect(() => {
    let cancelled = false;

    if (!recaptchaLoaded.current && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      const rc = document.createElement("script");
      rc.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
      document.body.appendChild(rc);
      recaptchaLoaded.current = true;
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

    return () => {
      cancelled = true;
    };
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

    let recaptchaToken = "";
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey && window.grecaptcha) {
      await new Promise<void>((resolve) => window.grecaptcha!.ready(resolve));
      recaptchaToken = await window.grecaptcha.execute(siteKey, { action: "subscribe" });
    }

    const res = await fetch("/api/square/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId: result.token, recaptchaToken }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const code = body.detail?.[0]?.code || body.detail?.code;
      const friendly =
        code === "INVALID_CARD_DATA" || code === "CARD_DECLINED" || code === "GENERIC_DECLINE"
          ? "Your card was declined. Please check your card details, make sure the card isn't frozen or blocked, or try a different card."
          : body.error || "Couldn't start your subscription. Please try again.";
      setError(friendly);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
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
        {submitting ? "Processing…" : "Subscribe for $4.99/mo"}
      </button>

      {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
        <p className="mt-4 text-center text-[11px] text-slate-500">
          This site is protected by reCAPTCHA and the Google{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">
            Terms of Service
          </a>{" "}
          apply.
        </p>
      )}
    </div>
  );
}
