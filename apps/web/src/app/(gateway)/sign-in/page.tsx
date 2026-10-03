import type { Metadata } from "next";
import { AuthGateway } from "@/components/AuthGateway";

export const metadata: Metadata = { title: "Sign in" };

export default function GatewayPage() {
  return <AuthGateway />;
}
