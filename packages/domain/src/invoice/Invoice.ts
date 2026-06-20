export type InvoiceStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "VOID";

export interface InvoiceItem {
  readonly id: string;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly amount: number;
  readonly taxRate: number;
  readonly taxAmount: number;
}

export interface NewInvoiceItem {
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly taxRate: number;
}

export interface Invoice {
  readonly id: string;
  readonly invoiceNumber: string;
  readonly status: InvoiceStatus;
  readonly currency: string;
  readonly totalAmount: number;
  readonly subTotal: number;
  readonly taxAmount: number;
  readonly issueDate: string;
  readonly dueDate: string;
  readonly customerId: string;
  readonly customerName: string;
  readonly items: readonly InvoiceItem[];
  readonly createdDate: string;
  readonly modifiedDate: string;
}

export interface CreateInvoiceData {
  readonly invoiceNumber: string;
  readonly currency: string;
  readonly issueDate: string;
  readonly dueDate: string;
  readonly customerId: string;
  readonly customerName: string;
  readonly items: readonly NewInvoiceItem[];
}
