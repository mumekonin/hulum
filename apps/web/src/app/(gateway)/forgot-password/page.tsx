import type { Metadata } from "next";
import { AuthRecovery } from "@/components/AuthRecovery";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return <AuthRecovery />;
}
