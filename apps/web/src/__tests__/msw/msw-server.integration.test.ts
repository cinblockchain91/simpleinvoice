import { describe, expect, it } from "vitest";

// Smoke test: verifies MSW server intercepts fetch and returns mock data.
// Real adapter/route-handler integration tests live alongside their source files
// with the *.integration.test.ts suffix.
describe("MSW server", () => {
  it("intercepts POST /oauth2/token and returns mock access_token", async () => {
    const res = await fetch("https://sandbox.101digital.io/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=password&username=test&password=test",
    });

    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body).toMatchObject({ access_token: "mock-access-token" });
  });

  it("intercepts GET /invoice-service and returns mock invoice list", async () => {
    const res = await fetch(
      "https://sandbox.101digital.io/invoice-service/2.0.0/invoices",
    );

    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toMatchObject({ invoiceNumber: "INV-2024-001" });
  });
});
