import { describe, it, expect, vi } from "vitest";
import { CreateInvoiceUseCase } from "./CreateInvoiceUseCase";
import { ok, fail } from "../shared/Result";
import { InvoiceCreateError } from "./errors/InvoiceErrors";
import type { InvoiceRepository } from "./InvoiceRepository";
import type { Invoice, CreateInvoiceData } from "./Invoice";

const makeRepo = (
  result: Awaited<ReturnType<InvoiceRepository["create"]>>,
): InvoiceRepository => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn().mockResolvedValue(result),
});

const DATA: CreateInvoiceData = {
  invoiceNumber: "INV-001",
  currency: "USD",
  issueDate: "2026-06-21",
  dueDate: "2026-07-21",
  customerName: "Acme Corp",
  customerEmail: "acme@example.com",
  items: [
    { description: "Consulting", quantity: 2, unitPrice: 500, taxRate: 10 },
  ],
};

const INVOICE: Invoice = {
  id: "inv-abc",
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
  items: [
    {
      id: "item-1",
      description: "Consulting",
      quantity: 2,
      unitPrice: 500,
      amount: 1000,
      taxRate: 10,
      taxAmount: 100,
    },
  ],
  createdDate: "2026-06-21T00:00:00Z",
  modifiedDate: "2026-06-21T00:00:00Z",
};

describe("CreateInvoiceUseCase", () => {
  it("returns the created invoice on success", async () => {
    const repo = makeRepo(ok(INVOICE));
    const result = await new CreateInvoiceUseCase(repo).invoke(DATA);

    expect(result).toEqual(ok(INVOICE));
    expect(repo.create).toHaveBeenCalledWith(DATA);
  });

  it("propagates InvoiceCreateError", async () => {
    const error = new InvoiceCreateError("upstream 502");
    const repo = makeRepo(fail(error));
    const result = await new CreateInvoiceUseCase(repo).invoke(DATA);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(InvoiceCreateError);
      expect(result.error.kind).toBe("InvoiceCreateError");
      expect(result.error.message).toContain("upstream 502");
    }
  });

  it("delegates to the repository without modifying the data", async () => {
    const repo = makeRepo(ok(INVOICE));
    await new CreateInvoiceUseCase(repo).invoke(DATA);

    expect(repo.create).toHaveBeenCalledExactlyOnceWith(DATA);
  });

  it("does not call list or getById", async () => {
    const repo = makeRepo(ok(INVOICE));
    await new CreateInvoiceUseCase(repo).invoke(DATA);

    expect(repo.list).not.toHaveBeenCalled();
    expect(repo.getById).not.toHaveBeenCalled();
  });
});
