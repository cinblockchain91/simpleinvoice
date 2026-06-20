import { z } from "zod";

export const InvoiceStatusSchema = z.enum([
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "VOID",
]);

export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const InvoiceItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  amount: z.number(),
  taxRate: z.number(),
  taxAmount: z.number(),
});

export type InvoiceItemDto = z.infer<typeof InvoiceItemSchema>;

export const InvoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  status: InvoiceStatusSchema,
  currency: z.string(),
  totalAmount: z.number(),
  subTotal: z.number(),
  taxAmount: z.number(),
  issueDate: z.string(),
  dueDate: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  items: z.array(InvoiceItemSchema),
  createdDate: z.string(),
  modifiedDate: z.string(),
});

export type InvoiceDto = z.infer<typeof InvoiceSchema>;
