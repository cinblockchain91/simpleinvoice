import { useQuery } from "@tanstack/react-query";
import { bffFetch } from "@/shared/api/bff-client";
import type { Invoice } from "@/entities/invoice";

export function useInvoiceDetail(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => bffFetch<Invoice>(`/api/invoices/${id}`),
    enabled: !!id,
  });
}
