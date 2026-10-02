import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analyze a screenshot" };

export default function ScreenshotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
