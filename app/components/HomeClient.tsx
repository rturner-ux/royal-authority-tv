"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import type { Incident } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";
import Navbar from "./Navbar";
import FilmGrain from "./FilmGrain";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay, ease: EASE } }),
};
const staggerContainer = (stagger = 0.09, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
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

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? "show" : "hidden"} custom={delay} className={className}>
      {children}
    </motion.div>
  );
}

type PathIcon = "files" | "transcript" | "map" | "shield";

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
    shield: (
      <>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
        <path d="m9 12 2 2 4-4" />
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

const reasons = [
  {
    icon: "shield" as PathIcon,
    title: "Verified Sourcing",
    text: "Every fact is labeled by claim type, confirmed fact, official statement, family claim, or disputed allegation, so you always know how solid the ground is.",
  },
  {
    icon: "files" as PathIcon,
    title: "Investigative Case Files",
    text: "Full timelines, sourced facts, and profiles of everyone involved in each case, built for real investigative depth.",
  },
  {
    icon: "map" as PathIcon,
    title: "Real-Time Case Map",
    text: "Every active case plotted geographically and updated as new alerts and reports come in.",
  },
  {
    icon: "transcript" as PathIcon,
    title: "Full Source Transcripts",
    text: "Original-language transcripts of press conferences and official statements, archived in full.",
  },
];

const faqs = [
  {
    q: "What is Royal Authority TV?",
    a: "A documentary-style investigative outlet covering missing-persons cases and high-profile investigations, built around verified sourcing rather than speculation.",
  },
  {
    q: "How do you verify what's on the site?",
    a: "Every fact in a case's Case Log is labeled by claim type, confirmed fact, official statement, family claim, disputed allegation, or unconfirmed report, and linked to its original source.",
  },
  {
    q: "Is the live map free to use?",
    a: "Yes. The live map and every case file are free to browse right now.",
  },
  {
    q: "How often is the map updated?",
    a: "Cases are reviewed and updated as new verified information becomes available, from official alerts and statements to confirmed news reporting.",
  },
  {
    q: "What do the claim-type labels mean?",
    a: "Confirmed Fact is independently verified. Official Statement comes from police, government, or an official spokesperson. Family Claim is what a family has said publicly. Disputed Allegation is contested by at least one party. Unconfirmed Report hasn't been independently verified yet.",
  },
  {
    q: "Can I share a case?",
    a: "Yes, every case file has a Share button that generates a branded preview card for social media and messaging apps.",
  },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      variants={staggerItem}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      transition={{ delay: index * 0.05 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-white/[0.03]"
      >
        <h3 className="text-base font-black text-white md:text-lg">{q}</h3>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25, ease: EASE }} className="flex-shrink-0 text-2xl text-[#E8D19A]">
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 leading-relaxed text-white/60">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TrendingCarousel({ cases }: { cases: Incident[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<Incident["category"] | "all">("all");

  const categories = Array.from(new Set(cases.map((c) => c.category)));
  const filtered = activeCategory === "all" ? cases : cases.filter((c) => c.category === activeCategory);

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2 pt-6">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] transition ${
            activeCategory === "all"
              ? "border-[#C9A24A] bg-[#C9A24A] text-black"
              : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] transition ${
              activeCategory === cat
                ? "border-transparent text-black"
                : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
            }`}
            style={activeCategory === cat ? { backgroundColor: CATEGORY_COLORS[cat] } : undefined}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="relative">
      <div ref={scrollerRef} className="flex gap-6 overflow-x-auto pb-4 pl-1 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filtered.map((c, i) => (
          <Link
            key={c.id}
            href={`/case-file/${c.slug}`}
            className="group relative flex flex-shrink-0 items-end"
            style={{ width: 220 }}
          >
            <span
              className="pointer-events-none select-none font-serif text-[7rem] font-bold leading-none text-white/10 transition group-hover:text-white/15"
              style={{ marginRight: -28 }}
            >
              {i + 1}
            </span>
            <div className="relative h-[150px] w-[150px] flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-xl transition group-hover:scale-105 group-hover:border-[#C9A24A]/50">
              {c.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image_url} alt={c.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl text-white/20">?</div>
              )}
              <span
                className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-black"
                style={{ backgroundColor: CATEGORY_COLORS[c.category] }}
              >
                {CATEGORY_LABELS[c.category]}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <button
        type="button"
        aria-label="Scroll trending cases"
        onClick={() => scrollerRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
        className="absolute right-0 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur-sm transition hover:bg-black/90 md:flex"
      >
        →
      </button>
      </div>
    </div>
  );
}

type Stats = { totalCases: number; featuredCases: number; transcriptRows: number };

type AccountProps = { accountLabel?: string; accountHref?: string };

export default function HomeClient({
  cases,
  stats,
  accountLabel,
  accountHref,
}: { cases: Incident[]; stats: Stats } & AccountProps) {
  const statRow = [
    { value: stats.totalCases, label: "Cases Tracked" },
    { value: stats.transcriptRows, label: "Verified Transcript Entries" },
    { value: stats.featuredCases, label: "Featured Investigations" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/hero-wallpaper.webp" alt="" fill priority className="object-cover opacity-[0.85]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-[#020617]" />
        <FilmGrain opacity={0.045} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{
            background: "linear-gradient(to bottom, rgba(201,162,74,0.08), transparent)",
            animation: "ra-scanline 7s linear infinite",
            mixBlendMode: "screen",
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-6 lg:px-16">
          <Navbar accountLabel={accountLabel} accountHref={accountHref} />
        </div>

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-28 pt-16 text-center lg:pb-36 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, rotate: -6, scale: 0.9 }}
            animate={{ opacity: 1, rotate: -4, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            className="mb-8 select-none rounded-sm border-2 border-red-600/60 px-4 py-1.5"
          >
            <div className="font-mono text-[10px] uppercase leading-tight tracking-[0.3em] text-red-500/90">
              Case File: Active
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: EASE }}
            className="font-serif text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl"
          >
            Investigate every case.
            <span className="block italic text-red-500">Anytime.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl"
          >
            Documentary-grade coverage of missing-persons cases and high-profile investigations.
            Sourced facts, labeled by confidence, tracked in real time.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-4 text-sm text-white/60"
          >
            Free to browse. No paywall on the map or the case files.
          </motion.p>

          <motion.div
            variants={staggerContainer(0.1, 0.7)}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.div variants={staggerItem}>
              <Link
                href="/case-file"
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
              >
                Browse Case Files <span>→</span>
              </Link>
            </motion.div>
            <motion.div variants={staggerItem}>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-black/30 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Open Live Map
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.1, 0.9)}
            initial="hidden"
            animate="show"
            className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {statRow.map((s, i) => (
              <motion.div key={s.label} variants={staggerItem} className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
                  Ref-{String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-1 text-4xl font-black text-[#E8D19A]">
                  <CountUp target={s.value} />
                  <span className="text-red-500">+</span>
                </div>
                <div className="mt-2 text-sm text-white/60">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Curved divider */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1 left-0 w-full text-[#020617]"
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
        >
          <path d="M0,60 C300,0 900,0 1200,60 L1200,60 L0,60 Z" fill="currentColor" />
          <path d="M0,58 C300,0 900,0 1200,58" fill="none" stroke="url(#ra-divider-gradient)" strokeWidth="2" />
          <defs>
            <linearGradient id="ra-divider-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#C9A24A" />
            </linearGradient>
          </defs>
        </svg>
      </section>

      {/* Promo bar */}
      <section className="px-6 pt-10 lg:px-16">
        <Reveal className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#C9A24A]/20 bg-gradient-to-r from-[#1a1030] to-[#0b1220] px-6 py-5">
          <div className="flex items-center gap-4">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-red-600/20 text-lg">🔴</span>
            <div>
              <div className="font-bold text-white">Live map now tracking active cases</div>
              <div className="text-sm text-white/50">Category filters, real-time pins, zero cost to browse.</div>
            </div>
          </div>
          <Link href="/map" className="flex-shrink-0 rounded-md border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20">
            View Map
          </Link>
        </Reveal>
      </section>

      {/* Trending Cases */}
      <section className="px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="text-2xl font-black md:text-3xl">Trending Cases</h2>
          </Reveal>
          <TrendingCarousel cases={cases} />
        </div>
      </section>

      {/* Why Royal Authority TV */}
      <section className="px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10">
            <h2 className="text-2xl font-black md:text-3xl">Why Royal Authority TV</h2>
          </Reveal>

          <motion.div
            variants={staggerContainer(0.08, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {reasons.map((r) => (
              <motion.div key={r.title} variants={staggerItem} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <PathIconGlyph icon={r.icon} />
                <h3 className="mt-5 text-lg font-black">{r.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{r.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Meet Royal Authority */}
      <section className="px-6 py-16 lg:px-16">
        <Reveal className="mx-auto flex max-w-5xl flex-col items-center gap-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-8 sm:flex-row sm:p-10">
          <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#C9A24A]/40 sm:h-48 sm:w-48">
            <Image
              src="/royal-authority-host.webp"
              alt="Royal Authority"
              fill
              className="object-cover"
            />
          </div>
          <div className="text-center sm:text-left">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#E8D19A]">
              Meet Royal Authority
            </div>
            <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
              Royal Authority tracks missing-persons cases, suspicious deaths, and
              investigations that deserve more scrutiny than a single news cycle
              gives them. Verified sources, claim-type labeling on every fact,
              and coverage that stays with a case long after the headlines move
              on.
            </p>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <Reveal className="mb-10">
            <h2 className="text-2xl font-black md:text-3xl">Frequently Asked Questions</h2>
          </Reveal>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-20 lg:px-16">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="font-serif text-3xl font-medium leading-tight md:text-4xl">
            Ready to investigate? <span className="italic text-red-500">Start now.</span>
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/case-file"
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
            >
              Browse Case Files <span>→</span>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-12 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-8 text-sm text-white/50 sm:grid-cols-3">
          <div>
            <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-white/30">Coverage</div>
            <div className="space-y-2">
              <Link href="/case-file" className="block transition hover:text-white">Case Files</Link>
              <Link href="/transcript" className="block transition hover:text-white">Transcripts</Link>
              <Link href="/map" className="block transition hover:text-white">Live Map</Link>
            </div>
          </div>
          <div>
            <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-white/30">About</div>
            <div className="space-y-2">
              <span className="block">Royal Authority TV</span>
              <span className="block">Verified-source investigative reporting</span>
            </div>
          </div>
          <div>
            <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-white/30">Standard</div>
            <div className="space-y-2">
              <span className="block">Claim-type labeling on every fact</span>
              <span className="block">No speculation dressed up as reporting</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
