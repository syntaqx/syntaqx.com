import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    // Pin the rate-limit ceiling so tests assert against a known boundary
    // regardless of NODE_ENV (which is "test" under vitest).
    env: {
      API_RATE_LIMIT_MAX: "5000",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
