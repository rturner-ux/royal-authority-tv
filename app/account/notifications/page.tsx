import { redirect } from "next/navigation";
import Navbar from "../../components/Navbar";
import NotificationsClient from "./NotificationsClient";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function NotificationsPage() {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/notifications");
  if (!isActive) redirect("/account");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-6">
        <div className="lg:hidden">
          <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Profile", href: "/account" }, { label: "Notifications" }]} />
        </div>

        <h1 className="font-serif text-3xl font-bold text-white">Notifications</h1>

        <div className="mt-8">
          <NotificationsClient />
        </div>
      </div>
    </main>
  );
}
