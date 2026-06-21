import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockBffFetch = vi.fn();

vi.mock("@/shared/api/bff-client", () => ({
  bffFetch: (...args: unknown[]) => mockBffFetch(...args),
  BffError: class BffError extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
      this.name = "BffError";
    }
  },
}));

import { useInvoiceList } from "./useInvoiceList";

// ── Helpers ───────────────────────────────────────────────────────────────────
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  }
  return Wrapper;
}

const MOCK_RESPONSE = {
  data: [
    {
      id: "inv-001",
      invoiceNumber: "INV-001",
      status: "DRAFT",
      currency: "USD",
      totalAmount: 1100,
      subTotal: 1000,
      taxAmount: 100,
      issueDate: "2026-06-21",
      dueDate: "2026-07-21",
      customerId: "cust-001",
      customerName: "Acme Corp",
      items: [],
      createdDate: "2026-06-21T00:00:00Z",
      modifiedDate: "2026-06-21T00:00:00Z",
    },
  ],
  total: 1,
  page: 1,
  pageSize: 10,
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("useInvoiceList", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("returns invoice list data on success", async () => {
    mockBffFetch.mockResolvedValue(MOCK_RESPONSE);
    const { result } = renderHook(
      () => useInvoiceList({ page: 1, pageSize: 10 }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.total).toBe(1);
  });

  it("calls bffFetch with page and pageSize as query params", async () => {
    mockBffFetch.mockResolvedValue(MOCK_RESPONSE);
    const { result } = renderHook(
      () => useInvoiceList({ page: 2, pageSize: 25 }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockBffFetch).toHaveBeenCalledWith(
      expect.stringContaining("page=2"),
    );
    expect(mockBffFetch).toHaveBeenCalledWith(
      expect.stringContaining("pageSize=25"),
    );
  });

  it("includes status param when status is provided (not ALL)", async () => {
    mockBffFetch.mockResolvedValue({ ...MOCK_RESPONSE, data: [] });
    const { result } = renderHook(
      () => useInvoiceList({ page: 1, pageSize: 10, status: "PENDING" }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockBffFetch).toHaveBeenCalledWith(
      expect.stringContaining("status=PENDING"),
    );
  });

  it("omits status param when status is ALL", async () => {
    mockBffFetch.mockResolvedValue({ ...MOCK_RESPONSE, data: [] });
    const { result } = renderHook(
      () => useInvoiceList({ page: 1, pageSize: 10, status: "ALL" }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockBffFetch).toHaveBeenCalledWith(
      expect.not.stringContaining("status="),
    );
  });

  it("includes trimmed keyword param when keyword is provided", async () => {
    mockBffFetch.mockResolvedValue({ ...MOCK_RESPONSE, data: [] });
    const { result } = renderHook(
      () => useInvoiceList({ page: 1, pageSize: 10, keyword: "  Acme  " }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockBffFetch).toHaveBeenCalledWith(
      expect.stringContaining("keyword=Acme"),
    );
  });

  it("returns error state when bffFetch fails", async () => {
    mockBffFetch.mockRejectedValue(new Error("Fetch failed"));
    const { result } = renderHook(
      () => useInvoiceList({ page: 1, pageSize: 10 }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
