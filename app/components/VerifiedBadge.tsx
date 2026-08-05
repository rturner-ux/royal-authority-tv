export default function VerifiedBadge({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`flex-shrink-0 ${className}`} aria-label="Verified">
      <path
        d="M12 2l2.4 1.2 2.6-.6 1.4 2.3 2.3 1.4-.6 2.6L21.3 11l-1.2 2.4.6 2.6-2.3 1.4-1.4 2.3-2.6-.6L12 21l-2.4-1.2-2.6.6-1.4-2.3-2.3-1.4.6-2.6L2.7 11l1.2-2.4-.6-2.6 2.3-1.4 1.4-2.3 2.6.6L12 2Z"
        fill="#3B82F6"
      />
      <path d="M8.5 12.2l2.3 2.3 4.5-4.7" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
