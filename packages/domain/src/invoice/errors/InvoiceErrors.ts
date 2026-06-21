export class InvoiceNotFoundError extends Error {
  readonly kind = "InvoiceNotFound" as const;
  constructor(id: string) {
    super(`Invoice not found: ${id}`);
    this.name = "InvoiceNotFoundError";
  }
}

export class InvoiceFetchError extends Error {
  readonly kind = "InvoiceFetchError" as const;
  constructor(
    cause: string,
    readonly upstreamStatus?: number,
  ) {
    super(`Failed to fetch invoices: ${cause}`);
    this.name = "InvoiceFetchError";
  }
}

export class InvoiceCreateError extends Error {
  readonly kind = "InvoiceCreateError" as const;
  constructor(
    cause: string,
    readonly upstreamStatus?: number,
  ) {
    super(`Failed to create invoice: ${cause}`);
    this.name = "InvoiceCreateError";
  }
}

export type InvoiceError =
  | InvoiceNotFoundError
  | InvoiceFetchError
  | InvoiceCreateError;
