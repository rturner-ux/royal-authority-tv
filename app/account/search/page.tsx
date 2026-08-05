import { redirect } from "next/navigation";
import SearchPage from "../../search/page";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function AccountSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/search");
  if (!isActive) redirect("/account");

  return <SearchPage searchParams={searchParams} embedded />;
}
