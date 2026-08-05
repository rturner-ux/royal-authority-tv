import Image from "next/image";

// Shared precedence for every place a person's avatar shows: their own
// uploaded photo first, then their investigator role badge, then a plain
// initial -- so uploading a photo doesn't require touching every call site.
export default function Avatar({
  avatarUrl,
  roleBadge,
  name,
  size = 40,
  className = "",
}: {
  avatarUrl?: string | null;
  roleBadge?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden rounded-full bg-white/5 ${className}`}
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt={name} fill unoptimized className="object-cover" />
      ) : roleBadge ? (
        <Image src={roleBadge} alt="" fill unoptimized className="object-contain p-1" />
      ) : (
        <div className="grid h-full w-full place-items-center font-bold text-white/50" style={{ fontSize: size * 0.4 }}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
