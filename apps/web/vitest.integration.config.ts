import { defineConfig } from "vitest/config";
import path from "path";

// Integration tests run in Node environment — no browser APIs, no React rendering.
// They test BFF route handlers + infrastructure adapters end-to-end while MSW
// intercepts the actual fetch() calls to 101Digital APIs at the network level.
export default defineConfig({
  test: {
    name: "integration",
    environment: "node",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.integration.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    testTimeout: 15_000,
    hookTimeout: 10_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
