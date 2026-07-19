"use client";

import { useState } from "react";
import type { InterviewQA } from "@/lib/types";

export default function PersonQA({ qa }: { qa: InterviewQA[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (qa.length === 0) return null;

  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <div className="mb-3 text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
        {qa.length} Question{qa.length === 1 ? "" : "s"} &amp; Answers
      </div>

      <div className="space-y-2">
        {qa.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:text-white"
              >
                <span className="text-[#C9A24A]">{isOpen ? "▾" : "▸"}</span>
                {item.question}
              </button>
              {isOpen && (
                <div className="border-t border-white/10 px-4 py-4 text-sm leading-7 text-slate-300">
                  &ldquo;{item.answer}&rdquo;
                  <div className="mt-3 text-xs text-slate-500">
                    Source:{" "}
                    {item.source_url ? (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#67e8f9] hover:underline"
                      >
                        {item.source_name}
                      </a>
                    ) : (
                      item.source_name
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
