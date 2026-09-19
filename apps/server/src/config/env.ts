import { config as loadDotenv } from "dotenv";

export type AppEnv = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  CLIENT_URL: string | undefined;
  DATABASE_URL: string | undefined;
  SUPABASE_URL: string | undefined;
  SUPABASE_ANON_KEY: string | undefined;
  SUPABASE_SERVICE_ROLE_KEY: string | undefined;
  CLAUDE_API_KEY: string | undefined;
  CLAUDE_MODEL: string | undefined;
  VOXIDE_API_KEY: string | undefined;
};

export type LoadEnvOptions = {
  fromFile?: boolean;
};

function optionalString(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }
  return value.trim();
}

function parseNodeEnv(value: string | undefined): AppEnv["NODE_ENV"] {
  if (value === undefined || value === "" || value === "development") {
    return "development";
  }
  if (value === "test" || value === "production") {
    return value;
  }
  throw new Error("NODE_ENV must be development, test, or production");
}

function parsePort(value: string | undefined): number {
  const raw = value ?? "4000";
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return port;
}

function parseClientUrl(nodeEnv: AppEnv["NODE_ENV"], value: string | undefined): string | undefined {
  const url = optionalString(value);
  if (nodeEnv !== "production") {
    return url;
  }
  if (!url) {
    throw new Error("CLIENT_URL is required in production");
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("CLIENT_URL must be an http(s) origin");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("CLIENT_URL must be an http(s) origin");
  }
  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("CLIENT_URL must be an origin only (no path or query)");
  }
  return `${parsed.protocol}//${parsed.host}`;
}

export function loadEnv(options: LoadEnvOptions = {}): AppEnv {
  if (options.fromFile !== false) {
    loadDotenv();
  }

  const NODE_ENV = parseNodeEnv(process.env.NODE_ENV);

  return {
    NODE_ENV,
    PORT: parsePort(process.env.PORT),
    CLIENT_URL: parseClientUrl(NODE_ENV, process.env.CLIENT_URL),
    DATABASE_URL: optionalString(process.env.DATABASE_URL),
    SUPABASE_URL: optionalString(process.env.SUPABASE_URL),
    SUPABASE_ANON_KEY: optionalString(process.env.SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: optionalString(process.env.SUPABASE_SERVICE_ROLE_KEY),
    CLAUDE_API_KEY: optionalString(process.env.CLAUDE_API_KEY) ?? optionalString(process.env.ANTHROPIC_API_KEY),
    CLAUDE_MODEL: optionalString(process.env.CLAUDE_MODEL) ?? optionalString(process.env.ANTHROPIC_MODEL),
    VOXIDE_API_KEY: optionalString(process.env.VOXIDE_API_KEY),
  };
}
