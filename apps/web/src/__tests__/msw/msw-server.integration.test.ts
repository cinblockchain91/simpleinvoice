import { describe, expect, it } from "vitest";
import { AUTH_BASE, API_BASE } from "./handlers";

describe("MSW server", () => {
  it("intercepts POST /oauth2/token and returns mock access_token", async () => {
    const res = await fetch(`${AUTH_BASE}/t/101digital.core/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=password&username=test&password=test",
    });

    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body).toMatchObject({ access_token: "mock-access-token" });
  });

  it("intercepts GET /membership-service and returns org token", async () => {
    const res = await fetch(`${API_BASE}/membership-service/1.0.0/users/me`);

    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body.data.memberships[0].token).toBe("mock-org-token");
  });

  it("intercepts GET /invoice-service and returns mock invoice list", async () => {
    const res = await fetch(
      `${API_BASE}/invoice-service/1.0.0/invoices?pageNum=1&pageSize=10`,
    );

    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toMatchObject({ invoiceNumber: "INV-2024-001" });
  });
});
