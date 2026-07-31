"use client";

import Link from "next/link";
import PictureScanClient from "./PictureScanClient";

export default function CasePictureScan({ isActive }: { isActive: boolean }) {
  if (!isActive) {
    return (
      <section className="mt-6 rounded-[32px] border border-[#C9A24A]/30 bg-gradient-to-br from-[#C9A24A]/[0.1] to-transparent p-7 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
            AI Picture Scan
          </div>
          <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E8D19A]">
            Premium
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Seen a photo tied to this case circulating online? Upload it and we&apos;ll read any visible
          text or captions and check it against every case and person in our database.
        </p>
        <Link
          href="/subscribe"
          className="mt-6 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
        >
          Subscribe to Unlock AI Picture Scan
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">AI Picture Scan</div>
        <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E8D19A]">
          Premium
        </span>
      </div>
      <PictureScanClient />
    </section>
  );
}
