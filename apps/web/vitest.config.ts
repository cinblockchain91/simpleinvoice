import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    name: "unit",
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    passWithNoTests: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "src/**/*.integration.{test,spec}.{ts,tsx}",
      "node_modules",
      ".next",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/shadcn/**", "src/**/*.{test,spec,stories}.{ts,tsx}"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
