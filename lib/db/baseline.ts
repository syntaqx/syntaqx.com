/**
 * One-shot baseline bootstrap.
 *
 *   npm run db:baseline
 *
 * Use case: the database already contains the tables described by the
 * earliest migrations (because `drizzle-kit push` was used during
 * prototyping). This script:
 *
 *   1. Ensures `drizzle.__drizzle_migrations` exists.
 *   2. Reads `lib/db/migrations/meta/_journal.json`.
 *   3. For every entry in the journal, inserts a marker row with the
 *      migration's hash + folderMillis IF a row with that hash isn't
 *      already there.
 *
 * After this runs once, normal `db:migrate` only applies migrations
 * created AFTER the baseline. Idempotent: safe to re-run.
 *
 * Going forward the workflow is:
 *
 *   - Edit lib/db/schema.ts
 *   - `npm run db:generate`     -> writes a new SQL file under migrations/
 *   - `npm run db:migrate`      -> applies it (locally + in CI/prod)
 *
 * `npm run db:push` stays available for fast local iteration, but the
 * source of truth in CI/prod is the SQL files committed to git.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

type JournalEntry = {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints: boolean;
};

type Journal = {
  version: string;
  dialect: string;
  entries: JournalEntry[];
};

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL must be set");
}

const migrationsDir = "./lib/db/migrations";
const journal: Journal = JSON.parse(
  readFileSync(join(migrationsDir, "meta", "_journal.json"), "utf-8"),
);

// Drizzle hashes the SQL contents using SHA-256 to identify migrations.
function hashFor(tag: string): string {
  const sql = readFileSync(join(migrationsDir, `${tag}.sql`), "utf-8");
  return createHash("sha256").update(sql).digest("hex");
}

const sql = neon(url);

async function main() {
  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await sql`CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash text NOT NULL,
    created_at bigint
  )`;

  let inserted = 0;
  let skipped = 0;
  for (const entry of journal.entries) {
    const hash = hashFor(entry.tag);
    const existing =
      await sql`SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = ${hash} LIMIT 1`;
    if (existing.length > 0) {
      skipped++;
      continue;
    }
    await sql`INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES (${hash}, ${entry.when})`;
    inserted++;
    console.log(`marked baseline: ${entry.tag}`);
  }

  console.log(
    `baseline complete: ${inserted} inserted, ${skipped} already present`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
