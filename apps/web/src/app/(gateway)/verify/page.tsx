import type { Metadata } from "next";
import { AuthInduction } from "@/components/AuthInduction";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a HULUM account with your name, email, and a password.",
};

export default function VerifyPage() {
  return <AuthInduction />;
}
