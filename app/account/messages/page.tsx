import { redirect } from "next/navigation";
import Navbar from "../../components/Navbar";
import ConversationList from "./ConversationList";
import { getSubscriberStatus } from "@/lib/subscription";

export default async function MessagesPage() {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/messages");
  if (!isActive) redirect("/account");

  return (
    <>
      {/* Mobile: no persistent sidebar (that's lg+ only, via the layout), so
          the list itself is the page content here. */}
      <div className="h-full lg:hidden">
        <div className="px-6 pt-6">
          <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Profile", href: "/account" }, { label: "Messages" }]} />
        </div>
        <ConversationList />
      </div>

      {/* Desktop: the sidebar (in layout.tsx) already shows the list, so this
          pane is just an empty "nothing selected" placeholder. */}
      <div className="hidden h-full items-center justify-center lg:flex">
        <p className="text-sm text-slate-500">Select a conversation to start messaging.</p>
      </div>
    </>
  );
}
