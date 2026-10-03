export function BrandMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 text-current ${className}`}
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M6 15.5 12 7l6 8.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="15.5" r="1.75" className="fill-wl-accent" />
    </svg>
  );
}
