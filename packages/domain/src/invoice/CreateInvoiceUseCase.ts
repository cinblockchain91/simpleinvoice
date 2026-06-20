import type { Result } from "../shared/Result";
import type { Invoice, CreateInvoiceData } from "./Invoice";
import type { InvoiceError } from "./errors/InvoiceErrors";
import type { InvoiceRepository } from "./InvoiceRepository";

export class CreateInvoiceUseCase {
  constructor(private readonly repository: InvoiceRepository) {}

  invoke(data: CreateInvoiceData): Promise<Result<Invoice, InvoiceError>> {
    return this.repository.create(data);
  }
}
