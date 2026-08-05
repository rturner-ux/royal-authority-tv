import { redirect } from "next/navigation";
import CaseFilePage from "../../case-file/page";
import { getSubscriberStatus } from "@/lib/subscription";

export const dynamic = "force-dynamic";

// Same listing as the public /case-file page, rendered inside the account
// section's sidebar layout ("profile mode") instead of navigating away from
// it -- reuses the real page component directly with embedded=true.
export default async function AccountCaseFilePage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/case-file");
  if (!isActive) redirect("/account");

  return <CaseFilePage searchParams={searchParams} embedded />;
}
