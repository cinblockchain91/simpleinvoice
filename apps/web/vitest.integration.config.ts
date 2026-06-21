import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    name: "integration",
    environment: "node",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    passWithNoTests: true,
    include: ["src/**/*.integration.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    env: {
      DIGITAL_CLIENT_ID: "test-client-id",
      DIGITAL_CLIENT_SECRET: "test-client-secret",
      DIGITAL_AUTH_BASE_URL: "https://auth.101digital.test",
      DIGITAL_API_BASE_URL: "https://api.101digital.test",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // "server-only" throws in non-Next.js runtimes; no-op it for integration tests
      "server-only": path.resolve(
        __dirname,
        "./src/__tests__/mocks/server-only.ts",
      ),
    },
  },
});
