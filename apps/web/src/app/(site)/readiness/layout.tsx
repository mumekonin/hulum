import type { Metadata } from "next";

export const metadata: Metadata = { title: "Readiness" };

export default function ReadinessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
