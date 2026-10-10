import { defineConfig } from "vitest/config";
import path from "path";

// Vitest configuration for unit tests in /tests
// Reuses the same "@" -> ./src alias as vite.config.ts / tsconfig.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    // Some suites (e.g. database-mysql) expect a live MySQL server and
    // legacy globals; run everything by default but keep test files isolated.
    pool: "forks",
  },
});
