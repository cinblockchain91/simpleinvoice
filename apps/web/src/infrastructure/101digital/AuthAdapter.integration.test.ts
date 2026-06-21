import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import {
  InvalidCredentialsError,
  AuthServiceUnavailableError,
} from "@simpleinvoice/domain";
import { server } from "@/__tests__/msw/server";
import { AUTH_BASE, API_BASE } from "@/__tests__/msw/handlers";
import { AuthAdapter } from "./AuthAdapter";

const CREDENTIALS = { username: "user@example.com", password: "secret" };

describe("AuthAdapter", () => {
  describe("login()", () => {
    it("returns AuthToken with accessToken and orgToken on success", async () => {
      const adapter = new AuthAdapter();
      const result = await adapter.login(CREDENTIALS);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.accessToken).toBe("mock-access-token");
        expect(result.value.orgToken).toBe("mock-org-token");
      }
    });

    it("calls token endpoint with client credentials and user credentials", async () => {
      let capturedBody: URLSearchParams | null = null;

      server.use(
        http.post(
          `${AUTH_BASE}/t/101digital.core/oauth2/token`,
          async ({ request }) => {
            capturedBody = new URLSearchParams(await request.text());
            return HttpResponse.json({
              access_token: "mock-access-token",
              token_type: "Bearer",
              expires_in: 3600,
            });
          },
        ),
      );

      const adapter = new AuthAdapter();
      await adapter.login(CREDENTIALS);

      expect(capturedBody!.get("grant_type")).toBe("password");
      expect(capturedBody!.get("client_id")).toBe("test-client-id");
      expect(capturedBody!.get("client_secret")).toBe("test-client-secret");
      expect(capturedBody!.get("username")).toBe(CREDENTIALS.username);
      expect(capturedBody!.get("password")).toBe(CREDENTIALS.password);
    });

    it("returns InvalidCredentialsError when token endpoint returns 401", async () => {
      server.use(
        http.post(
          `${AUTH_BASE}/t/101digital.core/oauth2/token`,
          () => new HttpResponse(null, { status: 401 }),
        ),
      );

      const adapter = new AuthAdapter();
      const result = await adapter.login(CREDENTIALS);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidCredentialsError);
      }
    });

    it("returns InvalidCredentialsError when token endpoint returns 400", async () => {
      server.use(
        http.post(
          `${AUTH_BASE}/t/101digital.core/oauth2/token`,
          () => new HttpResponse(null, { status: 400 }),
        ),
      );

      const adapter = new AuthAdapter();
      const result = await adapter.login(CREDENTIALS);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidCredentialsError);
      }
    });

    it("returns AuthServiceUnavailableError when token endpoint returns 500", async () => {
      server.use(
        http.post(
          `${AUTH_BASE}/t/101digital.core/oauth2/token`,
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const adapter = new AuthAdapter();
      const result = await adapter.login(CREDENTIALS);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuthServiceUnavailableError);
      }
    });

    it("returns AuthServiceUnavailableError when membership endpoint fails", async () => {
      server.use(
        http.get(
          `${API_BASE}/membership-service/1.0.0/users/me`,
          () => new HttpResponse(null, { status: 503 }),
        ),
      );

      const adapter = new AuthAdapter();
      const result = await adapter.login(CREDENTIALS);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuthServiceUnavailableError);
      }
    });

    it("returns AuthServiceUnavailableError when membership has no token", async () => {
      server.use(
        http.get(`${API_BASE}/membership-service/1.0.0/users/me`, () =>
          HttpResponse.json({ data: { memberships: [] } }),
        ),
      );

      const adapter = new AuthAdapter();
      const result = await adapter.login(CREDENTIALS);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuthServiceUnavailableError);
        expect(result.error.message).toMatch(/No organisation/i);
      }
    });
  });
});
