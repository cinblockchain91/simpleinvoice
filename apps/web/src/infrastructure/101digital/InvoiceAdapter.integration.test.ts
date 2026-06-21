import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import {
  InvoiceFetchError,
  InvoiceCreateError,
  InvoiceNotFoundError,
} from "@simpleinvoice/domain";
import type { CreateInvoiceData } from "@simpleinvoice/domain";
import { server } from "@/__tests__/msw/server";
import { API_BASE, MOCK_API_INVOICE } from "@/__tests__/msw/handlers";
import { InvoiceAdapter } from "./InvoiceAdapter";

const ACCESS_TOKEN = "mock-access-token";
const ORG_TOKEN = "mock-org-token";

const MOCK_CREATE_DATA: CreateInvoiceData = {
  invoiceNumber: "INV-NEW-001",
  currency: "USD",
  issueDate: "2024-01-15",
  dueDate: "2024-02-15",
  customerId: "cust-001",
  customerName: "Acme Corp",
  items: [
    {
      description: "Consulting",
      quantity: 10,
      unitPrice: 100,
      taxRate: 10,
    },
  ],
};

describe("InvoiceAdapter", () => {
  describe("list()", () => {
    it("returns paginated invoice list with mapped domain fields", async () => {
      const adapter = new InvoiceAdapter(ACCESS_TOKEN, ORG_TOKEN);
      const result = await adapter.list({ page: 1, pageSize: 10 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.data).toHaveLength(1);
        expect(result.value.total).toBe(1);
        expect(result.value.page).toBe(1);
        expect(result.value.pageSize).toBe(10);

        const invoice = result.value.data[0];
        expect(invoice.id).toBe(MOCK_API_INVOICE.invoiceId);
        expect(invoice.invoiceNumber).toBe(MOCK_API_INVOICE.invoiceNumber);
        expect(invoice.currency).toBe("USD");
        expect(invoice.totalAmount).toBe(1100);
        expect(invoice.subTotal).toBe(1000);
        expect(invoice.taxAmount).toBe(100);
        expect(invoice.status).toBe("DRAFT");
        expect(invoice.customerId).toBe("cust-001");
        expect(invoice.customerName).toBe("Acme Corp");
      }
    });

    it("sends pageNum and pageSize as query params", async () => {
      let capturedUrl: URL | null = null;

      server.use(
        http.get(
          `${API_BASE}/invoice-service/1.0.0/invoices`,
          ({ request }) => {
            capturedUrl = new URL(request.url);
            return HttpResponse.json({ data: [], total: 0 });
          },
        ),
      );

      const adapter = new InvoiceAdapter(ACCESS_TOKEN, ORG_TOKEN);
      await adapter.list({ page: 2, pageSize: 25 });

      expect(capturedUrl!.searchParams.get("pageNum")).toBe("2");
      expect(capturedUrl!.searchParams.get("pageSize")).toBe("25");
    });

    it("sends statuses filter when status is provided", async () => {
      let capturedUrl: URL | null = null;

      server.use(
        http.get(
          `${API_BASE}/invoice-service/1.0.0/invoices`,
          ({ request }) => {
            capturedUrl = new URL(request.url);
            return HttpResponse.json({ data: [], total: 0 });
          },
        ),
      );

      const adapter = new InvoiceAdapter(ACCESS_TOKEN, ORG_TOKEN);
      await adapter.list({ page: 1, pageSize: 10, status: "DRAFT" });

      expect(capturedUrl!.searchParams.get("statuses")).toBe("DRAFT");
    });

    it("returns InvoiceFetchError when API returns 500", async () => {
      server.use(
        http.get(
          `${API_BASE}/invoice-service/1.0.0/invoices`,
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const adapter = new InvoiceAdapter(ACCESS_TOKEN, ORG_TOKEN);
      const result = await adapter.list({ page: 1, pageSize: 10 });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvoiceFetchError);
        expect((result.error as InvoiceFetchError).upstreamStatus).toBe(500);
      }
    });

    it("returns InvoiceFetchError with upstreamStatus 401 when token is rejected", async () => {
      server.use(
        http.get(
          `${API_BASE}/invoice-service/1.0.0/invoices`,
          () => new HttpResponse(null, { status: 401 }),
        ),
      );

      const adapter = new InvoiceAdapter(ACCESS_TOKEN, ORG_TOKEN);
      const result = await adapter.list({ page: 1, pageSize: 10 });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvoiceFetchError);
        expect((result.error as InvoiceFetchError).upstreamStatus).toBe(401);
      }
    });
  });

  describe("getById()", () => {
    it("returns invoice mapped from API response", async () => {
      const adapter = new InvoiceAdapter(ACCESS_TOKEN, ORG_TOKEN);
      const result = await adapter.getById(MOCK_API_INVOICE.invoiceId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(MOCK_API_INVOICE.invoiceId);
        expect(result.value.invoiceNumber).toBe(MOCK_API_INVOICE.invoiceNumber);
        expect(result.value.status).toBe("DRAFT");
      }
    });

    it("returns InvoiceNotFoundError when API returns 404", async () => {
      const adapter = new InvoiceAdapter(ACCESS_TOKEN, ORG_TOKEN);
      const result = await adapter.getById("non-existent-id");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvoiceNotFoundError);
      }
    });
  });

  describe("create()", () => {
    it("returns created invoice mapped from API response", async () => {
      const adapter = new InvoiceAdapter(ACCESS_TOKEN, ORG_TOKEN);
      const result = await adapter.create(MOCK_CREATE_DATA);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe("inv-new");
        expect(result.value.invoiceNumber).toBe("INV-2024-002");
        expect(result.value.status).toBe("DRAFT");
      }
    });

    it("sends Authorization and org-token headers", async () => {
      let capturedHeaders: Headers | null = null;

      server.use(
        http.post(
          `${API_BASE}/invoice-service/1.0.0/invoices`,
          ({ request }) => {
            capturedHeaders = request.headers;
            return HttpResponse.json({
              data: {
                ...MOCK_API_INVOICE,
                invoiceId: "inv-new",
                invoiceNumber: "INV-2024-002",
              },
            });
          },
        ),
      );

      const adapter = new InvoiceAdapter(ACCESS_TOKEN, ORG_TOKEN);
      await adapter.create(MOCK_CREATE_DATA);

      expect(capturedHeaders!.get("Authorization")).toBe(
        `Bearer ${ACCESS_TOKEN}`,
      );
      expect(capturedHeaders!.get("org-token")).toBe(ORG_TOKEN);
    });

    it("returns InvoiceCreateError with upstreamStatus when API fails", async () => {
      server.use(
        http.post(
          `${API_BASE}/invoice-service/1.0.0/invoices`,
          () => new HttpResponse(null, { status: 422 }),
        ),
      );

      const adapter = new InvoiceAdapter(ACCESS_TOKEN, ORG_TOKEN);
      const result = await adapter.create(MOCK_CREATE_DATA);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvoiceCreateError);
        expect((result.error as InvoiceCreateError).upstreamStatus).toBe(422);
      }
    });
  });
});
