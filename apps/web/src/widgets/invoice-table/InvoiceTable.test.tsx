import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InvoiceTable } from "./InvoiceTable";
import type { Invoice } from "@/entities/invoice";

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
    render(<InvoiceTable invoices={[]} />);
    expect(screen.getByText("Invoice #")).toBeInTheDocument();
    expect(screen.getByText("Customer")).toBeInTheDocument();
    expect(screen.getByText("Issue Date")).toBeInTheDocument();
    expect(screen.getByText("Due Date")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("shows empty message when invoice list is empty", () => {
    render(<InvoiceTable invoices={[]} />);
    expect(screen.getByText("No invoices found.")).toBeInTheDocument();
  });

  it("shows skeleton rows when isLoading=true", () => {
    render(<InvoiceTable invoices={[]} isLoading />);
    expect(screen.queryByText("No invoices found.")).not.toBeInTheDocument();
    // 5 skeleton rows × 6 columns = 30 skeleton cells
    const skeletons = document.querySelectorAll(
      '[class*="skeleton"], [data-testid="skeleton"]',
    );
    // Just verify no empty state is shown and skeletons are rendered
    const rows = screen.getAllByRole("row");
    // 1 header row + 5 skeleton rows
    expect(rows.length).toBe(6);
  });

  it("renders invoice number and customer name", () => {
    render(<InvoiceTable invoices={[INVOICE]} />);
    expect(screen.getByText("INV-001")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("renders the status badge for each invoice", () => {
    render(<InvoiceTable invoices={[INVOICE]} />);
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
    render(<InvoiceTable invoices={invoices} />);
    expect(screen.getByText("INV-001")).toBeInTheDocument();
    expect(screen.getByText("INV-002")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });
});
