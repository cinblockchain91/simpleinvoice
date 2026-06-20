import { z } from "zod";
import { InvoiceSchema, InvoiceStatusSchema } from "./invoice.schema";

export const ListInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  status: InvoiceStatusSchema.optional(),
  keyword: z.string().optional(),
});

export type ListInvoicesQuery = z.infer<typeof ListInvoicesQuerySchema>;

export const ListInvoicesResponseSchema = z.object({
  data: z.array(InvoiceSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export type ListInvoicesResponse = z.infer<typeof ListInvoicesResponseSchema>;
