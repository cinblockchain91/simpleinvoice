import { z } from "zod";
import { InvoiceSchema } from "./invoice.schema";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const NewInvoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unitPrice: z.number().nonnegative("Unit price must be non-negative"),
  taxRate: z.number().min(0).max(100, "Tax rate must be between 0 and 100"),
});

export type NewInvoiceItem = z.infer<typeof NewInvoiceItemSchema>;

export const CreateInvoiceRequestSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  currency: z.string().length(3, "Currency must be a 3-letter ISO 4217 code"),
  issueDate: z
    .string()
    .regex(ISO_DATE, "Issue date must be in YYYY-MM-DD format"),
  dueDate: z.string().regex(ISO_DATE, "Due date must be in YYYY-MM-DD format"),
  customerId: z.string().min(1, "Customer ID is required"),
  customerName: z.string().min(1, "Customer name is required"),
  items: z
    .array(NewInvoiceItemSchema)
    .min(1, "At least one line item is required"),
});

export type CreateInvoiceRequest = z.infer<typeof CreateInvoiceRequestSchema>;

export const CreateInvoiceResponseSchema = z.object({
  data: InvoiceSchema,
});

export type CreateInvoiceResponse = z.infer<typeof CreateInvoiceResponseSchema>;
