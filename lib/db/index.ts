import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

/**
 * Runtime database client.
 *
 * Uses the WebSocket-based `Pool` rather than the `neon-http` adapter
 * so multiple queries in one request share a single TCP/TLS
 * connection. Better Auth's `getSession` issues a session lookup
 * followed by a user lookup; with the HTTP adapter that's two
 * sequential HTTPS round trips per render. With the pool both reuse
 * the same warm connection.
 *
 * The Pool is created once at module scope. On Vercel (fluid compute)
 * modules are cached across warm invocations of the same function
 * instance, so the WebSocket handshake amortises across many
 * requests. In dev we stash it on `globalThis` so HMR doesn't leak
 * sockets.
 *
 * `DATABASE_URL` must point at the pooled (`-pooler`) Neon endpoint.
 * The unpooled URL is reserved for the migration runner — see
 * lib/db/migrate.ts.
 */

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// `@neondatabase/serverless` ships its own WebSocket for edge
// runtimes; in Node we have to provide one. Node 24 has a global
// `WebSocket`, but `ws` is the documented path and behaves the same
// across Node versions.
neonConfig.webSocketConstructor = ws;

// Route single-statement `pool.query()` calls through fetch instead of
// the WebSocket. The WS pool sits idle between requests on Vercel
// fluid compute and Neon closes idle sockets, so the next query trips
// "Connection terminated unexpectedly" on a stale connection. Fetch
// has no socket to go stale. Transactions (`pool.connect()` →
// `client.query()`) still use the WebSocket, which is what we want for
// Better Auth's session+user lookup pair.
neonConfig.poolQueryViaFetch = true;

const globalForPool = globalThis as unknown as { __neonPool?: Pool };

const pool =
  globalForPool.__neonPool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

// Without this, a backend-initiated socket close between requests
// becomes an unhandled 'error' event and crashes the function. We
// already retry at the query layer (fetch path) and on next checkout
// (ws path), so swallowing the event is correct.
pool.on("error", (err: Error) => {
  console.warn("[db] idle pool client error:", err.message);
});

if (process.env.NODE_ENV !== "production") {
  globalForPool.__neonPool = pool;
}

export const db = drizzle({ client: pool, schema });
