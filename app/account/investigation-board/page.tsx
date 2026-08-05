import { redirect } from "next/navigation";
import InvestigationBoardPage from "../../investigation-board/page";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function AccountInvestigationBoardPage() {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/investigation-board");
  if (!isActive) redirect("/account");

  return <InvestigationBoardPage embedded />;
}
