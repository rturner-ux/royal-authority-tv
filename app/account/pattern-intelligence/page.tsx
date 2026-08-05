import { redirect } from "next/navigation";
import PatternIntelligencePage from "../../pattern-intelligence/page";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function AccountPatternIntelligencePage() {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/pattern-intelligence");
  if (!isActive) redirect("/account");

  return <PatternIntelligencePage embedded />;
}
