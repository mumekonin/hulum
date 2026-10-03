import type { Metadata } from "next";
import { EB_Garamond, JetBrains_Mono, Source_Sans_3 } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

const gatewaySerif = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-gateway-serif",
});

const gatewayMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-gateway-mono",
});

export const metadata: Metadata = {
  title: { default: "HULUM — AI opportunity decision agent", template: "%s · HULUM" },
  description: "Decide whether to APPLY, MAYBE, or SKIP — then see why and what to do next.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${sans.variable} ${gatewaySerif.variable} ${gatewayMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
