import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      // Minimal placeholder env vars so Next.js starts up.
      // All /api/* routes are intercepted by Playwright route mocks in E2E tests,
      // so these values are never sent to 101Digital.
      DIGITAL_CLIENT_ID: process.env.DIGITAL_CLIENT_ID ?? "e2e-placeholder",
      DIGITAL_CLIENT_SECRET:
        process.env.DIGITAL_CLIENT_SECRET ?? "e2e-placeholder",
      DIGITAL_AUTH_BASE_URL:
        process.env.DIGITAL_AUTH_BASE_URL ?? "https://auth.example.test",
      DIGITAL_API_BASE_URL:
        process.env.DIGITAL_API_BASE_URL ?? "https://api.example.test",
    },
  },
});
