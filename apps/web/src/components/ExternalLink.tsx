export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  if (!href) {
    return null;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
