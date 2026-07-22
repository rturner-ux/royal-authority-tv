"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "case-information", label: "Case Information" },
  { id: "party", label: "Party" },
  { id: "charge", label: "Charge" },
  { id: "bond-settings", label: "Bond Settings" },
  { id: "events-and-hearings", label: "Events and Hearings" },
  { id: "financial", label: "Financial" },
  { id: "documents", label: "Documents" },
];

export default function CourtRecordNav({ available }: { available: string[] }) {
  const [active, setActive] = useState(available[0] ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );
    for (const id of available) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [available]);

  const items = SECTIONS.filter((s) => available.includes(s.id));
  if (items.length === 0) return null;

  return (
    <nav className="sticky top-24 hidden self-start lg:block">
      <div className="rounded-[24px] border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
        <ul className="space-y-1 text-sm">
          {items.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`block rounded-lg border-l-2 px-3 py-2 transition ${
                  active === s.id
                    ? "border-[#C9A24A] bg-[#C9A24A]/10 text-[#E8D19A]"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-white/10 pt-3">
          <a href="#top" className="text-xs text-slate-500 transition hover:text-white">
            ↑ Back to top
          </a>
        </div>
      </div>
    </nav>
  );
}
