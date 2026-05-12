/**
 * Production migration runner.
 *
 *   npm run db:migrate
 *
 * Reads SQL files from lib/db/migrations/ and applies any whose
 * folderMillis is newer than the last row in `drizzle.__drizzle_migrations`.
 * Uses the unpooled connection because migrations run multi-statement
 * transactions that pgbouncer (transaction mode) breaks.
 *
 * The first time this is ever run against an empty DB, it will apply
 * the baseline 0000 migration. If the DB already has the tables (from
 * a prior `db:push` during early prototyping), run `db:baseline` first
 * to mark the baseline as applied without re-running it.
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL must be set");
}

const sql = neon(url);
const db = drizzle({ client: sql });

async function main() {
  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  console.log("migrations applied");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
