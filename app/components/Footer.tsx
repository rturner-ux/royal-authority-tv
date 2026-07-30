import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#05070b]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <div className="font-serif text-lg text-white">Royal Authority TV</div>
            <p className="mt-2 max-w-xs text-xs leading-6 text-slate-300">
              Documentary-grade true-crime and missing-persons coverage, sourced and claim-typed.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-[#E8D19A]">Site</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li><Link href="/case-file" className="hover:text-white">Case Files</Link></li>
                <li><Link href="/map" className="hover:text-white">Investigation Map</Link></li>
                <li><Link href="/transcript" className="hover:text-white">Transcript Archive</Link></li>
                <li><Link href="/picture-scan" className="hover:text-white">AI Picture Scan</Link></li>
                <li><Link href="/subscribe" className="hover:text-white">Subscribe</Link></li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-[#E8D19A]">Legal</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/community-guidelines" className="hover:text-white">Community Guidelines</Link></li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-[#E8D19A]">Contact</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>
                  <a href="mailto:submissions@royalauthorityofficial.com" className="hover:text-white">
                    submissions@royalauthorityofficial.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/5 pt-6 text-xs text-slate-300">
          &copy; {new Date().getFullYear()} Royal Authority TV. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
