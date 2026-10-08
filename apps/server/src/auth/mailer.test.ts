import { describe, expect, it } from "vitest";
import { loadMailConfig } from "./mailer.js";

describe("loadMailConfig", () => {
  it("reads SMTP_PASSWORD when SMTP_PASS is unset", () => {
    const config = loadMailConfig({
      SMTP_HOST: "smtp.gmail.com",
      SMTP_PORT: "587",
      SMTP_USER: "person@example.com",
      SMTP_PASSWORD: "app-password",
      MAIL_FROM: "person@example.com",
    });
    expect(config?.pass).toBe("app-password");
  });

  it("removes the spaces Gmail inserts in an app password", () => {
    const config = loadMailConfig({
      SMTP_HOST: "smtp.gmail.com",
      MAIL_FROM: "person@example.com",
      SMTP_PASSWORD: "abcd efgh ijkl mnop",
    });
    expect(config?.pass).toBe("abcdefghijklmnop");
    expect(config?.port).toBe(587);
    expect(config?.secure).toBe(false);
  });
});
