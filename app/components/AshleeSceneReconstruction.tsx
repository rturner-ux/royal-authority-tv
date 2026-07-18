"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AshleeSceneReconstruction() {
  return (
    <>
      <section className="mb-10 rounded-[32px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
        <div className="mb-4 text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
          Resort Map Reconstruction
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <Image
            src="/zuri-map.png"
            alt="Zuri Zanzibar resort map"
            width={1400}
            height={900}
            className="h-auto w-full object-contain"
            priority
          />

          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M23 77 Q30 58 36 44 Q40 34 43 23"
              fill="transparent"
              stroke="#facc15"
              strokeWidth="0.45"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, delay: 1 }}
            />

            <motion.circle
              r="0.9"
              fill="#facc15"
              initial={{ offsetDistance: "0%", opacity: 0 }}
              animate={{ offsetDistance: "100%", opacity: 1 }}
              transition={{ duration: 2.2, delay: 1.1, ease: "easeInOut" }}
              style={{
                offsetPath: "path('M23 77 Q30 58 36 44 Q40 34 43 23')",
                offsetRotate: "0deg",
              }}
            />
          </svg>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="absolute left-[23%] top-[77%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          >
            <motion.div
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="h-4 w-4 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]"
            />
            <span className="mt-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-300">
              Villa 25
            </span>
          </motion.div>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.45 }}
            className="absolute left-[43%] top-[23%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          >
            <motion.div
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="h-4 w-4 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]"
            />
            <span className="mt-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
              Villa 65
            </span>
          </motion.div>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          Marker placement is based on the numbered villa clusters shown on the
          resort map. Villa 25 aligns with the Cardamom 21–26 zone, while
          Villa 65 aligns with the Lemongrass 61–68 zone. This is a scene
          reconstruction reference, not an exact room-number confirmation.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
          <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
            Distance Insight
          </div>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            The reported 8 to 10 minute walk suggests meaningful separation
            between the two villas. This was not a next-door move. The map
            supports the idea that Villa 65 was located in a different zone of
            the property.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
          <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
            Visibility
          </div>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            The resort&apos;s private-villa design and vegetation reduce direct
            sightlines. That matters when evaluating who could see movement,
            how quickly staff could respond, and how isolated each villa was.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
          <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
            Timeline Impact
          </div>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            A 20 minute window on a property of this size carries more weight
            than it would in a compact hotel. Walking paths, villa spacing,
            and staff travel time all affect scene reconstruction.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
          <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
            Key Observation
          </div>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            The separation between Villa 25 and Villa 65 shifts the focus to
            movement, timing, and access across the property, not just simple
            proximity.
          </p>
        </div>
      </section>
    </>
  );
}
