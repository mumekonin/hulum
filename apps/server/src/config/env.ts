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
  GROQ_API_KEY: string | undefined;
  GROQ_MODEL: string | undefined;
  VOXIDE_API_KEY: string | undefined;
};

function optionalString(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }
  return value;
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
    throw new Error("CLIENT_URL must be an absolute http or https origin");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("CLIENT_URL must be an absolute http or https origin");
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

export function loadEnv(): AppEnv {
  loadDotenv();

  return {
    NODE_ENV: parseNodeEnv(process.env.NODE_ENV),
    PORT: parsePort(process.env.PORT),
    CLIENT_URL: parseClientUrl(process.env.CLIENT_URL),
    DATABASE_URL: optionalString(process.env.DATABASE_URL),
    SUPABASE_URL: optionalString(process.env.SUPABASE_URL),
    SUPABASE_ANON_KEY: optionalString(process.env.SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: optionalString(process.env.SUPABASE_SERVICE_ROLE_KEY),
    CLAUDE_API_KEY: optionalString(process.env.CLAUDE_API_KEY),
    GROQ_API_KEY: optionalString(process.env.GROQ_API_KEY),
    GROQ_MODEL: optionalString(process.env.GROQ_MODEL),
    VOXIDE_API_KEY: optionalString(process.env.VOXIDE_API_KEY),
  };
}
