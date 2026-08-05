import { redirect } from "next/navigation";
import MapPage from "../../map/page";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function AccountMapPage() {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/map");
  if (!isActive) redirect("/account");

  return <MapPage embedded />;
}
