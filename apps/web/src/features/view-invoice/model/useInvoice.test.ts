import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────
// Define MockBffError in hoisted scope so it's accessible in test bodies AND
// can be exported from the vi.mock factory as BffError.
const { mockBffFetch, MockBffError } = vi.hoisted(() => {
  class MockBffError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.name = "BffError";
      this.status = status;
    }
  }
  return { mockBffFetch: vi.fn(), MockBffError };
});

vi.mock("@/shared/api/bff-client", () => ({
  bffFetch: (...args: unknown[]) => mockBffFetch(...args),
  BffError: MockBffError,
}));

import { useInvoice } from "./useInvoice";

// ── Helpers ───────────────────────────────────────────────────────────────────
function createWrapper(retryDelay = 0) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retryDelay } },
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

const MOCK_INVOICE = {
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
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("useInvoice", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns invoice data on success", async () => {
    mockBffFetch.mockResolvedValue(MOCK_INVOICE);
    const { result } = renderHook(() => useInvoice("inv-001"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("inv-001");
    expect(result.current.data?.invoiceNumber).toBe("INV-001");
  });

  it("calls bffFetch with the correct invoice endpoint", async () => {
    mockBffFetch.mockResolvedValue(MOCK_INVOICE);
    const { result } = renderHook(() => useInvoice("inv-abc"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockBffFetch).toHaveBeenCalledWith("/api/invoices/inv-abc");
  });

  it("returns error state on 404 (no retry expected)", async () => {
    // Use 404 BffError so the hook's retry function short-circuits immediately
    mockBffFetch.mockRejectedValue(new MockBffError(404, "Not Found"));
    const { result } = renderHook(() => useInvoice("inv-bad"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("does not retry on 404 BffError", async () => {
    mockBffFetch.mockRejectedValue(new MockBffError(404, "Not Found"));

    const { result } = renderHook(() => useInvoice("inv-404"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    // Retry function returns false for 404 — should only be called once
    expect(mockBffFetch).toHaveBeenCalledTimes(1);
  });

  it("retries on non-404 errors (up to 2 times)", async () => {
    mockBffFetch.mockRejectedValue(new MockBffError(500, "Server Error"));

    const { result } = renderHook(() => useInvoice("inv-500"), {
      wrapper: createWrapper(0), // retryDelay=0 for test speed
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    // hook retries failureCount < 2 → 0, 1 → retries, stops at 2 → 3 total calls
    expect(mockBffFetch).toHaveBeenCalledTimes(3);
  });
});
