"use client";

import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import Avatar from "../components/Avatar";

const MAX_BYTES = 5 * 1024 * 1024;

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path d="M4 8a2 2 0 0 1 2-2h1.2l1-1.6A2 2 0 0 1 9.9 3.4h4.2a2 2 0 0 1 1.7 1L16.8 6H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export default function AvatarUpload({
  userId,
  initialAvatarUrl,
  roleBadge,
  name,
  size = 96,
}: {
  userId: string;
  initialAvatarUrl: string | null;
  roleBadge: string | null;
  name: string;
  size?: number;
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 5MB.");
      return;
    }

    setUploading(true);
    setError(null);

    const db = supabaseBrowser();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await db.storage.from("subscriber-avatars").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (uploadError) {
      console.error("Avatar upload failed:", uploadError);
      setError("Couldn't upload that image. Please try again.");
      setUploading(false);
      return;
    }

    const { data: pub } = db.storage.from("subscriber-avatars").getPublicUrl(path);
    const { error: profileError } = await db
      .from("subscriber_profiles")
      .update({ avatar_url: pub.publicUrl })
      .eq("user_id", userId);

    setUploading(false);

    if (profileError) {
      console.error("Failed to save avatar_url:", profileError);
      setError("Uploaded, but couldn't save it to your profile. Please try again.");
      return;
    }

    setAvatarUrl(pub.publicUrl);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative block rounded-full disabled:opacity-60"
        aria-label="Change profile picture"
      >
        <Avatar avatarUrl={avatarUrl} roleBadge={roleBadge} name={name} size={size} className="border-4 border-[#05070b]" />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition group-hover:bg-black/50 group-hover:opacity-100">
          <CameraIcon />
        </div>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-[0.6rem] font-semibold text-white">
            Uploading...
          </div>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {error && <p className="mt-2 max-w-[160px] text-xs text-red-300">{error}</p>}
    </div>
  );
}
