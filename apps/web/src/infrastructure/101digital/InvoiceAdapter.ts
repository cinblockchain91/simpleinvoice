import "server-only";
import { z } from "zod";
import {
  ok,
  fail,
  InvoiceFetchError,
  InvoiceNotFoundError,
  InvoiceCreateError,
} from "@simpleinvoice/domain";
import type {
  InvoiceRepository,
  ListInvoicesParams,
  Invoice,
  InvoiceStatus,
  CreateInvoiceData,
  InvoiceError,
} from "@simpleinvoice/domain";
import type { Result, PaginatedResult } from "@simpleinvoice/domain";
import { env } from "@/shared/config/env.server";

// ─── Raw 101Digital response schemas ─────────────────────────────────────────

const ApiStatusSchema = z.array(
  z.object({ key: z.string(), value: z.boolean() }),
);

const ApiInvoiceSchema = z
  .object({
    invoiceId: z.string(),
    invoiceNumber: z.string(),
    currency: z.string(),
    invoiceDate: z.string(),
    dueDate: z.string(),
    invoiceSubTotal: z.number(),
    totalTax: z.number(),
    totalAmount: z.number(),
    status: ApiStatusSchema,
    customer: z.object({ id: z.string() }).passthrough(),
    createdAt: z.string().optional(),
  })
  .passthrough();

const ApiListResponseSchema = z
  .object({
    data: z.array(ApiInvoiceSchema),
    metadata: z
      .object({
        total: z.number().optional(),
        currentPage: z.number().optional(),
        pageSize: z.number().optional(),
      })
      .optional(),
    total: z.number().optional(),
    currentPage: z.number().optional(),
  })
  .passthrough();

// ─── Status mapping ───────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, InvoiceStatus> = {
  Draft: "DRAFT",
  Due: "PENDING",
  PartiallyPaid: "PENDING",
  Approved: "APPROVED",
  Paid: "APPROVED",
  Rejected: "REJECTED",
  Void: "VOID",
  Cancelled: "VOID",
};

function mapStatus(
  status: Array<{ key: string; value: boolean }>,
): InvoiceStatus {
  const active = status.find((s) => s.value)?.key ?? "";
  return STATUS_MAP[active] ?? "PENDING";
}

function mapApiInvoice(api: z.infer<typeof ApiInvoiceSchema>): Invoice {
  const customer = api.customer as { id: string; name?: string };
  return {
    id: api.invoiceId,
    invoiceNumber: api.invoiceNumber,
    status: mapStatus(api.status),
    currency: api.currency,
    totalAmount: api.totalAmount,
    subTotal: api.invoiceSubTotal,
    taxAmount: api.totalTax,
    issueDate: api.invoiceDate,
    dueDate: api.dueDate,
    customerId: customer.id,
    customerName: customer.name ?? customer.id,
    items: [],
    createdDate: api.createdAt ?? api.invoiceDate,
    modifiedDate: api.createdAt ?? api.invoiceDate,
  };
}

// ─── Adapter ─────────────────────────────────────────────────────────────────

export class InvoiceAdapter implements InvoiceRepository {
  constructor(
    private readonly accessToken: string,
    private readonly orgToken: string,
  ) {}

  async list(
    params: ListInvoicesParams,
  ): Promise<Result<PaginatedResult<Invoice>, InvoiceError>> {
    try {
      const query = new URLSearchParams({
        pageNum: String(params.page),
        pageSize: String(params.pageSize),
      });
      if (params.status) query.set("statuses", params.status);
      if (params.keyword) query.set("keyword", params.keyword);

      const res = await fetch(
        `${env.DIGITAL_API_BASE_URL}/invoice-service/1.0.0/invoices?${query}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "org-token": this.orgToken,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        console.error(`[InvoiceAdapter.list] ${res.status}:`, errBody);
        return fail(new InvoiceFetchError(`API returned ${res.status}`));
      }

      const raw = await res.json();
      const parsed = ApiListResponseSchema.safeParse(raw);
      if (!parsed.success) {
        console.error(
          "[InvoiceAdapter.list] Unexpected shape:",
          parsed.error.message,
        );
        return fail(new InvoiceFetchError("Unexpected response shape"));
      }

      const invoices = parsed.data.data.map(mapApiInvoice);
      const total =
        parsed.data.total ?? parsed.data.metadata?.total ?? invoices.length;

      return ok({
        data: invoices as readonly Invoice[],
        total,
        page: params.page,
        pageSize: params.pageSize,
      });
    } catch (err) {
      return fail(new InvoiceFetchError(String(err)));
    }
  }

  async getById(id: string): Promise<Result<Invoice, InvoiceError>> {
    try {
      const res = await fetch(
        `${env.DIGITAL_API_BASE_URL}/invoice-service/1.0.0/invoices/${id}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "org-token": this.orgToken,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      if (res.status === 404) return fail(new InvoiceNotFoundError(id));
      if (!res.ok)
        return fail(new InvoiceFetchError(`API returned ${res.status}`));

      const raw = await res.json();
      const apiInvoice = ApiInvoiceSchema.safeParse(raw?.data ?? raw);
      if (!apiInvoice.success)
        return fail(new InvoiceFetchError("Unexpected response shape"));

      return ok(mapApiInvoice(apiInvoice.data));
    } catch (err) {
      return fail(new InvoiceFetchError(String(err)));
    }
  }

  async create(
    data: CreateInvoiceData,
  ): Promise<Result<Invoice, InvoiceError>> {
    try {
      const res = await fetch(
        `${env.DIGITAL_API_BASE_URL}/invoice-service/1.0.0/invoices`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "org-token": this.orgToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          cache: "no-store",
        },
      );

      if (!res.ok)
        return fail(new InvoiceCreateError(`API returned ${res.status}`));

      const raw = await res.json();
      const apiInvoice = ApiInvoiceSchema.safeParse(raw?.data ?? raw);
      if (!apiInvoice.success)
        return fail(new InvoiceCreateError("Unexpected response shape"));

      return ok(mapApiInvoice(apiInvoice.data));
    } catch (err) {
      return fail(new InvoiceCreateError(String(err)));
    }
  }
}
