"use client";

import { useState } from "react";
import type { IncidentPerson } from "@/lib/types";
import PersonQA from "./PersonQA";
import WitnessComments from "./WitnessComments";

type Tab = "overview" | "bio" | "cases" | "comments";

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.15em] transition ${
        active ? "bg-[#C9A24A] text-black" : "text-white/50 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function PersonProfileTabs({ person }: { person: IncidentPerson }) {
  const hasBio = !!person.bio;
  const hasCases = person.connectedCases.length > 0;
  const hasOverview = !!person.summary || person.qa.length > 0;
  const isWitness = person.role === "witness";
  const showTabs = hasBio || hasCases || isWitness;
  const [tab, setTab] = useState<Tab>(hasOverview || !isWitness ? "overview" : "comments");

  if (!hasOverview && !hasBio && !hasCases && !isWitness) return null;

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/30 p-6">
      {showTabs ? (
        <div className="mb-5 flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>
            Overview
          </TabButton>
          {hasBio && (
            <TabButton active={tab === "bio"} onClick={() => setTab("bio")}>
              Bio
            </TabButton>
          )}
          {hasCases && (
            <TabButton active={tab === "cases"} onClick={() => setTab("cases")}>
              Connected Cases
            </TabButton>
          )}
          {isWitness && (
            <TabButton active={tab === "comments"} onClick={() => setTab("comments")}>
              Public Insight
            </TabButton>
          )}
        </div>
      ) : (
        <div className="mb-5 text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
          Investigative Relevance
        </div>
      )}

      {tab === "overview" && (
        <>
          {person.summary && <p className="text-sm leading-8 text-slate-300">{person.summary}</p>}
          <PersonQA qa={person.qa} />
        </>
      )}

      {showTabs && tab === "bio" && (
        <p className="text-sm leading-8 text-slate-300">{person.bio}</p>
      )}

      {showTabs && tab === "cases" && (
        <div className="space-y-4">
          {person.connectedCases.map((c) => (
            <div key={c.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-serif text-lg text-white">{c.case_title}</h4>
                {c.case_year && <span className="text-xs text-slate-500">{c.case_year}</span>}
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-300">{c.case_summary}</p>
              {c.source_url && (
                <a
                  href={c.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs text-[#67e8f9] hover:underline"
                >
                  Source
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {showTabs && tab === "comments" && isWitness && (
        <WitnessComments personId={person.id} comments={person.comments} />
      )}
    </div>
  );
}
