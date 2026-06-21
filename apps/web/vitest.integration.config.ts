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
    setupFiles: ["./src/__tests__/setup.integration.ts"],
    include: ["src/**/*.integration.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    testTimeout: 15_000,
    hookTimeout: 10_000,
    // These must match the constants in src/__tests__/msw/handlers.ts
    env: {
      DIGITAL_AUTH_BASE_URL: "https://auth.101digital.test",
      DIGITAL_API_BASE_URL: "https://api.101digital.test",
      DIGITAL_CLIENT_ID: "test-client-id",
      DIGITAL_CLIENT_SECRET: "test-client-secret",
      NODE_ENV: "test",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
