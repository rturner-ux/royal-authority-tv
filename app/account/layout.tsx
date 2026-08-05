import ProfileSidebar from "../components/ProfileSidebar";
import MobileTabBar from "../components/MobileTabBar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <ProfileSidebar />
      <div className="min-w-0 flex-1">{children}</div>
      <MobileTabBar />
    </div>
  );
}
