import { redirect } from "next/navigation";
import LivePage from "../../live/page";
import { getSubscriberStatus } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default async function AccountLivePage() {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/live");
  if (!isActive) redirect("/account");

  return <LivePage embedded />;
}
