#!/usr/bin/env node
/**
 * End-to-end password reset against the local stack, with a throwaway SMTP inbox on 127.0.0.1.
 * Proves: Forgot password? → request → email → /reset-password → new password → sign in with it.
 * Does not prove delivery through a real provider (that needs your SMTP_* values).
 *
 *   SMTP_HOST=127.0.0.1 SMTP_PORT=2525 MAIL_FROM="HULUM <no-reply@hulum.local>" npm run dev
 *   npm run smoke:password-reset
 */

import net from "node:net";
import { chromium } from "playwright";

const WEB = process.env.WEB_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const SINK_PORT = Number(process.env.SMTP_SINK_PORT ?? "2525");
const timeout = 60_000;

/** Minimal SMTP receiver: no TLS, no auth, keeps every message in memory. */
function startSmtpSink(port) {
  const messages = [];
  const server = net.createServer((socket) => {
    let buffer = "";
    let inData = false;
    let current = { to: [], data: "" };
    socket.write("220 hulum-smoke ESMTP\r\n");
    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      for (;;) {
        if (inData) {
          const end = buffer.indexOf("\r\n.\r\n");
          if (end === -1) return;
          current.data = buffer.slice(0, end);
          buffer = buffer.slice(end + 5);
          inData = false;
          messages.push(current);
          current = { to: [], data: "" };
          socket.write("250 OK queued\r\n");
          continue;
        }
        const lineEnd = buffer.indexOf("\r\n");
        if (lineEnd === -1) return;
        const line = buffer.slice(0, lineEnd);
        buffer = buffer.slice(lineEnd + 2);
        const verb = line.slice(0, 4).toUpperCase();
        if (verb === "EHLO" || verb === "HELO") socket.write("250 hulum-smoke\r\n");
        else if (verb === "MAIL") socket.write("250 OK\r\n");
        else if (verb === "RCPT") {
          current.to.push(line.replace(/^RCPT TO:\s*/i, "").replace(/[<>]/g, ""));
          socket.write("250 OK\r\n");
        } else if (verb === "DATA") {
          inData = true;
          socket.write("354 End data with <CR><LF>.<CR><LF>\r\n");
        } else if (verb === "QUIT") {
          socket.end("221 Bye\r\n");
          return;
        } else socket.write("250 OK\r\n");
      }
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve({ messages, close: () => server.close() }));
  });
}

