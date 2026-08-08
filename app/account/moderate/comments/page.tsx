import { redirect } from "next/navigation";
import Navbar from "../../../components/Navbar";
import ModerationQueueClient from "./ModerationQueueClient";
import { checkPermission } from "@/lib/moderatorPermissions";

export default async function ModerateCommentsPage() {
  const { allowed, userId } = await checkPermission("moderate_comments");
  if (!userId) redirect("/login?next=/account/moderate/comments");
  if (!allowed) redirect("/account");

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 pb-20 pt-6">
        <div className="lg:hidden">
          <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Profile", href: "/account" }, { label: "Moderate Comments" }]} />
        </div>

        <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Moderation</div>
        <h1 className="mt-2 font-serif text-3xl font-bold text-white">Pending Comments</h1>

        <div className="mt-8">
          <ModerationQueueClient />
        </div>
      </div>
    </main>
  );
}
