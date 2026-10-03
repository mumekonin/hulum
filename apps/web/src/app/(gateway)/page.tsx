import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WelcomePage } from "@/components/WelcomePage";

export const metadata: Metadata = { title: { absolute: "HULUM — Know what is worth your time" } };

export default async function WelcomeRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // The API's Google OAuth routes redirect failures to `/?auth_error=…`.
  const { auth_error: authError } = await searchParams;
  if (typeof authError === "string") {
    redirect(`/sign-in?auth_error=${encodeURIComponent(authError)}`);
  }
  return <WelcomePage />;
}