function decodeQuotedPrintable(text) {
  return text.replace(/=\r?\n/g, "").replace(/=([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

async function waitFor(check, label, ms = 20_000) {
  const started = Date.now();
  while (Date.now() - started < ms) {
    const value = check();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function postJson(path, body) {
  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const sink = await startSmtpSink(SINK_PORT);
  const email = `reset.smoke.${String(Date.now())}@example.invalid`;
  const oldPassword = "old-password-1";
  const newPassword = "new-password-2";
  console.log(`smoke:password-reset → ${WEB} / ${API} (sink 127.0.0.1:${String(SINK_PORT)}, ${email})`);

  const registered = await postJson("/api/auth/register", { name: "Reset Smoke", email, password: oldPassword });
  assert(registered.status === 201, `register failed: ${JSON.stringify(registered.body)}`);

  const browser = await chromium
    .launch({ headless: true, channel: "msedge" })
    .catch(() => chromium.launch({ headless: true, channel: "chrome" }))
    .catch(() => chromium.launch({ headless: true }));
  const page = await browser.newPage();
  page.setDefaultTimeout(timeout);

  try {
    // 1–3: sign-in → Forgot password? → reset request page
    await page.goto(`${WEB}/sign-in`, { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "Forgot password?" }).click();
    await page.waitForURL(/\/forgot-password$/);
    await page.getByText("Enter the email address associated with your HULUM account.").waitFor();
    console.log("ok: Forgot password? opens /forgot-password");

    await page.getByRole("button", { name: "Send reset link" }).click();
    await page.getByText("Please enter a valid email address.").waitFor();

    // Unknown address: same success UI, and no email.
    await page.locator("#recovery-email").fill("nobody.here@example.invalid");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await page.getByRole("button", { name: "Reset link sent" }).waitFor();
    await page.getByText(/If an account exists for this email/).waitFor();
    await page.getByRole("button", { name: "Use a different email" }).click();
    console.log("ok: unknown email shows the same confirmation");

    // 4–7: real request
    const requestPromise = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/api/auth/password-reset/request",
    );
    await page.locator("#recovery-email").fill(email);
    await page.getByRole("button", { name: "Send reset link" }).click();
    const requestResponse = await requestPromise;
    assert(requestResponse.status() === 202, `reset request status ${String(requestResponse.status())}`);
    await page.getByRole("button", { name: "Reset link sent" }).waitFor();
    console.log("ok: reset request accepted (202) and confirmation shown");

    // 8: the email
    const message = await waitFor(() => sink.messages.find((m) => m.to.includes(email)), "reset email");
    assert(
      !sink.messages.some((m) => m.to.includes("nobody.here@example.invalid")),
      "unknown email must not receive mail",
    );
    const body = decodeQuotedPrintable(message.data);
    assert(/Subject: Reset your HULUM password/.test(body), "unexpected subject");
    const linkMatch = /(https?:\/\/[^\s"<]+\/reset-password#token=[A-Za-z0-9_-]{43})/.exec(body);
    assert(linkMatch, "reset link not found in email");
    const link = linkMatch[1];
    assert(link.startsWith(`${WEB}/reset-password#token=`), `link does not use the web origin: ${link.split("#")[0]}`);
    console.log(`ok: email delivered to sink with link ${link.split("#")[0]}#token=…`);

    // 9–10: open the link
    await page.goto(link, { waitUntil: "domcontentloaded" });
    await page.getByText("Choose a new password for your HULUM account.").waitFor();
    await page.locator("#reset-password").waitFor();
    assert(!page.url().includes("token="), "token should be removed from the address bar");
    console.log("ok: link opens /reset-password with a verified recovery token");

    // Validation
    await page.locator("#reset-password").fill("short");
    await page.locator("#reset-password-confirm").fill("short");
    await page.getByRole("button", { name: "Update password" }).click();
    await page.getByText("Password must be at least 8 characters.").waitFor();
    await page.locator("#reset-password").fill(newPassword);
    await page.locator("#reset-password-confirm").fill("different-pass");
    await page.getByRole("button", { name: "Update password" }).click();
    await page.getByText("Passwords do not match.").waitFor();
    console.log("ok: length and mismatch validation");

    // 11–14: update
    await page.locator("#reset-password-confirm").fill(newPassword);
    await page.getByRole("button", { name: "Update password" }).click();
    await page.getByText(/Password updated successfully/).waitFor();
    await page.getByRole("button", { name: "Password updated" }).waitFor();
    console.log("ok: password updated");

    // 15–16: back to sign in with the new password
    await page.getByRole("link", { name: "Back to sign in" }).click();
    await page.waitForURL(/\/sign-in$/);
    await page.locator("#gateway-email").fill(email);
    await page.locator("#gateway-password").fill(newPassword);
    const loginPromise = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/auth/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    const loginResponse = await loginPromise;
    assert(loginResponse.status() === 200, `sign in with new password failed: ${String(loginResponse.status())}`);
    await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"));
    console.log(`ok: signed in with the new password → ${new URL(page.url()).pathname}`);

    const oldLogin = await postJson("/api/auth/login", { email, password: oldPassword });
    assert(oldLogin.status === 401, "old password must stop working");
    console.log("ok: old password rejected (401)");

    // Reused link
    const reuse = await browser.newPage();
    await reuse.goto(link, { waitUntil: "domcontentloaded" });
    await reuse.getByText("Your reset link is invalid or has expired.").waitFor({ timeout });
    await reuse.close();
    console.log("ok: used link is rejected");

    console.log("ok: forgot password → email → recovery token → new password → sign in");
  } finally {
    await browser.close();
    sink.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
