import { redirect } from "next/navigation";
import CollectionGenrePage from "../../../../collections/[slug]/[genreSlug]/page";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function AccountCollectionGenrePage({
  params,
}: {
  params: Promise<{ slug: string; genreSlug: string }>;
}) {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/collections");
  if (!isActive) redirect("/account");

  return <CollectionGenrePage params={params} embedded />;
}
