import { BrandMark } from "@/components/BrandMark";
import { RequireAuth } from "@/components/RequireAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-8">
        <span className="flex items-center gap-2.5">
          <BrandMark />
          <span className="font-display text-[21px] font-semibold tracking-[0.08em]">HULUM</span>
        </span>
        <ThemeToggle />
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-xl px-5 py-10 sm:py-14">
        <RequireAuth>{children}</RequireAuth>
      </main>
    </div>
  );
}
