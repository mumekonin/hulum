import type { Metadata } from "next";

export const metadata: Metadata = { title: "My opportunities" };

export default function MyOpportunitiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
