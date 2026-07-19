import Link from "next/link";

type NavbarProps = {
  rightButtonLabel?: string;
  rightButtonHref?: string;
  accountLabel?: string;
  accountHref?: string;
};

export default function Navbar({
  rightButtonLabel = "Transcript Archive",
  rightButtonHref = "/transcript",
  accountLabel,
  accountHref,
}: NavbarProps) {
  return (
    <div className="sticky top-0 z-30 mb-10 flex items-center justify-between border-b border-white/10 bg-[#05070b]/80 px-4 py-4 backdrop-blur-xl">
      <Link
        href="/"
        className="text-sm tracking-widest text-gray-400 transition hover:text-white"
      >
        ← ROYAL AUTHORITY
      </Link>

      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-xl border border-white/20 px-4 py-2 text-sm transition hover:bg-white hover:text-black"
        >
          Back Home
        </Link>

        {accountLabel && accountHref && (
          <Link
            href={accountHref}
            className="rounded-xl border border-[#C9A24A]/40 px-4 py-2 text-sm text-[#E8D19A] transition hover:bg-[#C9A24A]/10"
          >
            {accountLabel}
          </Link>
        )}

        <Link
          href={rightButtonHref}
          className="rounded-xl bg-[#C9A24A] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
        >
          {rightButtonLabel}
        </Link>
      </div>
    </div>
  );
}