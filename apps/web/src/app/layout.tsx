import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "HULUM — AI opportunity decision agent",
  description: "Decide whether to APPLY, MAYBE, or SKIP — then see why and what to do next.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} antialiased`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" tabIndex={-1} className="mx-auto min-h-[80vh] max-w-6xl px-4 py-10">
          {children}
        </main>
        <footer className="border-t border-line px-4 py-6 text-center text-sm text-muted">
          HULUM is a decision aid, not an official eligibility authority.
        </footer>
      </body>
    </html>
  );
}
