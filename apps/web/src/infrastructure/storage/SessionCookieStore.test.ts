import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockSet, mockGet, mockDelete } = vi.hoisted(() => ({
  mockSet: vi.fn(),
  mockGet: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      set: mockSet,
      get: mockGet,
      delete: mockDelete,
    }),
}));

import { SessionCookieStore } from "./SessionCookieStore";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TOKEN = { accessToken: "acc-tok", orgToken: "org-tok" };

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SessionCookieStore", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("set()", () => {
    it("stores access_token and org_token as separate cookies", async () => {
      const store = new SessionCookieStore();
      await store.set(TOKEN);

      expect(mockSet).toHaveBeenCalledTimes(2);
      expect(mockSet).toHaveBeenCalledWith(
        "access_token",
        TOKEN.accessToken,
        expect.any(Object),
      );
      expect(mockSet).toHaveBeenCalledWith(
        "org_token",
        TOKEN.orgToken,
        expect.any(Object),
      );
    });

    it("sets httpOnly on both cookies", async () => {
      const store = new SessionCookieStore();
      await store.set(TOKEN);

      for (const call of mockSet.mock.calls) {
        expect(call[2]).toMatchObject({ httpOnly: true });
      }
    });

    it("sets sameSite=strict on both cookies", async () => {
      const store = new SessionCookieStore();
      await store.set(TOKEN);

      for (const call of mockSet.mock.calls) {
        expect(call[2]).toMatchObject({ sameSite: "strict" });
      }
    });

    it("sets path=/ on both cookies", async () => {
      const store = new SessionCookieStore();
      await store.set(TOKEN);

      for (const call of mockSet.mock.calls) {
        expect(call[2]).toMatchObject({ path: "/" });
      }
    });

    it("sets a positive maxAge on both cookies", async () => {
      const store = new SessionCookieStore();
      await store.set(TOKEN);

      for (const call of mockSet.mock.calls) {
        expect(call[2].maxAge).toBeGreaterThan(0);
      }
    });
  });

  describe("get()", () => {
    it("returns null when access_token cookie is absent", async () => {
      mockGet.mockReturnValue(undefined);
      const store = new SessionCookieStore();
      const result = await store.get();
      expect(result).toBeNull();
    });

    it("returns null when org_token cookie is absent", async () => {
      mockGet.mockImplementation((key: string) =>
        key === "access_token" ? { value: "tok" } : undefined,
      );
      const store = new SessionCookieStore();
      const result = await store.get();
      expect(result).toBeNull();
    });

    it("returns AuthToken when both cookies are present", async () => {
      mockGet.mockImplementation((key: string) =>
        key === "access_token"
          ? { value: TOKEN.accessToken }
          : { value: TOKEN.orgToken },
      );
      const store = new SessionCookieStore();
      const result = await store.get();
      expect(result).toEqual(TOKEN);
    });
  });

  describe("clear()", () => {
    it("deletes both access_token and org_token cookies", async () => {
      const store = new SessionCookieStore();
      await store.clear();

      expect(mockDelete).toHaveBeenCalledTimes(2);
      expect(mockDelete).toHaveBeenCalledWith("access_token");
      expect(mockDelete).toHaveBeenCalledWith("org_token");
    });
  });
});
