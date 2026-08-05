import { redirect } from "next/navigation";
import CollectionPage from "../../../collections/[slug]/page";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function AccountCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/collections");
  if (!isActive) redirect("/account");

  return <CollectionPage params={params} embedded />;
}
