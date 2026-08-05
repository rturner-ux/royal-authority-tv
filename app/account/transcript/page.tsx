import { redirect } from "next/navigation";
import TranscriptArchivePage from "../../transcript/page";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function AccountTranscriptPage() {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/transcript");
  if (!isActive) redirect("/account");

  return <TranscriptArchivePage embedded />;
}
