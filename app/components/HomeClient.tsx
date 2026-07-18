"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { Incident } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";
import Navbar from "./Navbar";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay, ease: EASE } }),
};
const fadeLeft = {
  hidden: { opacity: 0, x: -28 },
  show: (delay = 0) => ({ opacity: 1, x: 0, transition: { duration: 0.9, delay, ease: EASE } }),
};
const fadeRight = {
  hidden: { opacity: 0, x: 28 },
  show: (delay = 0) => ({ opacity: 1, x: 0, transition: { duration: 0.9, delay, ease: EASE } }),
};
const staggerContainer = (stagger = 0.09, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
const lineDraw = {
  hidden: { scaleX: 0, originX: 0 },
  show: (delay = 0) => ({ scaleX: 1, transition: { duration: 0.6, delay, ease: EASE } }),
};

function CountUp({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const elapsed = Math.min(now - start, duration);
      const eased = 1 - Math.pow(1 - elapsed / duration, 3);
      setDisplay(Math.round(eased * target));
      if (elapsed < duration) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const variant = direction === "left" ? fadeLeft : direction === "right" ? fadeRight : fadeUp;
  return (
    <motion.div ref={ref} variants={variant} initial="hidden" animate={inView ? "show" : "hidden"} custom={delay} className={className}>
      {children}
    </motion.div>
  );
}

type PathIcon = "files" | "transcript" | "map";

function PathIconGlyph({ icon }: { icon: PathIcon }) {
  const paths: Record<PathIcon, ReactNode> = {
    files: (
      <>
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h4l2 2.5H18a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 18 18.5H6a2 2 0 0 1-2-2z" />
        <path d="M4 10h16" />
      </>
    ),
    transcript: (
      <>
        <path d="M6 4h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
        <path d="M14 4v4h4" />
        <path d="M8 12h8" />
        <path d="M8 15.5h8" />
        <path d="M8 19h5" />
      </>
    ),
    map: (
      <>
        <path d="M9 5 4 7v12l5-2 6 2 5-2V5l-5 2-6-2z" />
        <path d="M9 5v12" />
        <path d="M15 7v12" />
      </>
    ),
  };

  return (
    <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl border border-[#C9A24A]/30 bg-[#C9A24A]/10 text-[#E8D19A]">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {paths[icon]}
      </svg>
    </span>
  );
}

const paths = [
  {
    icon: "files" as PathIcon,
    label: "Case Files",
    title: "Investigative Case Files",
    text: "Every case is broken down into a timeline of sourced facts, each labeled by claim type, confirmed fact, official statement, family claim, or disputed allegation, so you always know how solid the ground is.",
    href: "/case-file",
    cta: "Browse Case Files",
  },
  {
    icon: "transcript" as PathIcon,
    label: "Transcripts",
    title: "Full Source Transcripts",
    text: "Original-language transcripts of press conferences and official statements, translated side-by-side, archived in full rather than cut down to a soundbite.",
    href: "/transcript",
    cta: "Read Transcripts",
  },
  {
    icon: "map" as PathIcon,
    label: "Live Map",
    title: "Real-Time Case Map",
    text: "Every active case plotted geographically and updated as new alerts and reports come in, from official state alert systems to verified news sources.",
    href: "/map",
    cta: "Open Live Map",
  },
];

const standards = [
  "Verified Sourcing",
  "Claim-Type Labeling",
  "Multi-Language Transcripts",
  "Real-Time Case Map",
  "No Speculation",
];

type Stats = { totalCases: number; featuredCases: number; transcriptRows: number };

export default function HomeClient({ cases, stats }: { cases: Incident[]; stats: Stats }) {
  const statRow = [
    { value: stats.totalCases, label: "Cases Tracked" },
    { value: stats.transcriptRows, label: "Verified Transcript Entries" },
    { value: stats.featuredCases, label: "Featured Investigations" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#020617] to-black" />
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-6 lg:px-16">
          <Navbar rightButtonLabel="Case Files" rightButtonHref="/case-file" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-6 lg:px-16 lg:pb-28">
          <div className="mb-6 flex items-center gap-3">
            <motion.span variants={lineDraw} initial="hidden" animate="show" custom={0.2} className="block h-px w-8 bg-[#C9A24A]" />
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="text-xs font-black uppercase tracking-[0.3em] text-[#E8D19A]">
              Verified-Source Investigative Reporting
            </motion.span>
          </div>

          <div className="overflow-hidden">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: EASE }}
              className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl"
            >
              ROYAL AUTHORITY
              <span className="block text-red-500">TV</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl"
          >
            Documentary-grade coverage of missing-persons cases and high-profile investigations.
            Sourced facts, labeled by confidence, tracked in real time, no speculation dressed up
            as reporting.
          </motion.p>

          <motion.div
            variants={staggerContainer(0.1, 0.65)}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <motion.div variants={staggerItem}>
              <Link href="/case-file" className="inline-block rounded-xl bg-red-600 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700">
                View Case Files
              </Link>
            </motion.div>
            <motion.div variants={staggerItem}>
              <Link href="/map" className="inline-block rounded-xl border border-[#C9A24A]/40 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-[#E8D19A] transition hover:bg-[#C9A24A]/10">
                Live Map
              </Link>
            </motion.div>
            <motion.div variants={staggerItem}>
              <Link href="/transcript" className="inline-block rounded-xl border border-white/15 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-white/80 transition hover:bg-white/10">
                Read Transcripts
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.1, 0.85)}
            initial="hidden"
            animate="show"
            className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {statRow.map((s) => (
              <motion.div key={s.label} variants={staggerItem} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
                <div className="text-4xl font-black text-[#E8D19A]">
                  <CountUp target={s.value} />
                  <span className="text-red-500">+</span>
                </div>
                <div className="mt-2 text-sm text-white/60">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Standards bar */}
      <section className="relative border-y border-white/10 bg-white/[0.02] px-6 py-10 lg:px-16">
        <Reveal className="text-center">
          <motion.div
            variants={staggerContainer(0.1, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs font-black uppercase tracking-[0.2em] text-white/40 md:text-sm"
          >
            {standards.map((s) => (
              <motion.span key={s} variants={staggerItem} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#C9A24A]" />
                {s}
              </motion.span>
            ))}
          </motion.div>
        </Reveal>
      </section>

      {/* How we cover a case */}
      <section className="px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-14 max-w-2xl">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-[#E8D19A]">How We Cover A Case</div>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              Three ways into every investigation.
            </h2>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {paths.map((p, i) => (
              <Reveal key={p.href} delay={i * 0.1}>
                <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3, ease: EASE }} className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <PathIconGlyph icon={p.icon} />
                  <div className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#E8D19A]">{p.label}</div>
                  <h3 className="mt-2 text-xl font-black">{p.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{p.text}</p>
                  <Link href={p.href} className="mt-auto pt-6 inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-[#E8D19A] transition hover:text-white">
                    {p.cta} <span>→</span>
                  </Link>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured cases */}
      <section className="border-t border-white/10 bg-white/[0.015] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.3em] text-[#E8D19A]">Featured Investigations</div>
              <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">Active case coverage.</h2>
            </div>
            <Link href="/case-file" className="text-sm font-black uppercase tracking-[0.15em] text-red-400 transition hover:text-red-500">
              View All →
            </Link>
          </Reveal>

          <motion.div
            variants={staggerContainer(0.08, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {cases.map((c) => (
              <motion.div key={c.id} variants={staggerItem}>
                <Link
                  href={`/case-file/${c.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-[#C9A24A]/40"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-black/40">
                    {c.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image_url} alt={c.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl text-white/20">?</div>
                    )}
                    <span
                      className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-black"
                      style={{ backgroundColor: CATEGORY_COLORS[c.category] }}
                    >
                      {CATEGORY_LABELS[c.category]}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-black leading-snug transition group-hover:text-[#E8D19A]">{c.title}</h3>
                    {c.location_label && <div className="mt-2 text-xs text-white/50">{c.location_label}</div>}
                    <span className="mt-auto pt-5 inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.15em] text-[#E8D19A]">
                      Open Case File <span>→</span>
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-white/10 px-6 py-24 lg:px-16">
        <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-3xl border border-[#C9A24A]/20 bg-gradient-to-br from-white/[0.04] to-transparent p-12 text-center">
          <h2 className="text-3xl font-black leading-tight md:text-4xl">See every verified case, tracked in real time.</h2>
          <p className="max-w-xl text-white/60">
            No paywall on the map, no speculation in the case files, just sourced reporting you can check for yourself.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/case-file" className="rounded-xl bg-red-600 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700">
              Browse Case Files
            </Link>
            <Link href="/map" className="rounded-xl border border-[#C9A24A]/40 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-[#E8D19A] transition hover:bg-[#C9A24A]/10">
              Open Live Map
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
