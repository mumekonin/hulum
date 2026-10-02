import type { Metadata } from "next";
import { AuthInduction } from "@/components/AuthInduction";

export const metadata: Metadata = { title: "Create account" };

export default function VerifyPage() {
  return <AuthInduction />;
}
