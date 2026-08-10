import { redirect } from "next/navigation";
import Navbar from "../../../components/Navbar";
import PhotosClient from "./PhotosClient";
import { supabaseServerAuth } from "@/lib/supabase/serverAuth";

export default async function AdminPhotosPage() {
  const db = await supabaseServerAuth();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/login?next=/account/admin/photos");

  const { data: profile } = await db.from("subscriber_profiles").select("is_admin").eq("user_id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/account");

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-6">
        <div className="lg:hidden">
          <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Profile", href: "/account" }, { label: "Photo Manager" }]} />
        </div>

        <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Admin</div>
        <h1 className="mt-2 font-serif text-3xl font-bold text-white">Photo Manager</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Search for a case and upload or replace its photos -- the case image, poster art, scene photo, and each person&apos;s photo.
        </p>

        <div className="mt-8">
          <PhotosClient />
        </div>
      </div>
    </main>
  );
}
