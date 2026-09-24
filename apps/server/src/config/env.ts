import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";

/** Always `apps/server/.env`, even when npm is started from the repo root. */
const SERVER_ENV_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env");

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
  GROQ_API_KEY: string | undefined;
  GROQ_MODEL: string | undefined;
  VOXIDE_API_KEY: string | undefined;
  JOB_OPPORTUNITIES_API_KEY: string | undefined;
  JOB_OPPORTUNITIES_API_URL: string | undefined;
  INVESTIGATE_ADMIN_SECRET: string | undefined;
  SCHOLARXIV_API_KEY: string | undefined;
  /** HMAC secret for X-Hulum-Session. Required in production; optional in local demo. */
  SESSION_SECRET: string | undefined;
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
  const raw = value ?? "3001";
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return port;
}

/** Origin only, no path or credentials. Used for API CORS. */
export function parseClientUrl(value: string | undefined): string | undefined {
  const raw = optionalString(value);
  if (raw === undefined) {
    return undefined;
  }
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("CLIENT_URL must be an http(s) origin");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("CLIENT_URL must be an http(s) origin");
  }
  if (parsed.username !== "" || parsed.password !== "") {
    throw new Error("CLIENT_URL must not include credentials");
  }
  if (parsed.search !== "" || parsed.hash !== "") {
    throw new Error("CLIENT_URL must be an origin only (no path, query, or hash)");
  }
  if (parsed.pathname !== "/" && parsed.pathname !== "") {
    throw new Error("CLIENT_URL must be an origin only (no path, query, or hash)");
  }
  return parsed.origin;
}

export function loadEnv(options: LoadEnvOptions = {}): AppEnv {
  if (options.fromFile !== false) {
    // Do not override existing process.env (CI sets DATABASE_URL on the job).
    // Local apps/server/.env still fills vars that are unset.
    loadDotenv({ path: SERVER_ENV_PATH });
  }

  const NODE_ENV = parseNodeEnv(process.env.NODE_ENV);
  if (NODE_ENV === "production" && optionalString(process.env.CLIENT_URL) === undefined) {
    throw new Error("CLIENT_URL is required in production");
  }
  if (NODE_ENV === "production" && optionalString(process.env.SESSION_SECRET) === undefined) {
    throw new Error("SESSION_SECRET is required in production");
  }

  return {
    NODE_ENV,
    PORT: parsePort(process.env.PORT),
    CLIENT_URL: parseClientUrl(process.env.CLIENT_URL),
    DATABASE_URL: optionalString(process.env.DATABASE_URL),
    SUPABASE_URL: optionalString(process.env.SUPABASE_URL),
    SUPABASE_ANON_KEY: optionalString(process.env.SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: optionalString(process.env.SUPABASE_SERVICE_ROLE_KEY),
    CLAUDE_API_KEY: optionalString(process.env.CLAUDE_API_KEY) ?? optionalString(process.env.ANTHROPIC_API_KEY),
    CLAUDE_MODEL: optionalString(process.env.CLAUDE_MODEL) ?? optionalString(process.env.ANTHROPIC_MODEL),
    GROQ_API_KEY: optionalString(process.env.GROQ_API_KEY),
    GROQ_MODEL: optionalString(process.env.GROQ_MODEL),
    VOXIDE_API_KEY: optionalString(process.env.VOXIDE_API_KEY),
    JOB_OPPORTUNITIES_API_KEY: optionalString(process.env.JOB_OPPORTUNITIES_API_KEY),
    JOB_OPPORTUNITIES_API_URL: optionalString(process.env.JOB_OPPORTUNITIES_API_URL),
    INVESTIGATE_ADMIN_SECRET: optionalString(process.env.INVESTIGATE_ADMIN_SECRET),
    SCHOLARXIV_API_KEY: optionalString(process.env.SCHOLARXIV_API_KEY),
    SESSION_SECRET: optionalString(process.env.SESSION_SECRET),
  };
}
