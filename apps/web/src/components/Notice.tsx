export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-line bg-white/80 px-4 py-3 text-sm leading-6 text-muted">
      {children}
    </p>
  );
}
