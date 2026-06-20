import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCookieClear } = vi.hoisted(() => ({
  mockCookieClear: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/infrastructure/storage/SessionCookieStore", () => {
  const SessionCookieStore = vi.fn();
  SessionCookieStore.prototype.get = vi.fn();
  SessionCookieStore.prototype.set = vi.fn();
  SessionCookieStore.prototype.clear = mockCookieClear;
  return { SessionCookieStore };
});

import { POST } from "./route";

describe("POST /api/auth/logout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("clears the session and returns 200", async () => {
    mockCookieClear.mockResolvedValue(undefined);

    const res = await POST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mockCookieClear).toHaveBeenCalledOnce();
  });
});
