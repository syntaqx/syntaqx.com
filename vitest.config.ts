import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", ".claude/**"],
    // Pin the rate-limit ceiling so tests assert against a known boundary
    // regardless of NODE_ENV (which is "test" under vitest).
    env: {
      API_RATE_LIMIT_MAX: "5000",
      // Count in memory so limiter tests are deterministic and never touch
      // a real Redis, whatever the developer's .env.local holds.
      RATE_LIMIT_STORE: "memory",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
