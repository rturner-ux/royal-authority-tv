import Link from "next/link";

export default async function UnsubscribeCaseAlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const message =
    status === "done"
      ? "You've been unsubscribed from case update alerts. You can turn them back on any time from your account page."
      : status === "missing-token"
        ? "That unsubscribe link is missing its token. Try opening the link from the email again, or manage alerts from your account page."
        : "Something went wrong processing this request. Please manage your alert preference directly from your account page.";

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#05070b] px-6 text-white">
      <div className="max-w-md rounded-[32px] border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-sm">
        <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">Royal Authority TV</div>
        <h1 className="mt-3 font-serif text-2xl text-white">Case Alerts</h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">{message}</p>
        <Link
          href="/account"
          className="mt-6 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
        >
          Go to My Account
        </Link>
      </div>
    </main>
  );
}
