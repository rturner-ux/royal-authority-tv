import ConversationList from "./ConversationList";

// Persistent conversation list beside whatever's selected (nothing, or a
// thread) -- matches a standard inbox layout: list always visible, content
// pane changes. Desktop only; each page's own content handles mobile.
export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative h-[calc(100vh-56px)] overflow-hidden bg-[#05070b] text-white lg:h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 flex h-full">
        <aside className="hidden h-full w-80 flex-shrink-0 border-r border-white/10 lg:block">
          <ConversationList />
        </aside>
        <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </main>
  );
}
