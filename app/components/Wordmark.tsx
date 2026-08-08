// Plain-text site wordmark, replacing the old graphical logo image.
// Shared across Navbar, ProfileSidebar, and JoinLanding so the three
// differently-sized usages stay visually consistent.
export default function Wordmark({ className = "text-xl" }: { className?: string }) {
  return (
    <span className={`inline-block font-serif leading-tight text-white ${className}`}>
      Royal Authority TV
      <span className="mt-1 block h-[2px] bg-red-600" />
    </span>
  );
}
