import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ask HULUM" };

export default function AssistantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
