import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { InvoiceTable } from "./InvoiceTable";
import type { Invoice } from "@/entities/invoice";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

function renderTable(props: React.ComponentProps<typeof InvoiceTable>) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <InvoiceTable {...props} />
    </QueryClientProvider>,
  );
}

const INVOICE: Invoice = {
  id: "inv-001",
  invoiceNumber: "INV-001",
  status: "DRAFT",
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

describe("InvoiceTable", () => {
  it("renders all column headers", () => {
    renderTable({ invoices: [] });
    expect(screen.getByText("columns.invoiceNumber")).toBeInTheDocument();
    expect(screen.getByText("columns.customer")).toBeInTheDocument();
    expect(screen.getByText("columns.issueDate")).toBeInTheDocument();
    expect(screen.getByText("columns.dueDate")).toBeInTheDocument();
    expect(screen.getByText("columns.amount")).toBeInTheDocument();
    expect(screen.getByText("columns.status")).toBeInTheDocument();
  });

  it("shows empty message when invoice list is empty", () => {
    renderTable({ invoices: [] });
    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("shows skeleton rows when isLoading=true", () => {
    renderTable({ invoices: [], isLoading: true });
    expect(screen.queryByText("empty")).not.toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    // 1 header row + 5 skeleton rows
    expect(rows.length).toBe(6);
  });

  it("renders invoice number and customer name", () => {
    renderTable({ invoices: [INVOICE] });
    expect(screen.getByText("INV-001")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("renders the status badge for each invoice", () => {
    renderTable({ invoices: [INVOICE] });
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("renders multiple invoices as separate rows", () => {
    const invoices = [
      INVOICE,
      {
        ...INVOICE,
        id: "inv-002",
        invoiceNumber: "INV-002",
        status: "PENDING" as const,
      },
    ];
    renderTable({ invoices });
    expect(screen.getByText("INV-001")).toBeInTheDocument();
    expect(screen.getByText("INV-002")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });
});
