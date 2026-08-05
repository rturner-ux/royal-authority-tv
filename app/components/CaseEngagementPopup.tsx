"use client";

import { useEffect, useRef, useState } from "react";
import { playSfx } from "@/lib/sfx";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  source_excerpt: string | null;
  source_url: string | null;
};

// Passive engagement hook, distinct from the opt-in "Test Your Knowledge"
// section (CaseQuiz): after a visitor has been genuinely engaged with a
// case page for a while, surface one random question as an interruption --
// reuses the same cached-per-case question pool as CaseQuiz (/api/quiz),
// no separate content or generation needed.
export default function CaseEngagementPopup({ slug, isActive }: { slug: string; isActive: boolean }) {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const engagedMsRef = useRef(0);
  const thresholdMsRef = useRef(75_000 + Math.random() * 75_000); // 75-150s, randomized so it doesn't feel mechanical
  const firedRef = useRef(false);

  useEffect(() => {
    if (!isActive) return;
    const storageKey = `ra-case-quiz-popup-${slug}`;
    if (sessionStorage.getItem(storageKey)) return;

    const tick = setInterval(() => {
      if (document.visibilityState !== "visible" || firedRef.current) return;
      engagedMsRef.current += 1000;
      if (engagedMsRef.current >= thresholdMsRef.current) {
        firedRef.current = true;
        sessionStorage.setItem(storageKey, "1");
        fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (Array.isArray(d.questions) && d.questions.length > 0) {
              const pick = d.questions[Math.floor(Math.random() * d.questions.length)];
              setQuestion(pick);
              playSfx("paper");
            }
          })
          .catch(() => {});
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [slug, isActive]);

  if (!question || dismissed) return null;

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === question!.correct_index) playSfx("shutter");
  }

  return (
    <div className="fixed bottom-5 right-5 z-[200] w-[calc(100vw-2.5rem)] max-w-sm rounded-[28px] border border-[#C9A24A]/30 bg-[#0a0d14]/95 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.25em] text-[#E8D19A]">Still with us?</div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="flex-shrink-0 text-slate-500 transition hover:text-white"
        >
          ✕
        </button>
      </div>

      <h3 className="mt-3 font-serif text-base leading-6 text-white">{question.question}</h3>

      <div className="mt-4 grid gap-2">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correct_index;
          const isPicked = i === selected;
          const revealed = selected !== null;

          let classes = "rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition ";
          if (!revealed) {
            classes += "border-white/15 bg-white/[0.03] text-slate-200 hover:border-[#C9A24A]/40 hover:bg-[#C9A24A]/[0.06]";
          } else if (isCorrect) {
            classes += "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
          } else if (isPicked) {
            classes += "border-red-500/50 bg-red-500/10 text-red-300";
          } else {
            classes += "border-white/10 bg-white/[0.02] text-slate-500";
          }

          return (
            <button key={i} type="button" onClick={() => pick(i)} disabled={revealed} className={classes}>
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="mt-4">
          {selected === question.correct_index ? (
            <p className="text-sm font-semibold text-emerald-300">Correct.</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-red-300">Not quite.</p>
              {question.source_excerpt && (
                <p className="mt-1.5 text-xs leading-6 text-slate-400">&ldquo;{question.source_excerpt}&rdquo;</p>
              )}
            </>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="mt-3 inline-flex rounded-xl bg-[#C9A24A] px-4 py-2 text-xs font-semibold text-black transition hover:opacity-90"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
