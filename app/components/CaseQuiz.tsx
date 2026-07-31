"use client";

import { useState } from "react";
import Link from "next/link";
import { playSfx } from "@/lib/sfx";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  source_excerpt: string | null;
  source_url: string | null;
};

export default function CaseQuiz({
  slug,
  caseTitle,
  isActive,
}: {
  slug: string;
  caseTitle: string;
  isActive: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "active" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  async function start() {
    setStatus("loading");
    setError(null);
    playSfx("paper");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load the quiz right now.");
        setStatus("error");
        return;
      }
      setQuestions(data.questions);
      setIndex(0);
      setSelected(null);
      setScore(0);
      setStatus("active");
    } catch {
      setError("Could not load the quiz right now.");
      setStatus("error");
    }
  }

  function pick(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
    const correct = optionIndex === questions[index].correct_index;
    if (correct) {
      setScore((s) => s + 1);
      playSfx("shutter");
    }
  }

  function next() {
    if (index + 1 >= questions.length) {
      setStatus("done");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  function playAgain() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setStatus("active");
  }

  const current = questions[index];

  if (!isActive) {
    return (
      <section className="mt-10 rounded-[32px] border border-[#C9A24A]/30 bg-gradient-to-br from-[#C9A24A]/[0.1] to-transparent p-7 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
            Test Your Knowledge
          </div>
          <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E8D19A]">
            Premium
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Think you know this case? Take a short quiz built from the sourced facts on this page.
          Get one wrong and we&apos;ll show you exactly where the real answer comes from.
        </p>
        <Link
          href="/subscribe"
          className="mt-6 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
        >
          Subscribe to Unlock Test Your Knowledge
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-[32px] border border-[#C9A24A]/20 bg-gradient-to-br from-[#C9A24A]/[0.07] to-transparent p-7 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
          Test Your Knowledge
        </div>
        {status === "active" && (
          <div className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            Question {index + 1} of {questions.length}
          </div>
        )}
      </div>

      {status === "idle" && (
        <>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Think you know this case? Take a short quiz built from the sourced facts on this page.
            Get one wrong and we&apos;ll show you exactly where the real answer comes from.
          </p>
          <button
            type="button"
            onClick={start}
            className="mt-6 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-[#ddbb6a]"
          >
            Start Quiz
          </button>
        </>
      )}

      {status === "loading" && (
        <p className="mt-4 text-sm text-slate-400">Building your quiz from the case log...</p>
      )}

      {status === "error" && (
        <>
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
          <button
            type="button"
            onClick={start}
            className="mt-4 inline-flex rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Try Again
          </button>
        </>
      )}

      {status === "active" && current && (
        <div className="mt-5">
          <h3 className="font-serif text-xl text-white md:text-2xl">{current.question}</h3>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {current.options.map((opt, i) => {
              const isCorrect = i === current.correct_index;
              const isPicked = i === selected;
              const revealed = selected !== null;

              let classes =
                "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ";
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
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(i)}
                  disabled={revealed}
                  className={classes}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-5">
              {selected === current.correct_index ? (
                <p className="text-sm font-semibold text-emerald-300">Correct.</p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-red-300">Not quite.</p>
                  {current.source_excerpt && (
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      &ldquo;{current.source_excerpt}&rdquo;
                    </p>
                  )}
                  {current.source_url && (
                    <a
                      href={current.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs font-semibold text-[#E8D19A] hover:underline"
                    >
                      View source →
                    </a>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={next}
                className="mt-4 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
              >
                {index + 1 >= questions.length ? "See Results" : "Next Question"}
              </button>
            </div>
          )}
        </div>
      )}

      {status === "done" && (
        <div className="mt-5">
          <p className="text-2xl font-serif text-white">
            You got {score} of {questions.length} right.
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
            {score === questions.length
              ? `You know the ${caseTitle} case cold.`
              : "Review the Case Log below to brush up on what you missed."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={playAgain}
              className="inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Play Again
            </button>
            <Link
              href="/case-file"
              className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              More Cases →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
