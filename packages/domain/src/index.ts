// shared
export * from "./shared/Result";
export type { PaginationParams, PaginatedResult } from "./shared/Pagination";

// auth
export type { LoginCredentials, AuthToken } from "./auth/AuthToken";
export type { AuthPort } from "./auth/AuthPort";
export type { AuthError } from "./auth/errors/AuthErrors";
export {
  InvalidCredentialsError,
  AuthServiceUnavailableError,
} from "./auth/errors/AuthErrors";
export { LoginUseCase } from "./auth/LoginUseCase";

// invoice
export type {
  InvoiceStatus,
  InvoiceItem,
  NewInvoiceItem,
  Invoice,
  CreateInvoiceData,
} from "./invoice/Invoice";
export type {
  ListInvoicesParams,
  InvoiceRepository,
} from "./invoice/InvoiceRepository";
export type { InvoiceError } from "./invoice/errors/InvoiceErrors";
export {
  InvoiceNotFoundError,
  InvoiceFetchError,
  InvoiceCreateError,
} from "./invoice/errors/InvoiceErrors";
export { CreateInvoiceUseCase } from "./invoice/CreateInvoiceUseCase";
