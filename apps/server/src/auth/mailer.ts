import nodemailer from "nodemailer";

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type Mailer = {
  send(message: MailMessage): Promise<void>;
};

export type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string | undefined;
  pass: string | undefined;
  from: string;
};

function optional(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  return value.trim();
}

/**
 * SMTP settings for password-reset email. Returns undefined until SMTP_HOST and MAIL_FROM are set,
 * so the API can say "not configured" instead of pretending an email was sent.
 */
export function loadMailConfig(env: NodeJS.ProcessEnv = process.env): MailConfig | undefined {
  const host = optional(env.SMTP_HOST);
  const from = optional(env.MAIL_FROM);
  if (host === undefined || from === undefined) return undefined;
  const secure = optional(env.SMTP_SECURE) === "true";
  const port = Number(optional(env.SMTP_PORT) ?? (secure ? "465" : "587"));
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be an integer between 1 and 65535");
  }
  return {
    host,
    port,
    secure,
    user: optional(env.SMTP_USER),
    pass: optional(env.SMTP_PASS),
    from,
  };
}

export function createSmtpMailer(config: MailConfig): Mailer {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth:
      config.user !== undefined && config.pass !== undefined
        ? { user: config.user, pass: config.pass }
        : undefined,
  });
  return {
    async send(message): Promise<void> {
      await transport.sendMail({ from: config.from, ...message });
    },
  };
}
