import type { Metadata } from "next";
import { AuthResetPassword } from "@/components/AuthResetPassword";

export const metadata: Metadata = { title: "Set new password" };

export default function ResetPasswordPage() {
  return <AuthResetPassword />;
}
