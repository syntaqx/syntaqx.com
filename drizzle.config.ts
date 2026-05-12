import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Migrations use the unpooled connection (direct, no pgbouncer) because
// drizzle-kit's introspect/push opens transactions that pgbouncer in
// transaction mode breaks.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL must be set");
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
