import { redirect } from "next/navigation";
import CaseFileSlugPage from "../../../case-file/[slug]/page";
import { getSubscriberStatus } from "@/lib/subscription";

// Same case detail content as the public /case-file/[slug] page, rendered
// inside the account section's sidebar layout ("profile mode") -- reuses
// the real page component directly with embedded=true.
export default async function AccountCaseFileSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/case-file");
  if (!isActive) redirect("/account");

  return <CaseFileSlugPage params={params} embedded />;
}
