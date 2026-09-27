export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-l-2 border-line-strong bg-surface-muted px-4 py-3 text-sm leading-6 text-muted">
      {children}
    </p>
  );
}
