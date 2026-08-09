import { redirect } from "next/navigation";
import CaseFileSlugPage, { generateMetadata } from "../../../case-file/[slug]/page";
import { getSubscriberStatus } from "@/lib/subscription";

// Reuses the public page's per-case metadata (title, description, and the
// same /case-file/[slug]/opengraph-image) -- without this export, Next.js
// silently falls back to the site-wide default OG image for links copied
// from this account-section URL instead of the case's own image.
export { generateMetadata };

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
