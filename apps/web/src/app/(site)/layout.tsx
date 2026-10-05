import { AppNav } from "@/components/AppNav";
import { RequireAuth } from "@/components/RequireAuth";
import { RequireProfile } from "@/components/RequireProfile";
import { SiteVoice } from "@/components/SiteVoice";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site min-h-screen bg-paper text-ink">
      <AppNav />
      <div className="lg:pl-60">
        <main id="main-content" tabIndex={-1} className="mx-auto min-h-[80vh] max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
          <RequireAuth>
            <RequireProfile>
              {children}
              <SiteVoice />
            </RequireProfile>
          </RequireAuth>
        </main>
        <footer className="border-t border-line px-5 py-6 text-sm text-muted sm:px-8">
          <p className="mx-auto max-w-5xl">HULUM is a decision aid, not an official eligibility authority.</p>
        </footer>
      </div>
    </div>
  );
}
