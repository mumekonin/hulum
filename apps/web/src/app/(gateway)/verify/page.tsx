import type { Metadata } from "next";
import { AuthInduction } from "@/components/AuthInduction";

export const metadata: Metadata = {
  title: "Create account",
  description: "Register with email and password. No email verification code (OTP).",
};

export default function VerifyPage() {
  return <AuthInduction />;
}
