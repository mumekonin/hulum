import { AsyncLocalStorage } from "node:async_hooks";
import type { PoolClient, QueryResult, QueryResultRow } from "pg";
import { getPool } from "./pool.js";

type RlsContext = {
  client: PoolClient;
};

const als = new AsyncLocalStorage<RlsContext>();

export function rlsClient(): PoolClient | undefined {
  return als.getStore()?.client;
}

async function withRlsContext<T>(setup: (client: PoolClient) => Promise<void>, fn: () => Promise<T>): Promise<T> {
  const existing = als.getStore();
  if (existing !== undefined) {
    return fn();
  }

  const client = await getPool().connect();
  try {
    await client.query("begin");
    try {
      await setup(client);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
    try {
      const result = await als.run({ client }, fn);
      await client.query("commit");
      return result;
    } catch (error) {
      try {
        await client.query("rollback");
      } catch {
        /* connection may already be aborted */
      }
      throw error;
    }
  } finally {
    client.release();
  }
}

/** User-scoped path: non-owner role + app.current_user_id. */
export function withUserRls<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  return withRlsContext(async (client) => {
    await client.query("set local role hulum_app");
    await client.query("select set_config('app.current_user_id', $1, true)", [userId]);
  }, fn);
}

/** Auth / investigator: non-owner role + app.rls_bypass. */
export function withServiceRls<T>(fn: () => Promise<T>): Promise<T> {
  return withRlsContext(async (client) => {
    await client.query("set local role hulum_app");
    await client.query("select set_config('app.rls_bypass', 'on', true)");
  }, fn);
}

/** Public catalog reads: non-owner role, no user id (opportunities SELECT policy is open). */
export function withAppRole<T>(fn: () => Promise<T>): Promise<T> {
  return withRlsContext(async (client) => {
    await client.query("set local role hulum_app");
  }, fn);
}

export async function dbQuery<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<R>> {
  const client = rlsClient();
  if (client !== undefined) {
    return client.query<R>(text, params);
  }
  return getPool().query<R>(text, params);
}

/**
 * Inside an RLS context, reuse the request client (no nested BEGIN).
 * Outside, callers own BEGIN/COMMIT/RELEASE as before.
 */
export async function dbConnect(): Promise<{
  client: PoolClient;
  release: () => void;
  ownsTransaction: boolean;
}> {
  const existing = rlsClient();
  if (existing !== undefined) {
    return {
      client: existing,
      release: () => {
        /* request middleware owns the client */
      },
      ownsTransaction: false,
    };
  }
  const client = await getPool().connect();
  return {
    client,
    release: () => {
      client.release();
    },
    ownsTransaction: true,
  };
}
