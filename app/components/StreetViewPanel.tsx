// Fills its parent -- meant to be layered directly over the map once
// fully zoomed in, not shown as its own card. Renders nothing if the key
// isn't configured; Google's own iframe degrades gracefully (shows "no
// imagery here") when a location has no Street View coverage.
export default function StreetViewPanel({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const src = `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${lat},${lng}&heading=0&pitch=0&fov=90`;

  return (
    <iframe
      src={src}
      className="h-full w-full"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
