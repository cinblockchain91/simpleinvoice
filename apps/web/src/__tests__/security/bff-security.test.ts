/**
 * BFF Security Audit — verifies the properties listed in issue #42.
 *
 * These tests read source files and configuration to assert security
 * invariants that cannot be caught by TypeScript or ESLint alone.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// __dirname = apps/web/src/__tests__/security
const WEB = resolve(__dirname, "../../.."); // → apps/web
const ROOT = resolve(__dirname, "../../../../../"); // → monorepo root

function read(relPath: string): string {
  return readFileSync(resolve(WEB, relPath), "utf-8");
}

function rootRead(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), "utf-8");
}

// ── 1. No NEXT_PUBLIC_ secrets ────────────────────────────────────────────────

describe("No NEXT_PUBLIC_ secrets in source", () => {
  const files = [
    "src/shared/config/env.server.ts",
    "src/infrastructure/101digital/AuthAdapter.ts",
    "src/infrastructure/101digital/InvoiceAdapter.ts",
  ];

  it.each(files)("%s must not reference NEXT_PUBLIC_ prefix", (file) => {
    expect(read(file)).not.toContain("NEXT_PUBLIC_");
  });

  it(".env.example must not contain NEXT_PUBLIC_ secrets", () => {
    const example = read(".env.example");
    expect(example).not.toMatch(/NEXT_PUBLIC_.*SECRET/i);
    expect(example).not.toMatch(/NEXT_PUBLIC_.*TOKEN/i);
    expect(example).not.toMatch(/NEXT_PUBLIC_.*PASSWORD/i);
  });
});

// ── 2. Secrets are server-only ────────────────────────────────────────────────

describe("Secrets are server-only", () => {
  it("env.server.ts imports server-only", () => {
    expect(read("src/shared/config/env.server.ts")).toContain(
      'import "server-only"',
    );
  });

  it("AuthAdapter imports server-only", () => {
    expect(read("src/infrastructure/101digital/AuthAdapter.ts")).toContain(
      'import "server-only"',
    );
  });

  it("InvoiceAdapter imports server-only", () => {
    expect(read("src/infrastructure/101digital/InvoiceAdapter.ts")).toContain(
      'import "server-only"',
    );
  });

  it("SessionCookieStore imports server-only", () => {
    expect(read("src/infrastructure/storage/SessionCookieStore.ts")).toContain(
      'import "server-only"',
    );
  });
});

// ── 3. Tokens never in client storage ────────────────────────────────────────

describe("Tokens never stored in localStorage or sessionStorage", () => {
  const clientFiles = [
    "src/features/auth/ui/LoginForm.tsx",
    "src/features/auth/model/useLogin.ts",
    "src/shared/api/bff-client.ts",
  ];

  it.each(clientFiles)("%s must not use localStorage", (file) => {
    if (!existsSync(resolve(WEB, file))) return; // skip if feature not yet built
    expect(read(file)).not.toContain("localStorage");
    expect(read(file)).not.toContain("sessionStorage");
  });
});

// ── 4. .env.local is gitignored ───────────────────────────────────────────────

describe(".env files hygiene", () => {
  it(".gitignore must ignore .env.local", () => {
    const gitignore = rootRead(".gitignore");
    expect(gitignore).toContain(".env.local");
  });

  it(".env.example must not contain real secret values", () => {
    const example = read(".env.example");
    // Placeholders only — no real-looking tokens or secrets
    expect(example).not.toMatch(/client_secret\s*=\s*[a-zA-Z0-9]{20,}/);
    expect(example).not.toMatch(/access_token\s*=\s*[a-zA-Z0-9]{20,}/);
    expect(example).toContain("your_client_id_here");
    expect(example).toContain("your_client_secret_here");
  });
});

// ── 5. Security headers configured ───────────────────────────────────────────

describe("Security headers in next.config.ts", () => {
  const config = read("next.config.ts");

  it("sets X-Frame-Options", () => {
    expect(config).toContain("X-Frame-Options");
  });

  it("sets X-Content-Type-Options", () => {
    expect(config).toContain("X-Content-Type-Options");
  });

  it("sets Content-Security-Policy", () => {
    expect(config).toContain("Content-Security-Policy");
  });

  it("sets Strict-Transport-Security", () => {
    expect(config).toContain("Strict-Transport-Security");
  });

  it("sets Referrer-Policy", () => {
    expect(config).toContain("Referrer-Policy");
  });

  it("sets Permissions-Policy", () => {
    expect(config).toContain("Permissions-Policy");
  });

  it("CSP disallows object-src", () => {
    expect(config).toContain("object-src 'none'");
  });

  it("CSP disallows framing (frame-ancestors)", () => {
    expect(config).toContain("frame-ancestors 'none'");
  });
});

// ── 6. All 101Digital calls go through BFF ───────────────────────────────────

describe("101Digital API calls are proxied through /api/*", () => {
  it("bff-client.ts only calls /api/* (own origin)", () => {
    const client = read("src/shared/api/bff-client.ts");
    expect(client).not.toMatch(/https?:\/\//); // no absolute external URLs
  });

  it("login route handler proxies to 101Digital (not the client)", () => {
    const loginRoute = read("src/app/api/auth/login/route.ts");
    // Route handler imports AuthAdapter (server-side) to call 101Digital
    expect(loginRoute).toContain("AuthAdapter");
  });

  it("invoices route handler proxies to 101Digital (not the client)", () => {
    const invoicesRoute = read("src/app/api/invoices/route.ts");
    expect(invoicesRoute).toContain("InvoiceAdapter");
  });
});
