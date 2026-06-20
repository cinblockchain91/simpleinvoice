import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  ok,
  fail,
  InvalidCredentialsError,
  AuthServiceUnavailableError,
} from "@simpleinvoice/domain";

// ── Hoisted mock functions ────────────────────────────────────────────────────
const { mockLogin, mockCookieSet, mockCookieGet, mockCookieClear } = vi.hoisted(
  () => ({
    mockLogin: vi.fn(),
    mockCookieSet: vi.fn(),
    mockCookieGet: vi.fn(),
    mockCookieClear: vi.fn(),
  }),
);

vi.mock("server-only", () => ({}));

vi.mock("@/infrastructure/101digital/AuthAdapter", () => {
  const AuthAdapter = vi.fn();
  AuthAdapter.prototype.login = mockLogin;
  return { AuthAdapter };
});

vi.mock("@/infrastructure/storage/SessionCookieStore", () => {
  const SessionCookieStore = vi.fn();
  SessionCookieStore.prototype.get = mockCookieGet;
  SessionCookieStore.prototype.set = mockCookieSet;
  SessionCookieStore.prototype.clear = mockCookieClear;
  return { SessionCookieStore };
});

import { POST } from "./route";

// ── Helpers ───────────────────────────────────────────────────────────────────
const TOKEN = { accessToken: "access-abc", orgToken: "org-xyz" };
const VALID_BODY = { username: "user@example.com", password: "secret123" };

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when body is not valid JSON", async () => {
    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: "{not-json}",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Invalid JSON" });
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Validation failed" });
  });

  it("returns 400 when password is missing", async () => {
    const res = await POST(makeRequest({ username: "user@example.com" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.details.password).toBeDefined();
  });

  it("returns 401 on invalid credentials", async () => {
    mockLogin.mockResolvedValue(fail(new InvalidCredentialsError()));
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({
      error: expect.stringContaining("Invalid"),
    });
  });

  it("returns 503 when auth service is unavailable", async () => {
    mockLogin.mockResolvedValue(
      fail(new AuthServiceUnavailableError("timeout")),
    );
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({
      error: expect.stringContaining("unavailable"),
    });
  });

  it("sets session cookies and returns 200 on success", async () => {
    mockLogin.mockResolvedValue(ok(TOKEN));
    mockCookieSet.mockResolvedValue(undefined);

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mockCookieSet).toHaveBeenCalledExactlyOnceWith(TOKEN);
  });

  it("passes credentials to the auth adapter unchanged", async () => {
    mockLogin.mockResolvedValue(ok(TOKEN));
    mockCookieSet.mockResolvedValue(undefined);

    await POST(makeRequest(VALID_BODY));
    expect(mockLogin).toHaveBeenCalledWith(VALID_BODY);
  });
});
