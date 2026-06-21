import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  ok,
  fail,
  InvoiceFetchError,
  InvoiceCreateError,
} from "@simpleinvoice/domain";

// ── Hoisted mock functions ────────────────────────────────────────────────────
const { mockCookieGet, mockAdapterList, mockAdapterCreate } = vi.hoisted(
  () => ({
    mockCookieGet: vi.fn(),
    mockAdapterList: vi.fn(),
    mockAdapterCreate: vi.fn(),
  }),
);

vi.mock("server-only", () => ({}));

vi.mock("next/cache", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unstable_cache: (fn: any) => fn,
  revalidateTag: vi.fn(),
}));

vi.mock("@/infrastructure/storage/SessionCookieStore", () => {
  const SessionCookieStore = vi.fn();
  SessionCookieStore.prototype.get = mockCookieGet;
  SessionCookieStore.prototype.set = vi.fn();
  SessionCookieStore.prototype.clear = vi.fn();
  return { SessionCookieStore };
});

vi.mock("@/infrastructure/101digital/InvoiceAdapter", () => {
  const InvoiceAdapter = vi.fn();
  InvoiceAdapter.prototype.list = mockAdapterList;
  InvoiceAdapter.prototype.create = mockAdapterCreate;
  InvoiceAdapter.prototype.getById = vi.fn();
  return { InvoiceAdapter };
});

import { GET, POST } from "./route";

// ── Fixtures ──────────────────────────────────────────────────────────────────
const SESSION = { accessToken: "access-abc", orgToken: "org-xyz" };

const MOCK_INVOICE = {
  id: "inv-001",
  invoiceNumber: "INV-001",
  status: "DRAFT" as const,
  currency: "USD",
  totalAmount: 1100,
  subTotal: 1000,
  taxAmount: 100,
  issueDate: "2026-06-21",
  dueDate: "2026-07-21",
  customerId: "cust-123",
  customerName: "Acme Corp",
  items: [],
  createdDate: "2026-06-21T00:00:00Z",
  modifiedDate: "2026-06-21T00:00:00Z",
};

const PAGINATED = { data: [MOCK_INVOICE], total: 1, page: 1, pageSize: 10 };

const VALID_CREATE_BODY = {
  invoiceNumber: "INV-002",
  currency: "USD",
  issueDate: "2026-06-21",
  dueDate: "2026-07-21",
  customerId: "cust-123",
  customerName: "Acme Corp",
  customerEmail: "acme@example.com",
  items: [
    { description: "Consulting", quantity: 1, unitPrice: 1000, taxRate: 10 },
  ],
};

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/invoices");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost/api/invoices", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// ── GET /api/invoices ─────────────────────────────────────────────────────────
describe("GET /api/invoices", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockCookieGet.mockResolvedValue(null);
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: "Unauthorized" });
  });

  it("returns 400 on invalid query parameters", async () => {
    mockCookieGet.mockResolvedValue(SESSION);
    const res = await GET(makeGetRequest({ page: "not-a-number" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      error: "Invalid query parameters",
    });
  });

  it("returns 502 when the invoice service fails", async () => {
    mockCookieGet.mockResolvedValue(SESSION);
    mockAdapterList.mockResolvedValue(
      fail(new InvoiceFetchError("upstream error")),
    );

    const res = await GET(makeGetRequest());
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({
      error: "Failed to fetch invoices",
    });
  });

  it("returns 200 with paginated invoice list on success", async () => {
    mockCookieGet.mockResolvedValue(SESSION);
    mockAdapterList.mockResolvedValue(ok(PAGINATED));

    const res = await GET(makeGetRequest({ page: "1", pageSize: "10" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].invoiceNumber).toBe("INV-001");
    expect(body.total).toBe(1);
  });
});

// ── POST /api/invoices ────────────────────────────────────────────────────────
describe("POST /api/invoices", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockCookieGet.mockResolvedValue(null);
    const res = await POST(makePostRequest(VALID_CREATE_BODY));
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: "Unauthorized" });
  });

  it("returns 400 on invalid body", async () => {
    mockCookieGet.mockResolvedValue(SESSION);
    const res = await POST(makePostRequest({ invoiceNumber: "INV-X" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Validation failed" });
  });

  it("returns 400 when body is not valid JSON", async () => {
    mockCookieGet.mockResolvedValue(SESSION);
    const req = new NextRequest("http://localhost/api/invoices", {
      method: "POST",
      body: "{bad-json}",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Invalid JSON" });
  });

  it("returns 502 when the invoice service fails", async () => {
    mockCookieGet.mockResolvedValue(SESSION);
    mockAdapterCreate.mockResolvedValue(
      fail(new InvoiceCreateError("upstream error")),
    );

    const res = await POST(makePostRequest(VALID_CREATE_BODY));
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({
      error: "Failed to create invoice",
    });
  });

  it("returns 201 with the created invoice on success", async () => {
    mockCookieGet.mockResolvedValue(SESSION);
    mockAdapterCreate.mockResolvedValue(ok(MOCK_INVOICE));

    const res = await POST(makePostRequest(VALID_CREATE_BODY));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.invoiceNumber).toBe("INV-001");
    expect(body.id).toBe("inv-001");
  });
});
