import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockBffFetch = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

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

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

import { useCreateInvoice } from "./useCreateInvoice";

// ── Helpers ───────────────────────────────────────────────────────────────────
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
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

const VALID_PAYLOAD = {
  invoiceNumber: "INV-001",
  currency: "USD",
  issueDate: "2026-06-21",
  dueDate: "2026-07-21",
  customerName: "Acme Corp",
  customerEmail: "acme@example.com",
  items: [
    { description: "Consulting", quantity: 1, unitPrice: 500, taxRate: 0 },
  ],
};

const MOCK_INVOICE = {
  id: "inv-new",
  invoiceNumber: "INV-001",
  status: "DRAFT",
  currency: "USD",
  totalAmount: 500,
  subTotal: 500,
  taxAmount: 0,
  issueDate: "2026-06-21",
  dueDate: "2026-07-21",
  customerId: "",
  customerName: "Acme Corp",
  items: [],
  createdDate: "2026-06-21T00:00:00Z",
  modifiedDate: "2026-06-21T00:00:00Z",
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("useCreateInvoice", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls bffFetch with POST /api/invoices and the payload", async () => {
    mockBffFetch.mockResolvedValue(MOCK_INVOICE);
    const { result } = renderHook(() => useCreateInvoice(), {
      wrapper: createWrapper(),
    });
    await act(() => result.current.mutateAsync(VALID_PAYLOAD));
    expect(mockBffFetch).toHaveBeenCalledWith(
      "/api/invoices",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("INV-001"),
      }),
    );
  });

  it("shows success toast on successful mutation", async () => {
    mockBffFetch.mockResolvedValue(MOCK_INVOICE);
    const { result } = renderHook(() => useCreateInvoice(), {
      wrapper: createWrapper(),
    });
    await act(() => result.current.mutateAsync(VALID_PAYLOAD));
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalledOnce());
    expect(mockToastSuccess).toHaveBeenCalledWith("successMessage");
  });

  it("shows error toast on mutation failure", async () => {
    mockBffFetch.mockRejectedValue(new Error("API error"));
    const { result } = renderHook(() => useCreateInvoice(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      await result.current.mutateAsync(VALID_PAYLOAD).catch(() => {});
    });
    await waitFor(() => expect(mockToastError).toHaveBeenCalledOnce());
    expect(mockToastError).toHaveBeenCalledWith("errorMessage");
  });

  it("returns the created invoice data on success", async () => {
    mockBffFetch.mockResolvedValue(MOCK_INVOICE);
    const { result } = renderHook(() => useCreateInvoice(), {
      wrapper: createWrapper(),
    });
    const invoice = await act(() => result.current.mutateAsync(VALID_PAYLOAD));
    expect(invoice.id).toBe("inv-new");
  });
});
