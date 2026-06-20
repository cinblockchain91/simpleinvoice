import "server-only";
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
  CreateInvoiceData,
  InvoiceError,
} from "@simpleinvoice/domain";
import type { Result, PaginatedResult } from "@simpleinvoice/domain";
import { ListInvoicesResponseSchema } from "@simpleinvoice/api-contracts";
import { env } from "@/shared/config/env.server";

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
        return fail(new InvoiceFetchError(`API returned ${res.status}`));
      }

      const raw = await res.json();
      const parsed = ListInvoicesResponseSchema.safeParse(raw);
      if (!parsed.success) {
        return fail(
          new InvoiceFetchError(
            "Unexpected response shape from invoice service",
          ),
        );
      }

      const { data, total, page, pageSize } = parsed.data;
      return ok({
        data: data as readonly Invoice[],
        total,
        page,
        pageSize,
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

      if (res.status === 404) {
        return fail(new InvoiceNotFoundError(id));
      }
      if (!res.ok) {
        return fail(new InvoiceFetchError(`API returned ${res.status}`));
      }

      const raw = await res.json();
      return ok(raw?.data ?? (raw as Invoice));
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

      if (!res.ok) {
        return fail(new InvoiceCreateError(`API returned ${res.status}`));
      }

      const raw = await res.json();
      return ok(raw?.data ?? (raw as Invoice));
    } catch (err) {
      return fail(new InvoiceCreateError(String(err)));
    }
  }
}
