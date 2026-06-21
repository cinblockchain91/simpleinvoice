import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  InvoiceFetchError,
  InvoiceNotFoundError,
  fail,
  ok,
} from "@simpleinvoice/domain";

// ── Hoisted mock functions ────────────────────────────────────────────────────
const { mockCookieGet, mockAdapterGetById } = vi.hoisted(() => ({
  mockCookieGet: vi.fn(),
  mockAdapterGetById: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/cache", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unstable_cache: (fn: any) => fn,
  revalidateTag: vi.fn(),
}));

vi.mock("@/infrastructure/storage/SessionCookieStore", () => {
  const SessionCookieStore = vi.fn();
  SessionCookieStore.prototype.get = mockCookieGet;
  return { SessionCookieStore };
});

vi.mock("@/infrastructure/101digital/InvoiceAdapter", () => {
  const InvoiceAdapter = vi.fn();
  InvoiceAdapter.prototype.getById = mockAdapterGetById;
  InvoiceAdapter.prototype.list = vi.fn();
  InvoiceAdapter.prototype.create = vi.fn();
  return { InvoiceAdapter };
});

import { GET } from "./route";

// ── Fixtures ──────────────────────────────────────────────────────────────────
const SESSION = { accessToken: "tok-abc", orgToken: "org-xyz" };

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

function makeRequest(id: string) {
  return new NextRequest(`http://localhost/api/invoices/${id}`);
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("GET /api/invoices/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockCookieGet.mockResolvedValue(null);
    const res = await GET(makeRequest("inv-001"), makeParams("inv-001"));
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: "Unauthorized" });
  });

  it("returns 404 when invoice is not found", async () => {
    mockCookieGet.mockResolvedValue(SESSION);
    mockAdapterGetById.mockResolvedValue(
      fail(new InvoiceNotFoundError("inv-999")),
    );
    const res = await GET(makeRequest("inv-999"), makeParams("inv-999"));
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: "Invoice not found" });
  });

  it("returns 502 on upstream service error", async () => {
    mockCookieGet.mockResolvedValue(SESSION);
    mockAdapterGetById.mockResolvedValue(
      fail(new InvoiceFetchError("upstream error", 500)),
    );
    const res = await GET(makeRequest("inv-001"), makeParams("inv-001"));
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({
      error: "Failed to fetch invoice",
    });
  });

  it("returns 200 with invoice data on success", async () => {
    mockCookieGet.mockResolvedValue(SESSION);
    mockAdapterGetById.mockResolvedValue(ok(MOCK_INVOICE));
    const res = await GET(makeRequest("inv-001"), makeParams("inv-001"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("inv-001");
    expect(body.invoiceNumber).toBe("INV-001");
    expect(body.customerName).toBe("Acme Corp");
  });

  it("passes the correct ID to the adapter", async () => {
    mockCookieGet.mockResolvedValue(SESSION);
    mockAdapterGetById.mockResolvedValue(ok(MOCK_INVOICE));
    await GET(makeRequest("inv-abc-123"), makeParams("inv-abc-123"));
    expect(mockAdapterGetById).toHaveBeenCalledWith("inv-abc-123");
  });
});
