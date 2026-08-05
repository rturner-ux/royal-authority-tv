import { redirect } from "next/navigation";
import PictureScanPage from "../../picture-scan/page";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function AccountPictureScanPage() {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/picture-scan");
  if (!isActive) redirect("/account");

  return <PictureScanPage embedded />;
}
