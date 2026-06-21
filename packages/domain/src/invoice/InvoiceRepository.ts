import type { Result } from "../shared/Result";
import type { PaginatedResult, PaginationParams } from "../shared/Pagination";
import type { Invoice, CreateInvoiceData, InvoiceStatus } from "./Invoice";
import type { InvoiceError } from "./errors/InvoiceErrors";

export interface ListInvoicesParams extends PaginationParams {
  readonly status?: InvoiceStatus;
  readonly keyword?: string;
}

export interface InvoiceRepository {
  list(
    params: ListInvoicesParams,
  ): Promise<Result<PaginatedResult<Invoice>, InvoiceError>>;
  getById(id: string): Promise<Result<Invoice, InvoiceError>>;
  create(data: CreateInvoiceData): Promise<Result<Invoice, InvoiceError>>;
}
