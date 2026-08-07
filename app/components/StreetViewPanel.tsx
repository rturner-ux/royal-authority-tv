// Renders nothing if the key isn't configured, and Google's own iframe
// degrades gracefully (shows "no imagery here") when a location has no
// Street View coverage -- no extra handling needed for that case.
export default function StreetViewPanel({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label?: string | null;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const src = `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${lat},${lng}&heading=0&pitch=0&fov=90`;

  return (
    <div className="mt-4 rounded-2xl border border-[#C9A24A]/30 bg-[#0a0d14] p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D19A]">
        Street View
      </div>
      {label && <div className="mt-1 text-sm text-slate-400">{label}</div>}
      <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-white/10">
        <iframe
          src={src}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
