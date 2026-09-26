import { Header } from "@/components/Header";
import { RequireAuth } from "@/components/RequireAuth";
import { SiteVoice } from "@/components/SiteVoice";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site min-h-screen bg-paper text-ink">
      <Header />
      <main id="main-content" tabIndex={-1} className="mx-auto min-h-[80vh] max-w-6xl px-4 py-10">
        <RequireAuth>
          {children}
          <SiteVoice />
        </RequireAuth>
      </main>
      <footer className="border-t border-line px-4 py-6 text-center text-sm text-muted">
        HULUM is a decision aid, not an official eligibility authority.
      </footer>
    </div>
  );
}
