import { describe, expect, it } from "vitest";
import {
  CreateInvoiceRequestSchema,
  InvoiceSchema,
  InvoiceStatusSchema,
  ListInvoicesQuerySchema,
  NewInvoiceItemSchema,
} from "@simpleinvoice/api-contracts";
import { LoginRequestSchema } from "@simpleinvoice/api-contracts";

// ── LoginRequestSchema ────────────────────────────────────────────────────────

describe("LoginRequestSchema", () => {
  it("accepts valid credentials", () => {
    const result = LoginRequestSchema.safeParse({
      username: "user@example.com",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty username", () => {
    const result = LoginRequestSchema.safeParse({
      username: "",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = LoginRequestSchema.safeParse({
      username: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(LoginRequestSchema.safeParse({}).success).toBe(false);
  });
});

// ── InvoiceStatusSchema ───────────────────────────────────────────────────────

describe("InvoiceStatusSchema", () => {
  it.each(["DRAFT", "PENDING", "APPROVED", "REJECTED", "VOID"])(
    "accepts %s as a valid status",
    (status) => {
      expect(InvoiceStatusSchema.safeParse(status).success).toBe(true);
    },
  );

  it("rejects unknown status values", () => {
    expect(InvoiceStatusSchema.safeParse("PAID").success).toBe(false);
    expect(InvoiceStatusSchema.safeParse("draft").success).toBe(false);
    expect(InvoiceStatusSchema.safeParse("").success).toBe(false);
  });
});

// ── InvoiceSchema ─────────────────────────────────────────────────────────────

describe("InvoiceSchema", () => {
  const VALID_INVOICE = {
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

  it("accepts a valid invoice", () => {
    expect(InvoiceSchema.safeParse(VALID_INVOICE).success).toBe(true);
  });

  it("rejects an invalid status", () => {
    expect(
      InvoiceSchema.safeParse({ ...VALID_INVOICE, status: "UNKNOWN" }).success,
    ).toBe(false);
  });

  it("rejects missing required fields", () => {
    const { id: _, ...withoutId } = VALID_INVOICE;
    expect(InvoiceSchema.safeParse(withoutId).success).toBe(false);
  });

  it("rejects non-numeric totalAmount", () => {
    expect(
      InvoiceSchema.safeParse({ ...VALID_INVOICE, totalAmount: "1100" })
        .success,
    ).toBe(false);
  });
});

// ── NewInvoiceItemSchema ──────────────────────────────────────────────────────

describe("NewInvoiceItemSchema", () => {
  const VALID_ITEM = {
    description: "Consulting",
    quantity: 2,
    unitPrice: 500,
    taxRate: 10,
  };

  it("accepts a valid item", () => {
    expect(NewInvoiceItemSchema.safeParse(VALID_ITEM).success).toBe(true);
  });

  it("rejects empty description", () => {
    expect(
      NewInvoiceItemSchema.safeParse({ ...VALID_ITEM, description: "" })
        .success,
    ).toBe(false);
  });

  it("rejects zero or negative quantity", () => {
    expect(
      NewInvoiceItemSchema.safeParse({ ...VALID_ITEM, quantity: 0 }).success,
    ).toBe(false);
    expect(
      NewInvoiceItemSchema.safeParse({ ...VALID_ITEM, quantity: -1 }).success,
    ).toBe(false);
  });

  it("accepts unitPrice of 0 (free items)", () => {
    expect(
      NewInvoiceItemSchema.safeParse({ ...VALID_ITEM, unitPrice: 0 }).success,
    ).toBe(true);
  });

  it("rejects negative unitPrice", () => {
    expect(
      NewInvoiceItemSchema.safeParse({ ...VALID_ITEM, unitPrice: -1 }).success,
    ).toBe(false);
  });

  it("rejects taxRate above 100", () => {
    expect(
      NewInvoiceItemSchema.safeParse({ ...VALID_ITEM, taxRate: 101 }).success,
    ).toBe(false);
  });

  it("accepts taxRate of 0", () => {
    expect(
      NewInvoiceItemSchema.safeParse({ ...VALID_ITEM, taxRate: 0 }).success,
    ).toBe(true);
  });
});

// ── CreateInvoiceRequestSchema ────────────────────────────────────────────────

describe("CreateInvoiceRequestSchema", () => {
  const VALID_REQUEST = {
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

  it("accepts a valid create request", () => {
    expect(CreateInvoiceRequestSchema.safeParse(VALID_REQUEST).success).toBe(
      true,
    );
  });

  it("rejects empty invoiceNumber", () => {
    expect(
      CreateInvoiceRequestSchema.safeParse({
        ...VALID_REQUEST,
        invoiceNumber: "",
      }).success,
    ).toBe(false);
  });

  it("rejects currency that is not 3 characters", () => {
    expect(
      CreateInvoiceRequestSchema.safeParse({
        ...VALID_REQUEST,
        currency: "US",
      }).success,
    ).toBe(false);
    expect(
      CreateInvoiceRequestSchema.safeParse({
        ...VALID_REQUEST,
        currency: "USDC",
      }).success,
    ).toBe(false);
  });

  it("rejects malformed issueDate", () => {
    expect(
      CreateInvoiceRequestSchema.safeParse({
        ...VALID_REQUEST,
        issueDate: "21-06-2026",
      }).success,
    ).toBe(false);
    expect(
      CreateInvoiceRequestSchema.safeParse({
        ...VALID_REQUEST,
        issueDate: "2026/06/21",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid customerEmail", () => {
    expect(
      CreateInvoiceRequestSchema.safeParse({
        ...VALID_REQUEST,
        customerEmail: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects empty items array", () => {
    expect(
      CreateInvoiceRequestSchema.safeParse({
        ...VALID_REQUEST,
        items: [],
      }).success,
    ).toBe(false);
  });

  it("rejects dueDate before issueDate", () => {
    expect(
      CreateInvoiceRequestSchema.safeParse({
        ...VALID_REQUEST,
        issueDate: "2026-07-01",
        dueDate: "2026-06-01",
      }).success,
    ).toBe(false);
  });

  it("accepts dueDate equal to issueDate", () => {
    expect(
      CreateInvoiceRequestSchema.safeParse({
        ...VALID_REQUEST,
        issueDate: "2026-06-21",
        dueDate: "2026-06-21",
      }).success,
    ).toBe(true);
  });
});

// ── ListInvoicesQuerySchema ───────────────────────────────────────────────────

describe("ListInvoicesQuerySchema", () => {
  it("uses defaults when no params are provided", () => {
    const result = ListInvoicesQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(10);
    }
  });

  it("coerces string numbers to integers", () => {
    const result = ListInvoicesQuerySchema.safeParse({
      page: "3",
      pageSize: "25",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.pageSize).toBe(25);
    }
  });

  it("rejects zero page", () => {
    expect(ListInvoicesQuerySchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects pageSize above 100", () => {
    expect(ListInvoicesQuerySchema.safeParse({ pageSize: 101 }).success).toBe(
      false,
    );
  });

  it("accepts valid status filter", () => {
    const result = ListInvoicesQuerySchema.safeParse({ status: "PENDING" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status filter", () => {
    expect(ListInvoicesQuerySchema.safeParse({ status: "PAID" }).success).toBe(
      false,
    );
  });

  it("passes keyword through unchanged", () => {
    const result = ListInvoicesQuerySchema.safeParse({ keyword: "Acme Corp" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.keyword).toBe("Acme Corp");
  });
});
